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
import tempfile
import time
from pathlib import Path

from app.services.execution.base import (
    AbstractSandboxRunner,
    ExecutionLimits,
    ExecutionResult,
    ExecutionStatus,
)

logger = logging.getLogger(__name__)

DEFAULT_IMAGE = "pbquantum/sandbox:latest"


class DockerSandboxRunner(AbstractSandboxRunner):
    def __init__(self, image: str = DEFAULT_IMAGE) -> None:
        self._image = image

    @property
    def name(self) -> str:
        return "docker"

    @property
    def isolated(self) -> bool:
        return True

    async def available(self) -> bool:
        if shutil.which("docker") is None:
            return False
        try:
            proc = await asyncio.create_subprocess_exec(
                "docker", "info", "--format", "{{.ServerVersion}}",
                stdout=asyncio.subprocess.DEVNULL,
                stderr=asyncio.subprocess.DEVNULL,
            )
            return await asyncio.wait_for(proc.wait(), timeout=5) == 0
        except (TimeoutError, OSError):
            return False

    def _docker_args(self, script_dir: Path, limits: ExecutionLimits) -> list[str]:
        return [
            "docker", "run",
            "--rm",
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
            "--workdir", "/sandbox",
            "-v", f"{script_dir.as_posix()}:/sandbox:ro",
            self._image,
            "python", "-I", "-B", "/sandbox/main.py",
        ]

    async def run(self, code: str, limits: ExecutionLimits) -> ExecutionResult:
        start = time.perf_counter()

        with tempfile.TemporaryDirectory(prefix="pbq-sandbox-") as tmp:
            script_dir = Path(tmp)
            (script_dir / "main.py").write_text(code, encoding="utf-8")

            try:
                proc = await asyncio.create_subprocess_exec(
                    *self._docker_args(script_dir, limits),
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
                    proc.communicate(), timeout=limits.timeout_seconds + 5
                )
            except TimeoutError:
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


def _elapsed(start: float) -> float:
    return round((time.perf_counter() - start) * 1000, 2)


def _truncate(text: str, limit: int) -> str:
    if len(text) <= limit:
        return text
    return text[:limit] + f"\n... output truncated at {limit} bytes ..."
