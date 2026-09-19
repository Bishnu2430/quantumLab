from typing import Literal

from pydantic import BaseModel, Field

from app.services.quantum.gate_registry import GateId


class QuantumOperation(BaseModel):
    id: str = Field(description="Unique operation identifier e.g. 'op-001'")
    gate: GateId = Field(description="Gate identifier; see GateRegistry for the supported set")
    targets: list[int] = Field(description="Target qubit indices")
    controls: list[int] | None = Field(
        default=[], description="Control qubit indices"
    )
    clbits: list[int] | None = Field(
        default=[], description="Classical bit indices for measurement"
    )
    params: list[float] | None = Field(
        default=[], description="Gate parameters e.g. rotation angles"
    )
    moment: int | None = Field(default=0, description="Column or time step index in canvas")

class QuantumIR(BaseModel):
    numQubits: int = Field(ge=1, le=32, description="Number of qubits in circuit")
    numClbits: int = Field(default=0, ge=0, le=32, description="Number of classical bits")
    operations: list[QuantumOperation] = Field(
        default=[], description="List of operations in sequence"
    )

class SimulationOptions(BaseModel):
    shots: int = Field(default=1024, ge=1, le=100000, description="Number of measurement shots")
    mode: Literal["statevector", "shots", "both"] = Field(
        default="both", description="Simulation calculation mode"
    )
    seed: int | None = Field(default=None, description="Random seed for reproducibility")

class SimulationRequest(BaseModel):
    circuit: QuantumIR
    options: SimulationOptions | None = Field(default_factory=SimulationOptions)

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
    counts: dict[str, int] | None = Field(default=None, description="Shot outcome counts")
    probabilities: dict[str, float] = Field(description="State probability distribution")
    statevector: list[ComplexAmplitude] | None = Field(
        default=None, description="Complex statevector amplitudes"
    )
    durationMs: float = Field(description="Execution time in milliseconds")
    circuitDepth: int = Field(description="Compiled circuit depth")
