"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Eraser, Plus, RotateCcw, Trash2 } from "lucide-react";

import type { QuantumGate, QuantumIR, QuantumOperation } from "@/lib/api/quantum";

/** What the palette needs to know to place a gate correctly. */
interface GateSpec {
  gate: QuantumGate;
  label: string;
  /** Qubits the user must pick, in order, after selecting the gate. */
  operands: ("target" | "control")[];
  /** Number of angle parameters the gate takes. */
  params: number;
  description: string;
}

/** Mirrors the backend GateRegistry; arity here must match arity there. */
export const PALETTE: { group: string; gates: GateSpec[] }[] = [
  {
    group: "Single qubit",
    gates: [
      { gate: "h", label: "H", operands: ["target"], params: 0, description: "Hadamard — creates an equal superposition" },
      { gate: "x", label: "X", operands: ["target"], params: 0, description: "Bit flip: |0⟩ ↔ |1⟩" },
      { gate: "y", label: "Y", operands: ["target"], params: 0, description: "Bit and phase flip" },
      { gate: "z", label: "Z", operands: ["target"], params: 0, description: "Phase flip: negates |1⟩" },
      { gate: "s", label: "S", operands: ["target"], params: 0, description: "Quarter turn about z" },
      { gate: "t", label: "T", operands: ["target"], params: 0, description: "Eighth turn about z" },
    ],
  },
  {
    group: "Rotations",
    gates: [
      { gate: "rx", label: "RX", operands: ["target"], params: 1, description: "Rotation about x by θ" },
      { gate: "ry", label: "RY", operands: ["target"], params: 1, description: "Rotation about y by θ" },
      { gate: "rz", label: "RZ", operands: ["target"], params: 1, description: "Rotation about z by θ" },
    ],
  },
  {
    group: "Multi qubit",
    gates: [
      { gate: "cx", label: "CX", operands: ["control", "target"], params: 0, description: "CNOT — flips the target when the control is |1⟩" },
      { gate: "cz", label: "CZ", operands: ["control", "target"], params: 0, description: "Applies Z to the target when the control is |1⟩" },
      { gate: "swap", label: "SWAP", operands: ["target", "target"], params: 0, description: "Exchanges two qubits" },
      { gate: "ccx", label: "CCX", operands: ["control", "control", "target"], params: 0, description: "Toffoli — flips the target when both controls are |1⟩" },
    ],
  },
  {
    group: "Other",
    gates: [
      { gate: "measure", label: "M", operands: ["target"], params: 0, description: "Measures into a classical bit" },
      { gate: "reset", label: "|0⟩", operands: ["target"], params: 0, description: "Returns the qubit to |0⟩" },
      { gate: "barrier", label: "‖", operands: ["target"], params: 0, description: "Blocks optimisation across this point" },
    ],
  },
];

const SPEC_BY_GATE = new Map(PALETTE.flatMap((g) => g.gates).map((spec) => [spec.gate, spec]));

export const PRESETS: { id: string; name: string; description: string; build: () => QuantumIR }[] = [
  {
    id: "bell",
    name: "Bell pair",
    description: "H then CNOT — the canonical entangled state",
    build: () => ({
      numQubits: 2, numClbits: 2,
      operations: [
        { id: "op-1", gate: "h", targets: [0] },
        { id: "op-2", gate: "cx", controls: [0], targets: [1] },
      ],
    }),
  },
  {
    id: "ghz",
    name: "GHZ state",
    description: "Three-qubit entanglement",
    build: () => ({
      numQubits: 3, numClbits: 3,
      operations: [
        { id: "op-1", gate: "h", targets: [0] },
        { id: "op-2", gate: "cx", controls: [0], targets: [1] },
        { id: "op-3", gate: "cx", controls: [1], targets: [2] },
      ],
    }),
  },
  {
    id: "interference",
    name: "Interference",
    description: "H · H returns |0⟩ with certainty",
    build: () => ({
      numQubits: 1, numClbits: 1,
      operations: [
        { id: "op-1", gate: "h", targets: [0] },
        { id: "op-2", gate: "h", targets: [0] },
      ],
    }),
  },
];

interface Props {
  circuit: QuantumIR;
  onChange: (circuit: QuantumIR) => void;
}

/** In-progress multi-qubit placement: which operands are still needed. */
interface Placement {
  spec: GateSpec;
  picked: number[];
}

/**
 * Click-to-place circuit editor.
 *
 * Multi-qubit gates are built by picking operands in order, with the prompt
 * naming what is still needed ("pick the target"), rather than relying on a
 * drag gesture whose control/target direction is ambiguous. Placement is
 * rejected client-side when a qubit is reused within one operation, so the
 * obvious mistakes never reach the API.
 */
export const CircuitBuilder: React.FC<Props> = ({ circuit, onChange }) => {
  const [placement, setPlacement] = useState<Placement | null>(null);
  const [selectedOp, setSelectedOp] = useState<string | null>(null);
  const [angle, setAngle] = useState(Math.PI / 2);
  const [hint, setHint] = useState<string | null>(null);

  const columns = useMemo(() => Math.max(circuit.operations.length, 8), [circuit.operations.length]);

  const beginPlacement = useCallback((spec: GateSpec) => {
    setSelectedOp(null);
    setPlacement({ spec, picked: [] });
    setHint(
      spec.operands.length > 1
        ? `Pick the ${spec.operands[0]} qubit for ${spec.label}`
        : `Pick a qubit for ${spec.label}`,
    );
  }, []);

  const pickQubit = useCallback(
    (qubit: number) => {
      if (!placement) return;

      if (placement.picked.includes(qubit)) {
        setHint("That qubit is already used by this gate — pick a different one.");
        return;
      }

      const picked = [...placement.picked, qubit];

      if (picked.length < placement.spec.operands.length) {
        setPlacement({ ...placement, picked });
        setHint(`Pick the ${placement.spec.operands[picked.length]} qubit for ${placement.spec.label}`);
        return;
      }

      // All operands chosen: build the operation in canonical IR form.
      const spec = placement.spec;
      const controls: number[] = [];
      const targets: number[] = [];
      spec.operands.forEach((role, index) => {
        (role === "control" ? controls : targets).push(picked[index]);
      });

      const operation: QuantumOperation = {
        id: `op-${Date.now().toString(36)}`,
        gate: spec.gate,
        targets,
        ...(controls.length ? { controls } : {}),
        ...(spec.params ? { params: Array(spec.params).fill(angle) } : {}),
        ...(spec.gate === "measure" ? { clbits: [targets[0]] } : {}),
      };

      const needsClbits = spec.gate === "measure" ? Math.max(circuit.numClbits, targets[0] + 1) : circuit.numClbits;

      onChange({
        ...circuit,
        numClbits: needsClbits,
        operations: [...circuit.operations, operation],
      });
      setPlacement(null);
      setHint(null);
    },
    [angle, circuit, onChange, placement],
  );

  const removeOperation = useCallback(
    (id: string) => {
      onChange({ ...circuit, operations: circuit.operations.filter((op) => op.id !== id) });
      setSelectedOp(null);
    },
    [circuit, onChange],
  );

  const setQubitCount = useCallback(
    (count: number) => {
      const next = Math.min(Math.max(count, 1), 8);
      // Drop operations that reference qubits which no longer exist, rather
      // than sending the API a circuit it will reject.
      const operations = circuit.operations.filter(
        (op) => [...op.targets, ...(op.controls ?? [])].every((q) => q < next),
      );
      onChange({ ...circuit, numQubits: next, numClbits: Math.min(circuit.numClbits, next), operations });
    },
    [circuit, onChange],
  );

  const qubits = Array.from({ length: circuit.numQubits }, (_, i) => i);
  const selected = circuit.operations.find((op) => op.id === selectedOp);

  return (
    <div className="space-y-3">
      {/* Palette */}
      <div className="panel p-3">
        <div className="space-y-2.5">
          {PALETTE.map(({ group, gates }) => (
            <div key={group}>
              <p className="text-[10px] uppercase tracking-wide text-text-subtle mb-1.5">{group}</p>
              <div className="flex flex-wrap gap-1.5">
                {gates.map((spec) => (
                  <button
                    key={spec.gate}
                    type="button"
                    onClick={() => beginPlacement(spec)}
                    title={spec.description}
                    aria-pressed={placement?.spec.gate === spec.gate}
                    className={`gate-badge w-10 h-9 text-[11px] ${
                      placement?.spec.gate === spec.gate
                        ? "bg-accent text-text-inverse border-accent"
                        : "bg-surface-raised border-border text-text hover:border-accent-border hover:text-accent"
                    }`}
                  >
                    {spec.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {placement && placement.spec.params > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <label className="flex items-center gap-2 text-xs text-text">
              <span className="whitespace-nowrap">Angle θ</span>
              <input
                type="range" min={0} max={2 * Math.PI} step={0.01} value={angle}
                onChange={(event) => setAngle(Number(event.target.value))}
                className="flex-1 accent-accent"
              />
              <span className="font-mono text-[11px] text-accent w-12 text-right">{angle.toFixed(2)}</span>
            </label>
          </div>
        )}
      </div>

      {/* Placement prompt. Multi-qubit gates need two or three picks, so the
          prompt states exactly which operand comes next. */}
      {hint && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-accent-soft border border-accent-border">
          <p className="text-xs text-accent-text">{hint}</p>
          <button
            type="button"
            onClick={() => { setPlacement(null); setHint(null); }}
            className="text-[11px] text-accent-text underline hover:no-underline"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Wires */}
      <div className="panel p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => setQubitCount(circuit.numQubits - 1)}
                    disabled={circuit.numQubits <= 1}
                    className="p-1.5 rounded-md border border-border bg-surface text-text-muted hover:text-text disabled:opacity-40"
                    aria-label="Remove a qubit">
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <span className="text-xs font-mono text-text-muted px-1">{circuit.numQubits} qubits</span>
            <button type="button" onClick={() => setQubitCount(circuit.numQubits + 1)}
                    disabled={circuit.numQubits >= 8}
                    className="p-1.5 rounded-md border border-border bg-surface text-text-muted hover:text-text disabled:opacity-40"
                    aria-label="Add a qubit">
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {PRESETS.map((preset) => (
              <button key={preset.id} type="button" onClick={() => { onChange(preset.build()); setSelectedOp(null); }}
                      title={preset.description}
                      className="px-2 py-1 rounded-md border border-border bg-surface text-[11px] text-text-muted hover:text-accent hover:border-accent-border transition-colors">
                {preset.name}
              </button>
            ))}
            <button type="button"
                    onClick={() => onChange({ ...circuit, operations: [] })}
                    className="p-1.5 rounded-md border border-border bg-surface text-text-muted hover:text-danger"
                    aria-label="Clear the circuit">
              <Eraser className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-max">
            {qubits.map((qubit) => (
              <div key={qubit} className="flex items-center gap-2 h-11">
                <button
                  type="button"
                  onClick={() => placement && pickQubit(qubit)}
                  disabled={!placement}
                  className={`w-12 shrink-0 text-[11px] font-mono rounded px-1.5 py-1 transition-colors ${
                    placement
                      ? "bg-accent-soft text-accent-text border border-accent-border cursor-pointer hover:bg-accent-border"
                      : "text-text-subtle border border-transparent"
                  }`}
                >
                  q{qubit}
                </button>

                <div className="relative flex items-center gap-1.5 flex-1">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-border" aria-hidden="true" />
                  {Array.from({ length: columns }).map((_, column) => {
                    const op = circuit.operations[column];
                    if (!op) return <div key={column} className="w-10 h-10 shrink-0" aria-hidden="true" />;

                    const isTarget = op.targets.includes(qubit);
                    const isControl = op.controls?.includes(qubit);
                    if (!isTarget && !isControl) {
                      // Vertical connector for a multi-qubit gate spanning this wire.
                      const span = [...op.targets, ...(op.controls ?? [])];
                      const between = qubit > Math.min(...span) && qubit < Math.max(...span);
                      return (
                        <div key={column} className="w-10 h-10 shrink-0 relative">
                          {between && (
                            <div className="absolute left-1/2 inset-y-0 w-px bg-accent-border" aria-hidden="true" />
                          )}
                        </div>
                      );
                    }

                    const spec = SPEC_BY_GATE.get(op.gate);
                    return (
                      <button
                        key={column}
                        type="button"
                        onClick={() => setSelectedOp(selectedOp === op.id ? null : op.id)}
                        title={spec?.description}
                        className={`relative w-10 h-10 shrink-0 gate-badge text-[11px] ${
                          selectedOp === op.id
                            ? "bg-accent text-text-inverse border-accent"
                            : isControl
                              ? "bg-surface border-border-strong text-text-muted"
                              : "bg-accent-soft border-accent-border text-accent-text hover:bg-accent-border"
                        }`}
                      >
                        {isControl ? "●" : (spec?.label ?? op.gate.toUpperCase())}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {circuit.operations.length === 0 && (
          <p className="text-center text-xs text-text-subtle py-4">
            Empty circuit — every qubit stays in |0⟩. Pick a gate above, then click a qubit.
          </p>
        )}
      </div>

      {selected && (
        <div className="panel p-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-text">
              <span className="font-mono uppercase text-accent mr-1.5">{selected.gate}</span>
              {SPEC_BY_GATE.get(selected.gate)?.description}
            </p>
            <p className="text-[11px] font-mono text-text-subtle mt-1">
              targets [{selected.targets.join(", ")}]
              {selected.controls?.length ? ` · controls [${selected.controls.join(", ")}]` : ""}
              {selected.params?.length ? ` · θ = ${selected.params[0].toFixed(3)}` : ""}
            </p>
          </div>
          <button type="button" onClick={() => removeOperation(selected.id)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-danger-border bg-danger-soft text-[11px] text-danger hover:opacity-80 shrink-0">
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
            Remove
          </button>
        </div>
      )}
    </div>
  );
};
