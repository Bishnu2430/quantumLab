"""Sandboxed execution of Python code.

Two runners implement this interface: a Docker runner that starts a locked-down
container per execution, and a local subprocess runner used only for
development on machines without a Docker daemon. The local runner is *not*
isolation and refuses to start outside development.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import StrEnum


class ExecutionStatus(StrEnum):
    OK = "ok"
    ERROR = "error"
    TIMEOUT = "timeout"
    OUT_OF_MEMORY = "out_of_memory"
    UNAVAILABLE = "unavailable"


@dataclass(frozen=True)
class ExecutionLimits:
    """Resource ceilings applied to every execution.

    Chosen so a lesson snippet finishes comfortably while a runaway loop or an
    allocation bomb is stopped before it affects the host.
    """

    timeout_seconds: int = 20
    memory_mb: int = 512
    cpus: float = 1.0
    max_processes: int = 64
    max_output_bytes: int = 64_000


@dataclass
class ExecutionResult:
    status: ExecutionStatus
    stdout: str = ""
    stderr: str = ""
    exit_code: int | None = None
    duration_ms: float = 0.0
    runner: str = "unknown"
    # False means a development fallback ran the code without real isolation,
    # so the result must not be trusted for untrusted input.
    isolated: bool = True
    warnings: list[str] = field(default_factory=list)


class SandboxUnavailableError(RuntimeError):
    """Raised when no runner can service the request."""


class AbstractSandboxRunner(ABC):
    """Executes a Python script and returns its captured output."""

    @property
    @abstractmethod
    def name(self) -> str: ...

    @property
    @abstractmethod
    def isolated(self) -> bool:
        """True when the runner provides real isolation from the host."""

    @abstractmethod
    async def available(self) -> bool:
        """Whether this runner can currently accept work."""

    @abstractmethod
    async def run(self, code: str, limits: ExecutionLimits) -> ExecutionResult: ...
