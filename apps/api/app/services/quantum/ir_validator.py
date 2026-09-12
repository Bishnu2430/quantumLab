from typing import Set
from app.schemas.quantum import QuantumIR
from app.services.quantum.gate_registry import GateRegistry

class CircuitValidationError(Exception):
    pass

class IRValidator:
    """Validates Quantum IR structural integrity, gate rules, and operation semantics."""

    @staticmethod
    def validate(circuit: QuantumIR) -> None:
        num_q = circuit.numQubits
        num_c = circuit.numClbits

        seen_ids: Set[str] = set()

        for idx, op in enumerate(circuit.operations):
            # Check operation id uniqueness
            if op.id in seen_ids:
                raise CircuitValidationError(
                    f"Operation #{idx} has duplicate ID '{op.id}'. Operation IDs must be unique."
                )
            seen_ids.add(op.id)

            # Check gate existence in registry
            spec = GateRegistry.get(op.gate)
            if not spec:
                raise CircuitValidationError(
                    f"Operation #{idx} ({op.id}): Unknown or unsupported gate '{op.gate}'."
                )

            # Validate target qubit bounds
            for t in op.targets:
                if t < 0 or t >= num_q:
                    raise CircuitValidationError(
                        f"Operation #{idx} ({op.id}, {op.gate}): Target qubit index {t} is out of bounds [0, {num_q - 1}]."
                    )

            # Validate control qubit bounds & collisions
            if op.controls:
                for c in op.controls:
                    if c < 0 or c >= num_q:
                        raise CircuitValidationError(
                            f"Operation #{idx} ({op.id}, {op.gate}): Control qubit index {c} is out of bounds [0, {num_q - 1}]."
                        )
                    if c in op.targets:
                        raise CircuitValidationError(
                            f"Operation #{idx} ({op.id}, {op.gate}): Qubit {c} cannot be both control and target in the same operation."
                        )

            # Validate classical bit mapping for measurement
            if op.gate == "measure":
                if not op.clbits:
                    raise CircuitValidationError(
                        f"Operation #{idx} ({op.id}, measure): Measurement requires at least one target classical bit."
                    )
                for cb in op.clbits:
                    if cb < 0 or cb >= num_c:
                        raise CircuitValidationError(
                            f"Operation #{idx} ({op.id}, measure): Classical bit index {cb} is out of bounds [0, {num_c - 1}]."
                        )
