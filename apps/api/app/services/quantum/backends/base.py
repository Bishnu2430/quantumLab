from abc import ABC, abstractmethod
from app.schemas.quantum import QuantumIR, SimulationOptions, SimulationResult

class AbstractQuantumBackend(ABC):
    """Abstract Base Class for all quantum execution backends (Qiskit, PennyLane, Cirq, QPUs)."""

    @property
    @abstractmethod
    def backend_name(self) -> str:
        pass

    @abstractmethod
    def validate(self, circuit: QuantumIR) -> None:
        pass

    @abstractmethod
    def run(self, circuit: QuantumIR, options: SimulationOptions) -> SimulationResult:
        pass
