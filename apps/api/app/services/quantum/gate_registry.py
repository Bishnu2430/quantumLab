from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field, ConfigDict

class GateSpec(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: str
    name: str
    symbol: str
    numTargets: int = 1
    numControls: int = 0
    numParams: int = 0
    category: str = "single"  # single, multi, parameterized, measurement
    description: str
    matrix: Optional[List[List[Any]]] = None

class GateRegistry:
    """Central registry of quantum gates, arities, parameters, and mathematical semantics."""
    
    _GATES: Dict[str, GateSpec] = {
        "h": GateSpec(
            id="h", name="Hadamard", symbol="H", numTargets=1, numControls=0, numParams=0, category="single",
            description="Creates equal superposition: H|0> = (|0>+|1>)/sqrt(2), H|1> = (|0>-|1>)/sqrt(2)"
        ),
        "x": GateSpec(
            id="x", name="Pauli-X", symbol="X", numTargets=1, numControls=0, numParams=0, category="single",
            description="Bit-flip gate (quantum NOT): X|0> = |1>, X|1> = |0>"
        ),
        "y": GateSpec(
            id="y", name="Pauli-Y", symbol="Y", numTargets=1, numControls=0, numParams=0, category="single",
            description="Bit & phase flip gate: Y|0> = i|1>, Y|1> = -i|0>"
        ),
        "z": GateSpec(
            id="z", name="Pauli-Z", symbol="Z", numTargets=1, numControls=0, numParams=0, category="single",
            description="Phase-flip gate: Z|0> = |0>, Z|1> = -|1>"
        ),
        "s": GateSpec(
            id="s", name="S (Phase)", symbol="S", numTargets=1, numControls=0, numParams=0, category="single",
            description="π/2 phase gate: S|1> = i|1>"
        ),
        "t": GateSpec(
            id="t", name="T (π/8)", symbol="T", numTargets=1, numControls=0, numParams=0, category="single",
            description="π/4 phase gate: T|1> = e^(iπ/4)|1>"
        ),
        "rx": GateSpec(
            id="rx", name="Rotation-X", symbol="RX", numTargets=1, numControls=0, numParams=1, category="parameterized",
            description="Rotation around X-axis by angle θ"
        ),
        "ry": GateSpec(
            id="ry", name="Rotation-Y", symbol="RY", numTargets=1, numControls=0, numParams=1, category="parameterized",
            description="Rotation around Y-axis by angle θ"
        ),
        "rz": GateSpec(
            id="rz", name="Rotation-Z", symbol="RZ", numTargets=1, numControls=0, numParams=1, category="parameterized",
            description="Rotation around Z-axis by angle θ"
        ),
        "cx": GateSpec(
            id="cx", name="Controlled-NOT", symbol="CX", numTargets=1, numControls=1, numParams=0, category="multi",
            description="Flips target qubit if control qubit is |1>"
        ),
        "cz": GateSpec(
            id="cz", name="Controlled-Z", symbol="CZ", numTargets=1, numControls=1, numParams=0, category="multi",
            description="Applies Z gate to target if control qubit is |1>"
        ),
        "swap": GateSpec(
            id="swap", name="SWAP", symbol="SWAP", numTargets=2, numControls=0, numParams=0, category="multi",
            description="Swaps quantum states of two target qubits"
        ),
        "toffoli": GateSpec(
            id="toffoli", name="Toffoli (CCX)", symbol="CCX", numTargets=1, numControls=2, numParams=0, category="multi",
            description="Controlled-Controlled-NOT gate with 2 controls and 1 target"
        ),
        "ccx": GateSpec(
            id="ccx", name="Toffoli (CCX)", symbol="CCX", numTargets=1, numControls=2, numParams=0, category="multi",
            description="Controlled-Controlled-NOT gate with 2 controls and 1 target"
        ),
        "measure": GateSpec(
            id="measure", name="Measurement", symbol="M", numTargets=1, numControls=0, numParams=0, category="measurement",
            description="Measures qubit state into classical bit register"
        ),
        "barrier": GateSpec(
            id="barrier", name="Barrier", symbol="||", numTargets=1, numControls=0, numParams=0, category="utility",
            description="Prevents transpiler optimizations across operations"
        ),
    }

    @classmethod
    def get(cls, gate_id: str) -> Optional[GateSpec]:
        return cls._GATES.get(gate_id.lower())

    @classmethod
    def list_all(cls) -> List[GateSpec]:
        return list(cls._GATES.values())

    @classmethod
    def is_valid_gate(cls, gate_id: str) -> bool:
        return gate_id.lower() in cls._GATES
