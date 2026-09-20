"""Runner selection and the curriculum lookup that keeps learners safe."""

from __future__ import annotations

import json
import logging
from functools import lru_cache
from pathlib import Path
from typing import Any

from app.core.config import get_settings
from app.services.execution.base import (
    AbstractSandboxRunner,
    ExecutionLimits,
    ExecutionResult,
    ExecutionStatus,
)
from app.services.execution.docker_runner import DockerSandboxRunner
from app.services.execution.local_runner import LocalSubprocessRunner

logger = logging.getLogger(__name__)

# runner.py -> execution -> services -> app -> api -> apps -> repo root
CURRICULUM_PATH = (
    Path(__file__).resolve().parents[5] / "packages" / "curriculum" / "curriculum.json"
)


@lru_cache
def _load_curriculum() -> dict[str, Any]:
    """Load the exported curriculum, or an empty one if it has not been built."""
    if not CURRICULUM_PATH.exists():
        logger.warning(
            "Curriculum artifact missing at %s; lesson code execution is unavailable. "
            "Run `npm run content:export` in apps/web.",
            CURRICULUM_PATH,
        )
        return {"lessons": []}
    return json.loads(CURRICULUM_PATH.read_text(encoding="utf-8"))


def get_lesson_code(slug: str) -> str | None:
    """Return the code snippet a lesson ships, or None.

    This is what lets a learner run code without ever submitting any: the
    client sends a lesson slug and the server supplies the known-good snippet
    from its own copy of the curriculum. Nothing the client sends is executed.
    """
    for lesson in _load_curriculum().get("lessons", []):
        if lesson.get("slug") == slug:
            code = lesson.get("code")
            return code.get("code") if code else None
    return None


async def select_runner() -> AbstractSandboxRunner | None:
    """Pick the best available runner: Docker first, local fallback second."""
    docker = DockerSandboxRunner()
    if await docker.available():
        return docker

    local = LocalSubprocessRunner()
    if await local.available():
        logger.warning(
            "Docker is unavailable; falling back to the unsandboxed local runner. "
            "This is permitted in development only."
        )
        return local

    return None


async def execute(code: str, limits: ExecutionLimits | None = None) -> ExecutionResult:
    """Run `code` on whichever runner is available."""
    runner = await select_runner()
    if runner is None:
        return ExecutionResult(
            status=ExecutionStatus.UNAVAILABLE,
            stderr=(
                "No execution sandbox is available. Start Docker, or run the API "
                "in development mode to use the local fallback."
            ),
            runner="none",
            isolated=False,
        )

    settings = get_settings()
    effective = limits or ExecutionLimits()
    result = await runner.run(code, effective)

    if not result.isolated and settings.is_production:
        # Defence in depth: the local runner already refuses in production, but
        # an unsandboxed result must never be served there under any path.
        return ExecutionResult(
            status=ExecutionStatus.UNAVAILABLE,
            stderr="Refusing to return unsandboxed output in production.",
            runner=result.runner,
            isolated=False,
        )

    return result
