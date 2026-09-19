"""Structural and semantic validation of Quantum IR.

Every rejection raised here becomes a 422 with an actionable message. Anything
this validator lets through must be compilable by every backend adapter without
raising — an ``IndexError`` escaping the compiler as a 500 is a bug in *this*
module, not in the adapter.
"""

from __future__ import annotations

from app.schemas.quantum import QuantumIR, QuantumOperation
from app.services.quantum.gate_registry import GateCategory, GateRegistry, GateSpec


class CircuitValidationError(Exception):
    """Raised when a circuit cannot be compiled as specified."""


def _describe(idx: int, op: QuantumOperation) -> str:
    return f"Operation #{idx} ({op.id}, {op.gate})"


class IRValidator:
    """Validates Quantum IR structural integrity, gate arity, and operation semantics."""

    @staticmethod
    def validate(circuit: QuantumIR) -> None:
        num_q = circuit.numQubits
        num_c = circuit.numClbits

        seen_ids: set[str] = set()

        for idx, op in enumerate(circuit.operations):
            where = _describe(idx, op)

            if op.id in seen_ids:
                raise CircuitValidationError(
                    f"Operation #{idx} has duplicate ID '{op.id}'. Operation IDs must be unique."
                )
            seen_ids.add(op.id)

            spec = GateRegistry.resolve(op.gate)
            if spec is None:
                raise CircuitValidationError(f"{where}: Unknown or unsupported gate '{op.gate}'.")

            IRValidator._validate_arity(where, op, spec)
            IRValidator._validate_qubit_indices(where, op, num_q)

            if spec.category is GateCategory.MEASUREMENT and spec.id == "measure":
                IRValidator._validate_measurement(where, op, num_c)

    @staticmethod
    def _validate_arity(where: str, op: QuantumOperation, spec: GateSpec) -> None:
        """Check operand counts against the registry.

        Without this the compiler indexes past the end of ``targets`` and the
        request fails as an opaque 500 instead of a validation error.
        """
        n_targets = len(op.targets)
        if n_targets < spec.minTargets:
            raise CircuitValidationError(
                f"{where}: expects at least {spec.minTargets} target qubit(s), got {n_targets}."
            )
        if spec.maxTargets is not None and n_targets > spec.maxTargets:
            expected = (
                str(spec.minTargets)
                if spec.minTargets == spec.maxTargets
                else f"{spec.minTargets}-{spec.maxTargets}"
            )
            raise CircuitValidationError(
                f"{where}: expects {expected} target qubit(s), got {n_targets}."
            )

        n_controls = len(op.controls or [])
        if n_controls != spec.numControls:
            raise CircuitValidationError(
                f"{where}: expects {spec.numControls} control qubit(s), got {n_controls}."
            )

        n_params = len(op.params or [])
        if n_params < spec.numParams:
            raise CircuitValidationError(
                f"{where}: expects {spec.numParams} parameter(s) (e.g. a rotation angle), "
                f"got {n_params}."
            )

    @staticmethod
    def _validate_qubit_indices(where: str, op: QuantumOperation, num_q: int) -> None:
        for t in op.targets:
            if t < 0 or t >= num_q:
                raise CircuitValidationError(
                    f"{where}: Target qubit index {t} is out of bounds [0, {num_q - 1}]."
                )

        if len(set(op.targets)) != len(op.targets):
            raise CircuitValidationError(
                f"{where}: the same qubit is listed twice as a target."
            )

        for c in op.controls or []:
            if c < 0 or c >= num_q:
                raise CircuitValidationError(
                    f"{where}: Control qubit index {c} is out of bounds [0, {num_q - 1}]."
                )
            if c in op.targets:
                raise CircuitValidationError(
                    f"{where}: Qubit {c} cannot be both control and target in the same operation."
                )

        if len(set(op.controls or [])) != len(op.controls or []):
            raise CircuitValidationError(
                f"{where}: the same qubit is listed twice as a control."
            )

    @staticmethod
    def _validate_measurement(where: str, op: QuantumOperation, num_c: int) -> None:
        if not op.clbits:
            raise CircuitValidationError(
                f"{where}: Measurement requires at least one target classical bit."
            )
        if len(op.clbits) != len(op.targets):
            raise CircuitValidationError(
                f"{where}: {len(op.targets)} qubit(s) measured into {len(op.clbits)} "
                f"classical bit(s); the counts must match."
            )
        for cb in op.clbits:
            if cb < 0 or cb >= num_c:
                raise CircuitValidationError(
                    f"{where}: Classical bit index {cb} is out of bounds [0, {num_c - 1}]. "
                    f"Did you forget to declare numClbits?"
                )
