"""Validation contract tests.

The guarantee under test: anything ``IRValidator`` accepts, the backend can
compile. Malformed operand counts must surface as ``CircuitValidationError``
(a 422) and never as an ``IndexError`` escaping the compiler as a 500.
"""

from __future__ import annotations

import pytest

from app.schemas.quantum import QuantumIR, QuantumOperation, SimulationOptions
from app.services.quantum.backends.qiskit_aer import QiskitAerBackend
from app.services.quantum.gate_registry import GateId, GateRegistry
from app.services.quantum.ir_normalizer import normalize_circuit
from app.services.quantum.ir_validator import CircuitValidationError, IRValidator


@pytest.fixture
def backend() -> QiskitAerBackend:
    return QiskitAerBackend()


def _ir(*ops: QuantumOperation, qubits: int = 2, clbits: int = 0) -> QuantumIR:
    return QuantumIR(numQubits=qubits, numClbits=clbits, operations=list(ops))


# --- arity ----------------------------------------------------------------

@pytest.mark.parametrize(
    ("op", "fragment"),
    [
        (QuantumOperation(id="o", gate="cx", targets=[0]), "control qubit"),
        (QuantumOperation(id="o", gate="cz", targets=[0]), "control qubit"),
        (QuantumOperation(id="o", gate="swap", targets=[0]), "target qubit"),
        (QuantumOperation(id="o", gate="ccx", targets=[0], controls=[1]), "control qubit"),
        (QuantumOperation(id="o", gate="rx", targets=[0]), "parameter"),
        (QuantumOperation(id="o", gate="h", targets=[0, 1]), "target qubit"),
    ],
)
def test_bad_arity_is_a_validation_error(backend: QiskitAerBackend, op, fragment: str) -> None:
    """Previously these raised IndexError from the compiler and surfaced as 500s."""
    with pytest.raises(CircuitValidationError, match=fragment):
        backend.run(_ir(op, qubits=3), SimulationOptions(shots=16))


def test_barrier_accepts_any_number_of_targets(backend: QiskitAerBackend) -> None:
    ir = _ir(QuantumOperation(id="o", gate="barrier", targets=[0, 1, 2]), qubits=3)
    IRValidator.validate(ir)


def test_duplicate_target_rejected() -> None:
    with pytest.raises(CircuitValidationError, match="twice as a target"):
        IRValidator.validate(_ir(QuantumOperation(id="o", gate="swap", targets=[1, 1])))


def test_control_equal_to_target_rejected() -> None:
    with pytest.raises(CircuitValidationError, match="both control and target"):
        IRValidator.validate(
            _ir(QuantumOperation(id="o", gate="cx", targets=[0], controls=[0]))
        )


# --- measurement ----------------------------------------------------------

def test_measure_requires_matching_clbit_count() -> None:
    with pytest.raises(CircuitValidationError, match="counts must match"):
        IRValidator.validate(
            _ir(
                QuantumOperation(id="o", gate="measure", targets=[0, 1], clbits=[0]),
                clbits=2,
            )
        )


def test_measure_clbit_out_of_bounds_mentions_numclbits() -> None:
    with pytest.raises(CircuitValidationError, match="numClbits"):
        IRValidator.validate(
            _ir(QuantumOperation(id="o", gate="measure", targets=[0], clbits=[5]), clbits=2)
        )


def test_multi_qubit_measure_compiles(backend: QiskitAerBackend) -> None:
    """A single measure op spanning two qubits must record both, not just the first."""
    res = backend.run(
        _ir(
            QuantumOperation(id="o1", gate="x", targets=[0]),
            QuantumOperation(id="o2", gate="x", targets=[1]),
            QuantumOperation(id="o3", gate="measure", targets=[0, 1], clbits=[0, 1]),
            clbits=2,
        ),
        SimulationOptions(shots=64, seed=7),
    )
    assert res.counts == {"11": 64}


# --- normalization --------------------------------------------------------

def test_legacy_controls_folded_into_targets_is_normalized() -> None:
    """Older payloads expressed cx as targets=[control, target]."""
    normalized = normalize_circuit(_ir(QuantumOperation(id="o", gate="cx", targets=[0, 1])))
    op = normalized.operations[0]
    assert op.controls == [0]
    assert op.targets == [1]


def test_toffoli_alias_resolves_to_ccx() -> None:
    normalized = normalize_circuit(
        _ir(QuantumOperation(id="o", gate="toffoli", targets=[2], controls=[0, 1]), qubits=3)
    )
    assert normalized.operations[0].gate == GateId.CCX


def test_legacy_bell_pair_still_simulates(backend: QiskitAerBackend) -> None:
    res = backend.run(
        _ir(
            QuantumOperation(id="o1", gate="h", targets=[0]),
            QuantumOperation(id="o2", gate="cx", targets=[0, 1]),
        ),
        SimulationOptions(shots=512, seed=3, mode="statevector"),
    )
    assert res.probabilities["00"] == pytest.approx(0.5, abs=1e-6)
    assert res.probabilities["11"] == pytest.approx(0.5, abs=1e-6)


# --- reset ----------------------------------------------------------------

def test_reset_is_supported(backend: QiskitAerBackend) -> None:
    """`reset` was in the request schema but missing from the registry, so it
    was rejected as an unknown gate on every request."""
    res = backend.run(
        _ir(
            QuantumOperation(id="o1", gate="x", targets=[0]),
            QuantumOperation(id="o2", gate="reset", targets=[0]),
            qubits=1,
        ),
        SimulationOptions(shots=64, seed=1),
    )
    assert res.probabilities["0"] == pytest.approx(1.0, abs=1e-6)


# --- registry integrity ---------------------------------------------------

def test_every_schema_gate_exists_in_the_registry() -> None:
    """The schema derives from GateId, so the two cannot drift apart."""
    for gate_id in GateId:
        assert GateRegistry.resolve(gate_id) is not None, gate_id


def test_every_registry_gate_compiles(backend: QiskitAerBackend) -> None:
    """Guards against adding a gate to the registry with no compiler branch."""
    for gate_id in GateId:
        spec = GateRegistry.resolve(gate_id)
        assert spec is not None
        targets = list(range(spec.minTargets))
        controls = list(range(spec.minTargets, spec.minTargets + spec.numControls))
        op = QuantumOperation(
            id="o",
            gate=gate_id,
            targets=targets,
            controls=controls,
            params=[0.5] * spec.numParams,
            clbits=[0] * len(targets) if gate_id is GateId.MEASURE else [],
        )
        eval_qc, _ = backend.compile_ir(_ir(op, qubits=4, clbits=2))
        # Measurement-only ops legitimately add nothing to the statevector circuit.
        if spec.unitary:
            assert len(eval_qc.data) > 0, f"{gate_id} produced no instruction"
