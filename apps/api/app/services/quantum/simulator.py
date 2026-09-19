"""Stable facade over the quantum backend adapters.

Callers import from here rather than reaching into a specific adapter, so the
execution backend can change without touching the routes.
"""

from __future__ import annotations

from app.schemas.quantum import QuantumIR, SimulationOptions, SimulationResult
from app.services.quantum.backends.qiskit_aer import QiskitAerBackend
from app.services.quantum.ir_validator import CircuitValidationError

# Re-exported as part of this module's public surface: routes catch
# CircuitValidationError alongside calling QiskitQuantumBackend.
__all__ = ["CircuitValidationError", "QiskitQuantumBackend"]


class QiskitQuantumBackend:
    """Wrapper entry point preserving the existing simulator service contract."""

    def __init__(self) -> None:
        self._backend = QiskitAerBackend()

    def validate(self, circuit: QuantumIR) -> None:
        self._backend.validate(circuit)

    def run(self, circuit: QuantumIR, options: SimulationOptions) -> SimulationResult:
        return self._backend.run(circuit, options)
