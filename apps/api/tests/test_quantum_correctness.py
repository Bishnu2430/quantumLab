import pytest
from app.schemas.quantum import QuantumIR, QuantumOperation, SimulationOptions
from app.services.quantum.backends.qiskit_aer import QiskitAerBackend
from app.services.quantum.ir_validator import CircuitValidationError

@pytest.fixture
def backend():
    return QiskitAerBackend()

def test_pauli_x_gate(backend):
    """Test 1: X|0> = |1>"""
    circuit = QuantumIR(
        numQubits=1,
        operations=[QuantumOperation(id="op-1", gate="x", targets=[0])]
    )
    res = backend.run(circuit, SimulationOptions(shots=100))
    probs = res.probabilities
    assert pytest.approx(probs["1"], abs=0.001) == 1.0
    assert probs.get("0", 0.0) == 0.0

def test_hadamard_plus_state(backend):
    """Test 2: H|0> = |+> = (|0>+|1>)/sqrt(2)"""
    circuit = QuantumIR(
        numQubits=1,
        operations=[QuantumOperation(id="op-1", gate="h", targets=[0])]
    )
    res = backend.run(circuit, SimulationOptions(shots=100))
    sv = {amp.state: amp for amp in res.statevector}
    assert pytest.approx(sv["0"].real, abs=0.001) == 0.707107
    assert pytest.approx(sv["1"].real, abs=0.001) == 0.707107

def test_hadamard_minus_state(backend):
    """Test 3: H|1> = |-> = (|0>-|1>)/sqrt(2) [Phase distinction check]"""
    circuit = QuantumIR(
        numQubits=1,
        operations=[
            QuantumOperation(id="op-1", gate="x", targets=[0]), # |0> -> |1>
            QuantumOperation(id="op-2", gate="h", targets=[0])  # H|1> -> |->
        ]
    )
    res = backend.run(circuit, SimulationOptions(shots=100))
    sv = {amp.state: amp for amp in res.statevector}
    assert pytest.approx(sv["0"].real, abs=0.001) == 0.707107
    assert pytest.approx(sv["1"].real, abs=0.001) == -0.707107 # Negative phase!

def test_hadamard_identity(backend):
    """Test 4: H^2 = I (Hadamard twice returns initial state |0>)"""
    circuit = QuantumIR(
        numQubits=1,
        operations=[
            QuantumOperation(id="op-1", gate="h", targets=[0]),
            QuantumOperation(id="op-2", gate="h", targets=[0])
        ]
    )
    res = backend.run(circuit, SimulationOptions(shots=100))
    probs = res.probabilities
    assert pytest.approx(probs["0"], abs=0.001) == 1.0

def test_pauli_x_identity(backend):
    """Test 5: X^2 = I (Pauli-X twice returns initial state |0>)"""
    circuit = QuantumIR(
        numQubits=1,
        operations=[
            QuantumOperation(id="op-1", gate="x", targets=[0]),
            QuantumOperation(id="op-2", gate="x", targets=[0])
        ]
    )
    res = backend.run(circuit, SimulationOptions(shots=100))
    probs = res.probabilities
    assert pytest.approx(probs["0"], abs=0.001) == 1.0

def test_bell_state_entanglement(backend):
    """Test 6: (|00> + |11>)/sqrt(2) Bell State"""
    circuit = QuantumIR(
        numQubits=2,
        operations=[
            QuantumOperation(id="op-1", gate="h", targets=[0]),
            QuantumOperation(id="op-2", gate="cx", controls=[0], targets=[1])
        ]
    )
    res = backend.run(circuit, SimulationOptions(shots=1024, seed=42))
    assert pytest.approx(res.probabilities["00"], abs=0.01) == 0.5
    assert pytest.approx(res.probabilities["11"], abs=0.01) == 0.5

    # Fix #13 Check: Shot counts sum exactly to shots (1024)
    total_counts = sum(res.counts.values())
    assert total_counts == 1024

def test_toffoli_ccx_gate(backend):
    """Test 7: CCX|110> = |111> (Toffoli 3-qubit controlled gate)"""
    circuit = QuantumIR(
        numQubits=3,
        operations=[
            QuantumOperation(id="op-1", gate="x", targets=[0]), # q[0] = 1
            QuantumOperation(id="op-2", gate="x", targets=[1]), # q[1] = 1
            QuantumOperation(id="op-3", gate="ccx", controls=[0, 1], targets=[2]) # CCX -> q[2] flips to 1
        ]
    )
    res = backend.run(circuit, SimulationOptions(shots=100))
    assert pytest.approx(res.probabilities["111"], abs=0.001) == 1.0

def test_swap_gate(backend):
    """Test 8: SWAP|01> = |10>"""
    circuit = QuantumIR(
        numQubits=2,
        operations=[
            QuantumOperation(id="op-1", gate="x", targets=[1]), # q[1]=1 -> bitstring "10"
            QuantumOperation(id="op-2", gate="swap", targets=[0, 1]) # SWAP -> q[0]=1, q[1]=0 -> bitstring "01"
        ]
    )
    res = backend.run(circuit, SimulationOptions(shots=100))
    assert pytest.approx(res.probabilities["01"], abs=0.001) == 1.0

def test_duplicate_operation_id(backend):
    """Test 9: Duplicate operation ID causes validation error"""
    circuit = QuantumIR(
        numQubits=1,
        operations=[
            QuantumOperation(id="op-same", gate="h", targets=[0]),
            QuantumOperation(id="op-same", gate="x", targets=[0])
        ]
    )
    with pytest.raises(CircuitValidationError, match="duplicate ID"):
        backend.validate(circuit)

def test_out_of_bounds_qubit(backend):
    """Test 10: Out of bounds target qubit causes validation error"""
    circuit = QuantumIR(
        numQubits=2,
        operations=[QuantumOperation(id="op-1", gate="h", targets=[5])]
    )
    with pytest.raises(CircuitValidationError, match="out of bounds"):
        backend.validate(circuit)

def test_control_target_collision(backend):
    """Test 11: Control and target on same qubit causes validation error"""
    circuit = QuantumIR(
        numQubits=2,
        operations=[QuantumOperation(id="op-1", gate="cx", controls=[0], targets=[0])]
    )
    with pytest.raises(CircuitValidationError, match="cannot be both control and target"):
        backend.validate(circuit)
