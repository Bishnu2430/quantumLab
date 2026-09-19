"""Curriculum verification.

Every claim a lesson makes about a circuit is checked against the real
simulator here. If a lesson states that H followed by H yields P(1) = 0 and
Qiskit disagrees, this suite fails and the content does not ship.

This is the mechanism behind "only correct content reaches the frontend": the
physics is asserted in CI rather than trusted to review.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest

from app.schemas.quantum import QuantumIR, QuantumOperation, SimulationOptions
from app.services.quantum.backends.qiskit_aer import QiskitAerBackend
from app.services.quantum.gate_registry import GateRegistry

CURRICULUM_PATH = (
    Path(__file__).resolve().parents[3] / "packages" / "curriculum" / "curriculum.json"
)

DEFAULT_TOLERANCE = 1e-6


def _load_curriculum() -> dict[str, Any]:
    if not CURRICULUM_PATH.exists():
        pytest.skip(
            f"{CURRICULUM_PATH} not found. Run `npm run content:export` in apps/web."
        )
    return json.loads(CURRICULUM_PATH.read_text(encoding="utf-8"))


CURRICULUM = _load_curriculum()
LESSONS: list[dict[str, Any]] = CURRICULUM["lessons"]
LESSONS_WITH_CIRCUITS = [lesson for lesson in LESSONS if lesson.get("circuit")]

# Parametrising by slug keeps failure output readable: the test id names the
# lesson whose physics is wrong.
SLUGS = [lesson["slug"] for lesson in LESSONS]
CIRCUIT_SLUGS = [lesson["slug"] for lesson in LESSONS_WITH_CIRCUITS]


def _by_slug(slug: str) -> dict[str, Any]:
    return next(lesson for lesson in LESSONS if lesson["slug"] == slug)


@pytest.fixture(scope="module")
def backend() -> QiskitAerBackend:
    return QiskitAerBackend()


# --- structural integrity -------------------------------------------------

def test_curriculum_is_not_empty() -> None:
    assert LESSONS, "No lessons exported."


@pytest.mark.parametrize("slug", SLUGS)
def test_lesson_has_required_fields(slug: str) -> None:
    lesson = _by_slug(slug)
    for field in ("id", "slug", "order", "title", "summary", "sections", "objectives"):
        assert lesson.get(field), f"{slug}: missing {field}"
    assert lesson["sections"], f"{slug}: has no sections"
    assert lesson["keyTakeaways"], f"{slug}: has no key takeaways"
    assert lesson["references"], f"{slug}: cites no references"


def test_slugs_and_orders_are_unique() -> None:
    slugs = [lesson["slug"] for lesson in LESSONS]
    orders = [lesson["order"] for lesson in LESSONS]
    assert len(set(slugs)) == len(slugs), "Duplicate lesson slug."
    assert len(set(orders)) == len(orders), "Duplicate lesson order."


def test_prerequisites_reference_real_lessons() -> None:
    known = {lesson["slug"] for lesson in LESSONS}
    for lesson in LESSONS:
        for prereq in lesson.get("prerequisites", []):
            # A prerequisite naming an unwritten lesson would render as a dead
            # link, so it is only allowed once that lesson exists.
            assert prereq in known, (
                f"{lesson['slug']} requires '{prereq}', which is not in the curriculum"
            )


@pytest.mark.parametrize("slug", SLUGS)
def test_no_placeholder_content(slug: str) -> None:
    """Guards the rule that a lesson ships complete or not at all."""
    lesson = _by_slug(slug)
    blob = json.dumps(lesson).lower()
    for marker in ("lorem ipsum", "tbd", "todo", "coming soon", "placeholder", "xxx"):
        assert marker not in blob, f"{slug}: contains placeholder text '{marker}'"

    # An empty optional field is the placeholder this project is trying to
    # avoid; the field should be absent instead.
    for optional in ("circuit", "code", "visual"):
        if optional in lesson:
            assert lesson[optional], f"{slug}: '{optional}' is present but empty — omit it instead"


@pytest.mark.parametrize("slug", SLUGS)
def test_equations_have_captions(slug: str) -> None:
    """An equation with no explanation teaches nothing."""
    for section in _by_slug(slug)["sections"]:
        for block in section["blocks"]:
            if block["kind"] == "equation":
                assert block.get("caption", "").strip(), (
                    f"{slug}/{section['id']}: equation without a caption"
                )
            if block["kind"] == "derivation":
                assert block["steps"], f"{slug}/{section['id']}: derivation with no steps"
                for step in block["steps"]:
                    assert step.get("explanation", "").strip(), (
                        f"{slug}/{section['id']}: derivation step '{step['title']}' "
                        f"has no explanation"
                    )


# --- circuits -------------------------------------------------------------

@pytest.mark.parametrize("slug", CIRCUIT_SLUGS)
def test_circuit_gates_exist_in_the_registry(slug: str) -> None:
    circuit = _by_slug(slug)["circuit"]
    for op in circuit["operations"]:
        assert GateRegistry.resolve(op["gate"]) is not None, (
            f"{slug}: unknown gate '{op['gate']}'"
        )


@pytest.mark.parametrize("slug", CIRCUIT_SLUGS)
def test_circuit_validates_and_compiles(slug: str, backend: QiskitAerBackend) -> None:
    circuit = _by_slug(slug)["circuit"]
    ir = QuantumIR(
        numQubits=circuit["numQubits"],
        numClbits=circuit["numClbits"],
        operations=[QuantumOperation(**op) for op in _clean_ops(circuit["operations"])],
    )
    backend.validate(ir)


@pytest.mark.parametrize("slug", CIRCUIT_SLUGS)
def test_circuit_produces_the_probabilities_the_lesson_claims(
    slug: str, backend: QiskitAerBackend
) -> None:
    """The core content check.

    A lesson asserting physics the simulator does not reproduce is a bug in the
    lesson, and this is where it gets caught.
    """
    lesson = _by_slug(slug)
    circuit = lesson["circuit"]
    tolerance = circuit.get("tolerance") or DEFAULT_TOLERANCE

    ir = QuantumIR(
        numQubits=circuit["numQubits"],
        numClbits=circuit["numClbits"],
        operations=[QuantumOperation(**op) for op in _clean_ops(circuit["operations"])],
    )
    result = backend.run(ir, SimulationOptions(shots=1, mode="statevector"))

    for basis_state, claimed in circuit["expected"].items():
        actual = result.probabilities.get(basis_state, 0.0)
        assert actual == pytest.approx(claimed, abs=tolerance), (
            f"{slug}: lesson claims P({basis_state}) = {claimed}, "
            f"simulator gives {actual}"
        )

    # The stated distribution must be complete, not a convenient subset.
    total_claimed = sum(circuit["expected"].values())
    assert total_claimed == pytest.approx(1.0, abs=1e-6), (
        f"{slug}: stated probabilities sum to {total_claimed}, not 1.0"
    )


@pytest.mark.parametrize("slug", CIRCUIT_SLUGS)
def test_circuit_operations_are_annotated(slug: str) -> None:
    """Each gate carries a note, so the inspector explains rather than labels."""
    for op in _by_slug(slug)["circuit"]["operations"]:
        assert op.get("note", "").strip(), (
            f"{slug}: operation '{op['id']}' ({op['gate']}) has no explanatory note"
        )


# --- code -----------------------------------------------------------------

@pytest.mark.parametrize(
    "slug", [lesson["slug"] for lesson in LESSONS if lesson.get("code")]
)
def test_code_example_is_syntactically_valid(slug: str) -> None:
    """Compile the snippet. It must at least parse before a learner runs it."""
    code = _by_slug(slug)["code"]
    assert code["language"] == "python"
    compile(code["code"], f"<{slug}>", "exec")


def _clean_ops(operations: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Strip presentation-only keys before building Quantum IR."""
    return [{k: v for k, v in op.items() if k != "note"} for op in operations]


# --- executable code examples ---------------------------------------------

CODE_SLUGS = [lesson["slug"] for lesson in LESSONS if lesson.get("code")]


@pytest.mark.parametrize("slug", CODE_SLUGS)
def test_code_example_runs_and_prints_what_it_promises(slug: str, tmp_path: Path) -> None:
    """Execute the snippet exactly as a learner would.

    Compiling only proves it parses. These examples are the ones shipped
    preloaded with each lesson, so they must actually run and produce the
    output the lesson says they will.
    """
    import subprocess
    import sys

    code = _by_slug(slug)["code"]
    script = tmp_path / "example.py"
    script.write_text(code["code"], encoding="utf-8")

    proc = subprocess.run(
        [sys.executable, str(script)],
        capture_output=True,
        text=True,
        timeout=120,
        cwd=tmp_path,
    )

    assert proc.returncode == 0, (
        f"{slug}: example exited {proc.returncode}\nstderr:\n{proc.stderr[-1500:]}"
    )

    for fragment in code.get("expectedOutput", []):
        assert fragment in proc.stdout, (
            f"{slug}: expected output {fragment!r} not found.\n"
            f"Actual stdout:\n{proc.stdout[-1500:]}"
        )
