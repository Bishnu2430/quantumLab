"""Docker-backed sandbox.

Each execution gets a fresh container that is destroyed afterwards. The
container has no network, a read-only root filesystem, dropped capabilities, a
non-root user, and hard limits on memory, CPU and process count. Nothing from
one execution can survive into the next.
"""

from __future__ import annotations

import asyncio
import logging
import shutil
import time
import uuid

from app.services.execution.base import (
    AbstractSandboxRunner,
    ExecutionLimits,
    ExecutionResult,
    ExecutionStatus,
)

logger = logging.getLogger(__name__)

DEFAULT_IMAGE = "quantumlab/sandbox:latest"
SANDBOX_LABEL = "app=quantum-lab-sandbox"

# A healthy daemon starts a trivial container well inside this. Anything
# slower means the sandbox is not usable, whatever `docker info` reports.
PROBE_TIMEOUT_SECONDS = 20
PROBE_CACHE_SECONDS = 60


class DockerSandboxRunner(AbstractSandboxRunner):
    def __init__(self, image: str = DEFAULT_IMAGE) -> None:
        self._image = image
        self._probe_result: bool | None = None
        self._probe_at = 0.0

    @property
    def name(self) -> str:
        return "docker"

    @property
    def isolated(self) -> bool:
        return True

    async def available(self) -> bool:
        """Whether Docker can actually run a container right now.

        Checking `docker info` alone is not enough. A daemon can answer status
        queries while being unable to start containers — when that happens every
        execution stalls and gets reported to the learner as *their* code timing
        out, which is both wrong and unhelpful. So the probe starts a real
        container and requires it to finish quickly.

        The result is cached briefly, because this costs a container start and
        the answer does not change from one request to the next.
        """
        if shutil.which("docker") is None:
            return False

        now = time.monotonic()
        if self._probe_result is not None and now - self._probe_at < PROBE_CACHE_SECONDS:
            return self._probe_result

        ok = await self._probe()
        self._probe_result = ok
        self._probe_at = now
        if not ok:
            logger.warning(
                "Docker is installed but could not start a container within "
                "%ss; treating the sandbox as unavailable.",
                PROBE_TIMEOUT_SECONDS,
            )
        return ok

    async def _probe(self) -> bool:
        try:
            proc = await asyncio.create_subprocess_exec(
                "docker", "run", "--rm", "--network", "none",
                "--label", SANDBOX_LABEL,
                self._image, "python", "-c", "pass",
                stdout=asyncio.subprocess.DEVNULL,
                stderr=asyncio.subprocess.DEVNULL,
            )
        except OSError:
            return False

        try:
            return await asyncio.wait_for(proc.wait(), timeout=PROBE_TIMEOUT_SECONDS) == 0
        except TimeoutError:
            proc.kill()
            await proc.wait()
            return False

    def _docker_args(self, limits: ExecutionLimits, name: str) -> list[str]:
        return [
            "docker", "run",
            "--rm",
            # The script arrives on stdin rather than through a bind mount.
            # A mount would name a path on the *daemon's* host, which is not
            # the API container's filesystem when the socket is shared in —
            # and it makes the runner immune to host path translation.
            "-i",
            # Named and labelled so a run that outlives its client can
            # still be found and stopped.
            "--name", name,
            "--label", SANDBOX_LABEL,
            # No network at all: the code cannot exfiltrate anything or reach
            # internal services, and cannot pull in unpinned dependencies.
            "--network", "none",
            "--memory", f"{limits.memory_mb}m",
            # Without a matching swap limit the memory cap can be evaded.
            "--memory-swap", f"{limits.memory_mb}m",
            "--cpus", str(limits.cpus),
            "--pids-limit", str(limits.max_processes),
            "--read-only",
            # The only writable surface, capped and wiped with the container.
            "--tmpfs", "/tmp:rw,noexec,nosuid,size=64m",
            "--cap-drop", "ALL",
            "--security-opt", "no-new-privileges",
            "--user", "1001:1001",
            "--workdir", "/tmp",
            self._image,
            "python", "-I", "-B", "-",
        ]

    async def run(self, code: str, limits: ExecutionLimits) -> ExecutionResult:
        start = time.perf_counter()
        container = f"quantum-sandbox-{uuid.uuid4().hex[:12]}"

        try:
            proc = await asyncio.create_subprocess_exec(
                *self._docker_args(limits, container),
                stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
        except OSError as exc:
            logger.warning("Failed to start the sandbox container: %s", exc)
            return ExecutionResult(
                status=ExecutionStatus.UNAVAILABLE,
                stderr="Could not start the sandbox.",
                runner=self.name,
                duration_ms=_elapsed(start),
            )

        try:
            # A second of slack over the in-container limit, so the
            # container's own timeout reports first where possible.
            stdout, stderr = await asyncio.wait_for(
                proc.communicate(code.encode("utf-8")), timeout=limits.timeout_seconds + 5
            )
        except TimeoutError:
            # proc is the `docker run` client. Killing it detaches from the
            # container but leaves it running, so the container itself must be
            # removed or a runaway loop keeps a core busy forever.
            await _force_remove(container)
            proc.kill()
            await proc.wait()
            return ExecutionResult(
                status=ExecutionStatus.TIMEOUT,
                stderr=f"Execution exceeded {limits.timeout_seconds}s and was stopped.",
                runner=self.name,
                duration_ms=_elapsed(start),
            )

        exit_code = proc.returncode
        out = _truncate(stdout.decode("utf-8", "replace"), limits.max_output_bytes)
        err = _truncate(stderr.decode("utf-8", "replace"), limits.max_output_bytes)

        # 137 is SIGKILL, which for a memory-capped container means the OOM
        # killer stopped it. Worth naming, because "killed" alone is confusing.
        if exit_code == 137:
            return ExecutionResult(
                status=ExecutionStatus.OUT_OF_MEMORY,
                stdout=out,
                stderr=f"Execution exceeded the {limits.memory_mb} MB memory limit.",
                exit_code=exit_code,
                runner=self.name,
                duration_ms=_elapsed(start),
            )

        return ExecutionResult(
            status=ExecutionStatus.OK if exit_code == 0 else ExecutionStatus.ERROR,
            stdout=out,
            stderr=err,
            exit_code=exit_code,
            runner=self.name,
            duration_ms=_elapsed(start),
        )


async def _force_remove(container: str) -> None:
    """Remove a container regardless of its state, ignoring failures."""
    try:
        proc = await asyncio.create_subprocess_exec(
            "docker", "rm", "--force", container,
            stdout=asyncio.subprocess.DEVNULL,
            stderr=asyncio.subprocess.DEVNULL,
        )
        await asyncio.wait_for(proc.wait(), timeout=15)
    except (TimeoutError, OSError) as exc:
        logger.error("Could not remove sandbox container %s: %s", container, exc)


async def reap_orphaned_sandboxes() -> int:
    """Remove any sandbox containers left behind by a crash or restart.

    Called on startup: without it, a container that outlived the API process
    would keep consuming CPU with nothing left to stop it.
    """
    try:
        proc = await asyncio.create_subprocess_exec(
            "docker", "ps", "--quiet", "--filter", f"label={SANDBOX_LABEL}",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.DEVNULL,
        )
        stdout, _ = await asyncio.wait_for(proc.communicate(), timeout=15)
    except (TimeoutError, OSError):
        return 0

    ids = [line for line in stdout.decode().split() if line]
    for container_id in ids:
        await _force_remove(container_id)
    if ids:
        logger.warning("Reaped %d orphaned sandbox container(s).", len(ids))
    return len(ids)


def _elapsed(start: float) -> float:
    return round((time.perf_counter() - start) * 1000, 2)


def _truncate(text: str, limit: int) -> str:
    if len(text) <= limit:
        return text
    return text[:limit] + f"\n... output truncated at {limit} bytes ..."
