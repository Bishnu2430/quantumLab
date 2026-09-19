"""Central registry of quantum gates, arities, parameters, and mathematical semantics.

This module is the single source of truth for which gates exist. The request
schema derives its accepted values from :class:`GateId`, so the schema and the
registry cannot drift apart.
"""

from __future__ import annotations

from enum import StrEnum
from typing import Any, ClassVar

from pydantic import BaseModel, ConfigDict


class GateId(StrEnum):
    """Canonical gate identifiers accepted by the Quantum IR."""

    H = "h"
    X = "x"
    Y = "y"
    Z = "z"
    S = "s"
    T = "t"
    RX = "rx"
    RY = "ry"
    RZ = "rz"
    CX = "cx"
    CZ = "cz"
    SWAP = "swap"
    CCX = "ccx"
    TOFFOLI = "toffoli"
    MEASURE = "measure"
    RESET = "reset"
    BARRIER = "barrier"


class GateCategory(StrEnum):
    SINGLE = "single"
    PARAMETERIZED = "parameterized"
    MULTI = "multi"
    MEASUREMENT = "measurement"
    UTILITY = "utility"


class GateSpec(BaseModel):
    """Arity and semantics of a single gate.

    ``maxTargets`` of ``None`` means unbounded, which only applies to barriers.
    """

    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: GateId
    name: str
    symbol: str
    minTargets: int = 1
    maxTargets: int | None = 1
    numControls: int = 0
    numParams: int = 0
    category: GateCategory = GateCategory.SINGLE
    description: str
    aliasOf: GateId | None = None
    matrix: list[list[Any]] | None = None

    @property
    def unitary(self) -> bool:
        """Whether the gate preserves the norm of the state vector."""
        non_unitary = (GateCategory.MEASUREMENT, GateCategory.UTILITY)
        return self.category not in non_unitary and self.id is not GateId.RESET


class GateRegistry:
    """Lookup and arity rules for every supported gate."""

    _GATES: ClassVar[dict[GateId, GateSpec]] = {
        GateId.H: GateSpec(
            id=GateId.H, name="Hadamard", symbol="H",
            description="Creates equal superposition: H|0> = (|0>+|1>)/sqrt(2), "
                        "H|1> = (|0>-|1>)/sqrt(2)",
        ),
        GateId.X: GateSpec(
            id=GateId.X, name="Pauli-X", symbol="X",
            description="Bit-flip gate (quantum NOT): X|0> = |1>, X|1> = |0>",
        ),
        GateId.Y: GateSpec(
            id=GateId.Y, name="Pauli-Y", symbol="Y",
            description="Bit & phase flip gate: Y|0> = i|1>, Y|1> = -i|0>",
        ),
        GateId.Z: GateSpec(
            id=GateId.Z, name="Pauli-Z", symbol="Z",
            description="Phase-flip gate: Z|0> = |0>, Z|1> = -|1>",
        ),
        GateId.S: GateSpec(
            id=GateId.S, name="S (Phase)", symbol="S",
            description="pi/2 phase gate: S|1> = i|1>",
        ),
        GateId.T: GateSpec(
            id=GateId.T, name="T (pi/8)", symbol="T",
            description="pi/4 phase gate: T|1> = e^(i*pi/4)|1>",
        ),
        GateId.RX: GateSpec(
            id=GateId.RX, name="Rotation-X", symbol="RX", numParams=1,
            category=GateCategory.PARAMETERIZED,
            description="Rotation around the X-axis of the Bloch sphere by angle theta",
        ),
        GateId.RY: GateSpec(
            id=GateId.RY, name="Rotation-Y", symbol="RY", numParams=1,
            category=GateCategory.PARAMETERIZED,
            description="Rotation around the Y-axis of the Bloch sphere by angle theta",
        ),
        GateId.RZ: GateSpec(
            id=GateId.RZ, name="Rotation-Z", symbol="RZ", numParams=1,
            category=GateCategory.PARAMETERIZED,
            description="Rotation around the Z-axis of the Bloch sphere by angle theta",
        ),
        GateId.CX: GateSpec(
            id=GateId.CX, name="Controlled-NOT", symbol="CX", numControls=1,
            category=GateCategory.MULTI,
            description="Flips the target qubit if the control qubit is |1>",
        ),
        GateId.CZ: GateSpec(
            id=GateId.CZ, name="Controlled-Z", symbol="CZ", numControls=1,
            category=GateCategory.MULTI,
            description="Applies a Z gate to the target if the control qubit is |1>",
        ),
        GateId.SWAP: GateSpec(
            id=GateId.SWAP, name="SWAP", symbol="SWAP", minTargets=2, maxTargets=2,
            category=GateCategory.MULTI,
            description="Exchanges the quantum states of two target qubits",
        ),
        GateId.CCX: GateSpec(
            id=GateId.CCX, name="Toffoli (CCX)", symbol="CCX", numControls=2,
            category=GateCategory.MULTI,
            description="Controlled-controlled-NOT: flips the target only if both controls are |1>",
        ),
        GateId.TOFFOLI: GateSpec(
            id=GateId.TOFFOLI, name="Toffoli (CCX)", symbol="CCX", numControls=2,
            category=GateCategory.MULTI, aliasOf=GateId.CCX,
            description="Alias of CCX, retained for backwards compatibility",
        ),
        GateId.MEASURE: GateSpec(
            id=GateId.MEASURE, name="Measurement", symbol="M", maxTargets=None,
            category=GateCategory.MEASUREMENT,
            description="Projectively measures qubits in the Z basis into classical bits; "
                        "targets and clbits are paired in order",
        ),
        GateId.RESET: GateSpec(
            id=GateId.RESET, name="Reset", symbol="|0>", maxTargets=None,
            category=GateCategory.MEASUREMENT,
            description="Non-unitary reset returning the qubit to |0> "
                        "regardless of its prior state",
        ),
        GateId.BARRIER: GateSpec(
            id=GateId.BARRIER, name="Barrier", symbol="||", maxTargets=None,
            category=GateCategory.UTILITY,
            description="Prevents transpiler optimizations across this point; "
                        "applies to any number of qubits",
        ),
    }

    @classmethod
    def get(cls, gate_id: str) -> GateSpec | None:
        try:
            return cls._GATES.get(GateId(gate_id.lower()))
        except ValueError:
            return None

    @classmethod
    def resolve(cls, gate_id: str) -> GateSpec | None:
        """Return the spec a gate ultimately refers to, following aliases."""
        spec = cls.get(gate_id)
        if spec is not None and spec.aliasOf is not None:
            return cls._GATES.get(spec.aliasOf)
        return spec

    @classmethod
    def list_all(cls) -> list[GateSpec]:
        return list(cls._GATES.values())

    @classmethod
    def is_valid_gate(cls, gate_id: str) -> bool:
        return cls.get(gate_id) is not None
