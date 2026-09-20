"""Code execution: limits, role boundaries, and the learner safety property.

The property that matters most is that a learner's request never carries code.
They send a lesson slug and the server runs its own copy, so the
untrusted-code path does not exist for that role at all.
"""

from __future__ import annotations

import pytest
from httpx import AsyncClient
from tests.conftest import promote

from app.services.execution.base import ExecutionLimits, ExecutionStatus
from app.services.execution.runner import execute

pytestmark = pytest.mark.asyncio

VALID_PASSWORD = "correct-horse-battery-7"


# --- the runner itself ----------------------------------------------------

async def test_successful_execution_captures_stdout() -> None:
    result = await execute("print('hello from the sandbox')")
    assert result.status is ExecutionStatus.OK
    assert "hello from the sandbox" in result.stdout
    assert result.exit_code == 0


async def test_failing_code_reports_the_error_rather_than_crashing() -> None:
    result = await execute("raise ValueError('boom')")
    assert result.status is ExecutionStatus.ERROR
    assert result.exit_code != 0
    assert "ValueError: boom" in result.stderr


async def test_infinite_loop_is_stopped_by_the_timeout() -> None:
    result = await execute("while True: pass", ExecutionLimits(timeout_seconds=3))
    assert result.status is ExecutionStatus.TIMEOUT
    assert "exceeded" in result.stderr


async def test_output_is_truncated_rather_than_unbounded() -> None:
    """A runaway print loop must not be able to exhaust server memory."""
    result = await execute(
        "for _ in range(100000): print('x' * 80)",
        ExecutionLimits(timeout_seconds=30, max_output_bytes=5_000),
    )
    assert len(result.stdout) <= 5_200  # the cap, plus the truncation notice
    assert "truncated" in result.stdout


async def test_qiskit_is_available_to_executed_code() -> None:
    """Lesson snippets import qiskit, so the runtime must provide it."""
    result = await execute(
        "from qiskit import QuantumCircuit\n"
        "from qiskit.quantum_info import Statevector\n"
        "qc = QuantumCircuit(1)\n"
        "qc.h(0)\n"
        "qc.h(0)\n"
        "print(round(abs(Statevector.from_instruction(qc).data[0])**2, 6))"
    )
    assert result.status is ExecutionStatus.OK
    assert "1.0" in result.stdout


# --- role boundaries ------------------------------------------------------

async def test_execution_requires_authentication(client: AsyncClient) -> None:
    client.cookies.clear()
    response = await client.post("/api/v1/execution/run", json={"code": "print(1)"})
    assert response.status_code == 401


async def test_learner_cannot_run_arbitrary_code(
    client: AsyncClient, registered_user: dict
) -> None:
    response = await client.post("/api/v1/execution/run", json={"code": "print(1)"})
    assert response.status_code == 403
    detail = response.json()["detail"]
    assert detail["code"] == "INSUFFICIENT_ROLE"
    assert detail["requiredRole"] == "researcher"
    # The message must point at what the learner *can* do, not just refuse.
    assert "lesson" in detail["message"].lower()


async def test_researcher_can_run_arbitrary_code(
    client: AsyncClient, registered_user: dict, db_session
) -> None:
    await promote(db_session, registered_user["email"], "researcher")
    response = await client.post(
        "/api/v1/execution/run", json={"code": "print('researcher output')"}
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert "researcher output" in body["stdout"]


async def test_empty_code_is_rejected(
    client: AsyncClient, registered_user: dict, db_session
) -> None:
    await promote(db_session, registered_user["email"], "researcher")
    response = await client.post("/api/v1/execution/run", json={"code": "   \n  "})
    assert response.status_code == 422


async def test_oversized_submissions_are_rejected(
    client: AsyncClient, registered_user: dict, db_session
) -> None:
    await promote(db_session, registered_user["email"], "researcher")
    response = await client.post("/api/v1/execution/run", json={"code": "x = 1\n" * 10_000})
    assert response.status_code == 422


# --- the learner path -----------------------------------------------------

async def test_unknown_lesson_slug_is_a_404(
    client: AsyncClient, registered_user: dict
) -> None:
    response = await client.post(
        "/api/v1/execution/lesson", json={"lessonSlug": "no-such-lesson"}
    )
    assert response.status_code == 404
    assert response.json()["detail"]["code"] == "NO_LESSON_CODE"


async def test_learner_runs_lesson_code_without_submitting_any(
    client: AsyncClient, registered_user: dict
) -> None:
    """The request body carries a slug, never source. This is the whole point:
    a learner cannot execute anything the curriculum does not already ship."""
    response = await client.post(
        "/api/v1/execution/lesson", json={"lessonSlug": "superposition-and-hadamard"}
    )
    if response.status_code == 404:
        pytest.skip("Curriculum artifact not exported; run `npm run content:export`.")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    # Lesson 6 prints the interference result; this is its own claim, executed.
    assert "P(1) = 0.000000" in body["stdout"]


async def test_lesson_endpoint_ignores_any_code_in_the_request(
    client: AsyncClient, registered_user: dict
) -> None:
    """Extra fields must not become an execution path for a learner."""
    response = await client.post(
        "/api/v1/execution/lesson",
        json={
            "lessonSlug": "superposition-and-hadamard",
            "code": "print('INJECTED')",
        },
    )
    if response.status_code == 404:
        pytest.skip("Curriculum artifact not exported.")
    assert response.status_code == 200
    assert "INJECTED" not in response.json()["stdout"]


# --- status ---------------------------------------------------------------

async def test_status_reports_whether_isolation_is_real(
    client: AsyncClient, registered_user: dict
) -> None:
    response = await client.get("/api/v1/execution/status")
    assert response.status_code == 200
    body = response.json()
    assert body["available"] is True
    # Whatever the runner, the client must be told plainly whether the code is
    # actually sandboxed so it can warn the user.
    assert isinstance(body["isolated"], bool)
    assert body["message"]
