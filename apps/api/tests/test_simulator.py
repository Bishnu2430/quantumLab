import pytest
from app.schemas.quantum import QuantumIR, QuantumOperation, SimulationOptions
from app.services.quantum.simulator import QiskitQuantumBackend, CircuitValidationError

def test_bell_state_simulation():
    backend = QiskitQuantumBackend()
    
    # Bell state circuit: H on Q0, CX (control=0, target=1)
    circuit = QuantumIR(
        numQubits=2,
        numClbits=2,
        operations=[
            QuantumOperation(id="op-1", gate="h", targets=[0], moment=0),
            QuantumOperation(id="op-2", gate="cx", controls=[0], targets=[1], moment=1),
            QuantumOperation(id="op-3", gate="measure", targets=[0], clbits=[0], moment=2),
            QuantumOperation(id="op-4", gate="measure", targets=[1], clbits=[1], moment=2),
        ]
    )

    options = SimulationOptions(shots=1000, mode="both", seed=42)
    result = backend.run(circuit, options)

    assert result.numQubits == 2
    assert result.backend == "qiskit-aer"
    
    # Check probabilities: ~0.5 for '00' and ~0.5 for '11'
    assert pytest.approx(result.probabilities["00"], abs=0.01) == 0.5
    assert pytest.approx(result.probabilities["11"], abs=0.01) == 0.5
    assert "01" not in result.probabilities or result.probabilities["01"] == 0.0

    # Check shot counts present
    assert result.counts is not None
    assert "00" in result.counts
    assert "11" in result.counts
    assert result.counts["00"] + result.counts["11"] == 1000

def test_invalid_qubit_target():
    backend = QiskitQuantumBackend()
    # 2 qubits circuit, target qubit 3 (out of bounds)
    circuit = QuantumIR(
        numQubits=2,
        operations=[
            QuantumOperation(id="op-1", gate="h", targets=[3])
        ]
    )

    with pytest.raises(CircuitValidationError):
        backend.validate(circuit)
