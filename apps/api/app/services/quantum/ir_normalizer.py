"""Canonicalization of Quantum IR before validation and compilation.

Circuits reach the API in several historical shapes. Controlled gates, for
example, have been expressed both as ``{controls: [0], targets: [1]}`` and as
``{targets: [0, 1]}``. Normalizing once here means the validator and every
backend adapter can assume a single canonical form.
"""

from __future__ import annotations

from app.schemas.quantum import QuantumIR, QuantumOperation
from app.services.quantum.gate_registry import GateRegistry


def normalize_operation(op: QuantumOperation) -> QuantumOperation:
    """Return ``op`` rewritten into canonical form.

    Canonical form means: aliases resolved to their primary gate id, and
    controlled gates carrying their controls in ``controls`` rather than
    folded into the front of ``targets``.
    """
    spec = GateRegistry.get(op.gate)
    if spec is None:
        return op

    changed: dict[str, object] = {}

    if spec.aliasOf is not None:
        changed["gate"] = spec.aliasOf

    resolved = GateRegistry.resolve(op.gate)
    assert resolved is not None  # an alias always resolves

    # Legacy form: controls folded into targets, e.g. cx with targets=[c, t].
    n_controls = resolved.numControls
    if n_controls and not op.controls and len(op.targets) == n_controls + resolved.minTargets:
        changed["controls"] = op.targets[:n_controls]
        changed["targets"] = op.targets[n_controls:]

    return op.model_copy(update=changed) if changed else op


def normalize_circuit(circuit: QuantumIR) -> QuantumIR:
    """Return ``circuit`` with every operation in canonical form."""
    normalized = [normalize_operation(op) for op in circuit.operations]
    if all(a is b for a, b in zip(normalized, circuit.operations, strict=True)):
        return circuit
    return circuit.model_copy(update={"operations": normalized})
