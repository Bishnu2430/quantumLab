"""Code execution endpoints.

The role split is the main security control, not an afterthought:

  learner     submits a *lesson slug*. The server runs its own copy of that
              lesson's snippet. No client-supplied code is ever executed, so
              the untrusted-code path does not exist for learners at all.
  researcher  submits arbitrary code, which runs in the sandbox.
  admin       as researcher.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.core.deps import CurrentUser
from app.db.models.user import Role
from app.services.execution.base import ExecutionLimits, ExecutionResult, ExecutionStatus
from app.services.execution.runner import execute, get_lesson_code, select_runner

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/execution", tags=["execution"])

MAX_CODE_LENGTH = 20_000


class LessonRunRequest(BaseModel):
    lessonSlug: str = Field(max_length=120, description="Slug of the lesson whose code to run")


class CodeRunRequest(BaseModel):
    code: str = Field(max_length=MAX_CODE_LENGTH, description="Python source to execute")


class ExecutionResponse(BaseModel):
    status: ExecutionStatus
    stdout: str
    stderr: str
    exitCode: int | None
    durationMs: float
    runner: str
    isolated: bool
    warnings: list[str]


class RunnerStatusResponse(BaseModel):
    available: bool
    runner: str
    isolated: bool
    message: str


@router.get("/status", response_model=RunnerStatusResponse)
async def runner_status(_: CurrentUser) -> RunnerStatusResponse:
    """What the client should expect before offering a Run button."""
    runner = await select_runner()
    if runner is None:
        return RunnerStatusResponse(
            available=False,
            runner="none",
            isolated=False,
            message="No execution sandbox is available. Start Docker to enable it.",
        )
    return RunnerStatusResponse(
        available=True,
        runner=runner.name,
        isolated=runner.isolated,
        message=(
            "Code runs in an isolated container with no network access."
            if runner.isolated
            else "Docker is unavailable, so code runs without sandbox isolation. "
                 "Development only."
        ),
    )


@router.post("/lesson", response_model=ExecutionResponse)
async def run_lesson_code(payload: LessonRunRequest, user: CurrentUser) -> ExecutionResponse:
    """Run the snippet that ships with a lesson.

    Available to every signed-in role, because the executed text comes from the
    server's own curriculum rather than from the request.
    """
    code = get_lesson_code(payload.lessonSlug)
    if code is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "NO_LESSON_CODE",
                "message": f"No runnable code is attached to '{payload.lessonSlug}'.",
            },
        )

    result = await execute(code)
    return _to_response(result)


@router.post("/run", response_model=ExecutionResponse)
async def run_arbitrary_code(payload: CodeRunRequest, user: CurrentUser) -> ExecutionResponse:
    """Run researcher-authored code in the sandbox."""
    if not user.role.satisfies(Role.RESEARCHER):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "INSUFFICIENT_ROLE",
                "message": (
                    "Writing and running your own code requires the researcher role. "
                    "As a learner you can still run the code that ships with each lesson."
                ),
                "requiredRole": Role.RESEARCHER.value,
                "currentRole": user.role.value,
            },
        )

    if not payload.code.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={"code": "EMPTY_CODE", "message": "There is nothing to run."},
        )

    logger.info("Researcher %s submitted %d bytes for execution", user.id, len(payload.code))
    result = await execute(payload.code, ExecutionLimits())
    return _to_response(result)


def _to_response(result: ExecutionResult) -> ExecutionResponse:
    return ExecutionResponse(
        status=result.status,
        stdout=result.stdout,
        stderr=result.stderr,
        exitCode=result.exit_code,
        durationMs=result.duration_ms,
        runner=result.runner,
        isolated=result.isolated,
        warnings=result.warnings,
    )
