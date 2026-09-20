"""Development-only fallback runner.

This exists so the feature is usable on a machine without a running Docker
daemon. It is **not** a sandbox: the code runs as the API user, on the host
filesystem, with network access. It refuses to start outside development, and
every result it returns is flagged ``isolated=False`` so the UI can say plainly
that the code was not sandboxed.
"""

from __future__ import annotations

import asyncio
import os
import sys
import tempfile
import time
from pathlib import Path

from app.core.config import get_settings
from app.services.execution.base import (
    AbstractSandboxRunner,
    ExecutionLimits,
    ExecutionResult,
    ExecutionStatus,
)


class LocalSubprocessRunner(AbstractSandboxRunner):
    @property
    def name(self) -> str:
        return "local-subprocess"

    @property
    def isolated(self) -> bool:
        return False

    async def available(self) -> bool:
        # Never in production. Running untrusted code unsandboxed on a server
        # is exactly the failure this project's architecture is meant to avoid.
        return not get_settings().is_production

    async def run(self, code: str, limits: ExecutionLimits) -> ExecutionResult:
        if get_settings().is_production:
            return ExecutionResult(
                status=ExecutionStatus.UNAVAILABLE,
                stderr="The unsandboxed runner is disabled in production.",
                runner=self.name,
                isolated=False,
            )

        start = time.perf_counter()

        with tempfile.TemporaryDirectory(prefix="pbq-local-") as tmp:
            script = Path(tmp) / "main.py"
            script.write_text(code, encoding="utf-8")

            # A minimal environment; the parent's secrets are not inherited.
            env = {
                "PATH": os.environ.get("PATH", ""),
                "HOME": tmp,
                "PYTHONDONTWRITEBYTECODE": "1",
                "MPLBACKEND": "Agg",
            }
            if sys.platform == "win32":
                env["SYSTEMROOT"] = os.environ.get("SYSTEMROOT", "")

            try:
                proc = await asyncio.create_subprocess_exec(
                    sys.executable, "-I", "-B", str(script),
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                    cwd=tmp,
                    env=env,
                )
            except OSError as exc:
                return ExecutionResult(
                    status=ExecutionStatus.UNAVAILABLE,
                    stderr=f"Could not start the interpreter: {exc}",
                    runner=self.name,
                    isolated=False,
                    duration_ms=_elapsed(start),
                )

            try:
                stdout, stderr = await asyncio.wait_for(
                    proc.communicate(), timeout=limits.timeout_seconds
                )
            except TimeoutError:
                proc.kill()
                await proc.wait()
                return ExecutionResult(
                    status=ExecutionStatus.TIMEOUT,
                    stderr=f"Execution exceeded {limits.timeout_seconds}s and was stopped.",
                    runner=self.name,
                    isolated=False,
                    duration_ms=_elapsed(start),
                )

        return ExecutionResult(
            status=ExecutionStatus.OK if proc.returncode == 0 else ExecutionStatus.ERROR,
            stdout=_truncate(stdout.decode("utf-8", "replace"), limits.max_output_bytes),
            stderr=_truncate(stderr.decode("utf-8", "replace"), limits.max_output_bytes),
            exit_code=proc.returncode,
            runner=self.name,
            isolated=False,
            duration_ms=_elapsed(start),
            warnings=[
                "This code ran without sandbox isolation because no Docker "
                "daemon was available. Development only."
            ],
        )


def _elapsed(start: float) -> float:
    return round((time.perf_counter() - start) * 1000, 2)


def _truncate(text: str, limit: int) -> str:
    if len(text) <= limit:
        return text
    return text[:limit] + f"\n... output truncated at {limit} bytes ..."
