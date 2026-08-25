from app.schemas.quantum import QuantumIR, SimulationOptions, SimulationResult
from app.services.quantum.backends.qiskit_aer import QiskitAerBackend
from app.services.quantum.ir_validator import IRValidator, CircuitValidationError

class QiskitQuantumBackend:
    """Wrapper entry point preserving existing simulator service contract."""

    def __init__(self):
        self._backend = QiskitAerBackend()

    def validate(self, circuit: QuantumIR) -> None:
        self._backend.validate(circuit)

    def run(self, circuit: QuantumIR, options: SimulationOptions) -> SimulationResult:
        return self._backend.run(circuit, options)
