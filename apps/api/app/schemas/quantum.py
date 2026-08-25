from typing import List, Optional, Dict, Literal
from pydantic import BaseModel, Field

class QuantumOperation(BaseModel):
    id: str = Field(description="Unique operation identifier e.g. 'op-001'")
    gate: Literal["h", "x", "y", "z", "s", "t", "rx", "ry", "rz", "cx", "cz", "swap", "toffoli", "ccx", "measure", "reset", "barrier"]
    targets: List[int] = Field(description="Target qubit indices")
    controls: Optional[List[int]] = Field(default=[], description="Control qubit indices")
    clbits: Optional[List[int]] = Field(default=[], description="Classical bit indices for measurement")
    params: Optional[List[float]] = Field(default=[], description="Gate parameters e.g. rotation angles")
    moment: Optional[int] = Field(default=0, description="Column or time step index in canvas")

class QuantumIR(BaseModel):
    numQubits: int = Field(ge=1, le=32, description="Number of qubits in circuit")
    numClbits: int = Field(default=0, ge=0, le=32, description="Number of classical bits")
    operations: List[QuantumOperation] = Field(default=[], description="List of operations in sequence")

class SimulationOptions(BaseModel):
    shots: int = Field(default=1024, ge=1, le=100000, description="Number of measurement shots")
    mode: Literal["statevector", "shots", "both"] = Field(default="both", description="Simulation calculation mode")
    seed: Optional[int] = Field(default=None, description="Random seed for reproducibility")

class SimulationRequest(BaseModel):
    circuit: QuantumIR
    options: Optional[SimulationOptions] = Field(default_factory=SimulationOptions)

class ComplexAmplitude(BaseModel):
    state: str = Field(description="Binary basis state label, e.g., '00', '01'")
    real: float = Field(description="Real component of probability amplitude")
    imag: float = Field(description="Imaginary component of probability amplitude")
    magnitude: float = Field(description="Magnitude |psi|^2")
    phase: float = Field(description="Phase angle in radians")

class SimulationResult(BaseModel):
    backend: str = "qiskit-aer"
    numQubits: int
    shots: int
    counts: Optional[Dict[str, int]] = Field(default=None, description="Shot outcome counts")
    probabilities: Dict[str, float] = Field(description="State probability distribution")
    statevector: Optional[List[ComplexAmplitude]] = Field(default=None, description="Complex statevector amplitudes")
    durationMs: float = Field(description="Execution time in milliseconds")
    circuitDepth: int = Field(description="Compiled circuit depth")
