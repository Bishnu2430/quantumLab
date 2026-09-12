"use client";

import React, { useState } from "react";
import { Sparkles, Info, X, Check, ArrowRight, Layers, Sliders, HelpCircle } from "lucide-react";

export interface GateInfo {
  id: string;
  name: string;
  label: string;
  category: "single" | "multi" | "element" | "initial" | "preset";
  description: string;
  matrix?: string;
  qiskitCode?: string;
  exampleEffect?: string;
  colorClass: string;
  numTargets: number;
  numControls: number;
}

export const PALETTE_GATES: GateInfo[] = [
  // Single Qubit Gates
  {
    id: "h",
    name: "Hadamard Gate",
    label: "H",
    category: "single",
    description: "Creates equal superposition: maps |0⟩ to |+⟩ = (|0⟩+|1⟩)/√2 and |1⟩ to |−⟩.",
    matrix: "1/√2 * [[1, 1], [1, -1]]",
    qiskitCode: "qc.h(0)",
    exampleEffect: "H|0⟩ = |+⟩",
    colorClass: "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] hover:bg-[#DBEAFE]",
    numTargets: 1,
    numControls: 0,
  },
  {
    id: "x",
    name: "Pauli-X (NOT)",
    label: "X",
    category: "single",
    description: "Bit flip operator: swaps basis states |0⟩ ↔ |1⟩.",
    matrix: "[[0, 1], [1, 0]]",
    qiskitCode: "qc.x(0)",
    exampleEffect: "X|0⟩ = |1⟩",
    colorClass: "bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5] hover:bg-[#FEE2E2]",
    numTargets: 1,
    numControls: 0,
  },
  {
    id: "y",
    name: "Pauli-Y Gate",
    label: "Y",
    category: "single",
    description: "Performs bit and phase flip: Y|0⟩ = i|1⟩, Y|1⟩ = -i|0⟩.",
    matrix: "[[0, -i], [i, 0]]",
    qiskitCode: "qc.y(0)",
    exampleEffect: "Y|0⟩ = i|1⟩",
    colorClass: "bg-[#FFF7ED] text-[#EA580C] border-[#FDBA74] hover:bg-[#FFEDD5]",
    numTargets: 1,
    numControls: 0,
  },
  {
    id: "z",
    name: "Pauli-Z Gate",
    label: "Z",
    category: "single",
    description: "Phase flip operator: leaves |0⟩ unchanged and flips phase of |1⟩ to -|1⟩.",
    matrix: "[[1, 0], [0, -1]]",
    qiskitCode: "qc.z(0)",
    exampleEffect: "Z|+⟩ = |−⟩",
    colorClass: "bg-[#FAF5FF] text-[#9333EA] border-[#E9D5FF] hover:bg-[#F3E8FF]",
    numTargets: 1,
    numControls: 0,
  },
  {
    id: "s",
    name: "Phase Gate (S)",
    label: "S",
    category: "single",
    description: "Applies a π/2 (90°) relative phase shift around the Z-axis.",
    matrix: "[[1, 0], [0, i]]",
    qiskitCode: "qc.s(0)",
    exampleEffect: "S|1⟩ = i|1⟩",
    colorClass: "bg-[#F0FDF4] text-[#16A34A] border-[#86EFAC] hover:bg-[#DCFCE7]",
    numTargets: 1,
    numControls: 0,
  },
  {
    id: "t",
    name: "T Gate (π/8)",
    label: "T",
    category: "single",
    description: "Applies a π/4 (45°) relative phase shift around the Z-axis.",
    matrix: "[[1, 0], [0, e^(iπ/4)]]",
    qiskitCode: "qc.t(0)",
    exampleEffect: "T|1⟩ = e^(iπ/4)|1⟩",
    colorClass: "bg-[#F0FDF4] text-[#15803D] border-[#86EFAC] hover:bg-[#DCFCE7]",
    numTargets: 1,
    numControls: 0,
  },
  {
    id: "rx",
    name: "Rotation-X",
    label: "Rx",
    category: "single",
    description: "Rotates qubit state vector around the X-axis by angle θ.",
    matrix: "cos(θ/2)I - i sin(θ/2)X",
    qiskitCode: "qc.rx(angle, 0)",
    exampleEffect: "Rx(π)|0⟩ = -i|1⟩",
    colorClass: "bg-[#F8FAFC] text-[#0F172A] border-[#CBD5E1] hover:bg-[#E2E8F0]",
    numTargets: 1,
    numControls: 0,
  },
  {
    id: "ry",
    name: "Rotation-Y",
    label: "Ry",
    category: "single",
    description: "Rotates qubit state vector around the Y-axis by angle θ.",
    matrix: "cos(θ/2)I - i sin(θ/2)Y",
    qiskitCode: "qc.ry(angle, 0)",
    exampleEffect: "Ry(π)|0⟩ = |1⟩",
    colorClass: "bg-[#F8FAFC] text-[#0F172A] border-[#CBD5E1] hover:bg-[#E2E8F0]",
    numTargets: 1,
    numControls: 0,
  },
  {
    id: "rz",
    name: "Rotation-Z",
    label: "Rz",
    category: "single",
    description: "Rotates qubit state vector around the Z-axis by angle θ.",
    matrix: "cos(θ/2)I - i sin(θ/2)Z",
    qiskitCode: "qc.rz(angle, 0)",
    exampleEffect: "Rz(π)|1⟩ = -i|1⟩",
    colorClass: "bg-[#F8FAFC] text-[#0F172A] border-[#CBD5E1] hover:bg-[#E2E8F0]",
    numTargets: 1,
    numControls: 0,
  },

  // Controlled / Multi-Qubit Gates
  {
    id: "cx",
    name: "Controlled-NOT",
    label: "CX",
    category: "multi",
    description: "Flips target qubit (⊕) if control qubit (●) is in state |1⟩.",
    matrix: "[[1,0,0,0], [0,1,0,0], [0,0,0,1], [0,0,1,0]]",
    qiskitCode: "qc.cx(control, target)",
    exampleEffect: "CX|10⟩ = |11⟩",
    colorClass: "bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE] hover:bg-[#DBEAFE]",
    numTargets: 1,
    numControls: 1,
  },
  {
    id: "cz",
    name: "Controlled-Z",
    label: "CZ",
    category: "multi",
    description: "Applies phase shift Z to target qubit if control qubit is in state |1⟩.",
    matrix: "diag(1, 1, 1, -1)",
    qiskitCode: "qc.cz(control, target)",
    exampleEffect: "CZ|11⟩ = -|11⟩",
    colorClass: "bg-[#FAF5FF] text-[#7E22CE] border-[#E9D5FF] hover:bg-[#F3E8FF]",
    numTargets: 1,
    numControls: 1,
  },
  {
    id: "swap",
    name: "SWAP Gate",
    label: "SWAP",
    category: "multi",
    description: "Exchanges quantum states between two target qubits.",
    matrix: "[[1,0,0,0], [0,0,1,0], [0,1,0,0], [0,0,0,1]]",
    qiskitCode: "qc.swap(q1, q2)",
    exampleEffect: "SWAP|01⟩ = |10⟩",
    colorClass: "bg-[#F0FDF4] text-[#166534] border-[#86EFAC] hover:bg-[#DCFCE7]",
    numTargets: 2,
    numControls: 0,
  },
  {
    id: "ccx",
    name: "Toffoli (CCX)",
    label: "CCX",
    category: "multi",
    description: "3-qubit controlled-controlled-NOT: flips target if both controls are |1⟩.",
    matrix: "8x8 Permutation Matrix",
    qiskitCode: "qc.ccx(c1, c2, target)",
    exampleEffect: "CCX|110⟩ = |111⟩",
    colorClass: "bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5] hover:bg-[#FEE2E2]",
    numTargets: 1,
    numControls: 2,
  },

  // Circuit Elements & Notation
  {
    id: "measure",
    name: "Measurement",
    label: "M",
    category: "element",
    description: "Measures quantum state into classical register in computational Z-basis.",
    qiskitCode: "qc.measure(qubit, clbit)",
    exampleEffect: "Collapse |ψ⟩ ➔ 0 or 1",
    colorClass: "bg-[#F1F5F9] text-[#0F172A] border-[#CBD5E1] hover:bg-[#E2E8F0]",
    numTargets: 1,
    numControls: 0,
  },
  {
    id: "barrier",
    name: "Barrier",
    label: "║",
    category: "element",
    description: "Visual boundary used to separate circuit sections without altering quantum state.",
    qiskitCode: "qc.barrier(targets)",
    exampleEffect: "No quantum state change",
    colorClass: "bg-[#F8FAFC] text-[#64748B] border-[#CBD5E1] hover:bg-[#E2E8F0]",
    numTargets: 1,
    numControls: 0,
  },
];

export const GATE_LIST: GateInfo[] = PALETTE_GATES;

interface GatePaletteProps {
  selectedGate: GateInfo | null;
  onSelectGate: (gate: GateInfo) => void;
  placementControlQubit?: number | null;
  onCancelPlacement?: () => void;
  onSelectControlNotationMode?: () => void;
  onSelectTargetNotationMode?: () => void;
  activeNotationMode?: "control" | "target" | "connection" | null;
}

export const GatePalette: React.FC<GatePaletteProps> = ({
  selectedGate,
  onSelectGate,
  placementControlQubit,
  onCancelPlacement,
  onSelectControlNotationMode,
  onSelectTargetNotationMode,
  activeNotationMode,
}) => {
  const [activeTooltipGate, setActiveTooltipGate] = useState<GateInfo | null>(null);
  const [connectionPreview, setConnectionPreview] = useState<boolean>(false);

  const singleQubitGates = PALETTE_GATES.filter((g) => g.category === "single");
  const multiQubitGates = PALETTE_GATES.filter((g) => g.category === "multi");
  const circuitElements = PALETTE_GATES.filter((g) => g.category === "element");

  return (
    <div className="glass-panel rounded-xl p-4 bg-white border border-[#CBD5E1] space-y-4 font-mono text-xs">
      {/* Palette Title Banner */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
        <div className="flex items-center gap-2 text-[#2563EB] font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-[#2563EB]" />
          <span>Quantum Gate & Circuit Element Palette</span>
        </div>

        {selectedGate && (
          <span className="text-[11px] font-bold text-[#166534] bg-[#F0FDF4] px-2 py-0.5 rounded border border-[#86EFAC]">
            Active: {selectedGate.label}
          </span>
        )}
      </div>

      {/* Controlled Placement Status Indicator Banner */}
      {selectedGate?.category === "multi" && (
        <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg space-y-1 font-sans text-xs text-[#1E3A8A]">
          <div className="flex items-center justify-between">
            <strong className="font-bold text-[#1E40AF]">
              {placementControlQubit !== null && placementControlQubit !== undefined
                ? `Control Selected: q[${placementControlQubit}]. Select target qubit on canvas.`
                : `${selectedGate.name} (${selectedGate.label}) Placement Active: Select CONTROL qubit on canvas.`}
            </strong>
            {onCancelPlacement && (
              <button
                onClick={onCancelPlacement}
                className="px-2 py-0.5 bg-white text-[#DC2626] rounded border border-[#FCA5A5] font-bold text-[11px] hover:bg-[#FEF2F2]"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* SECTION 1: SINGLE-QUBIT GATES */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">Single-Qubit Unitary Gates</span>
        <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
          {singleQubitGates.map((gate) => {
            const isSelected = selectedGate?.id === gate.id;
            return (
              <button
                key={gate.id}
                onClick={() => onSelectGate(gate)}
                onMouseEnter={() => setActiveTooltipGate(gate)}
                className={`py-2 px-1.5 rounded-lg border font-bold text-center transition-all flex flex-col items-center justify-center ${
                  gate.colorClass
                } ${
                  isSelected
                    ? "ring-2 ring-[#2563EB] ring-offset-1 font-extrabold scale-105 shadow-xs"
                    : ""
                }`}
              >
                <span className="text-sm">{gate.label}</span>
                <span className="text-[9px] opacity-80 mt-0.5 truncate w-full">{gate.name.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: CONTROLLED / MULTI-QUBIT GATES */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">Controlled / Multi-Qubit Gates</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {multiQubitGates.map((gate) => {
            const isSelected = selectedGate?.id === gate.id;
            return (
              <button
                key={gate.id}
                onClick={() => onSelectGate(gate)}
                onMouseEnter={() => setActiveTooltipGate(gate)}
                className={`py-2 px-2 rounded-lg border font-bold text-center transition-all flex flex-col items-center justify-center ${
                  gate.colorClass
                } ${
                  isSelected
                    ? "ring-2 ring-[#2563EB] ring-offset-1 font-extrabold scale-105 shadow-xs"
                    : ""
                }`}
              >
                <span className="text-sm">{gate.label}</span>
                <span className="text-[9px] opacity-80 mt-0.5 truncate w-full">{gate.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: INTERACTIVE CIRCUIT ELEMENTS & NOTATION GUIDE */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">
          Interactive Circuit Elements & Notation Guide (Click to Place / Learn)
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[11px]">
          {/* Interactive Control Card */}
          <button
            onClick={() => {
              const cxGate = PALETTE_GATES.find((g) => g.id === "cx") || PALETTE_GATES[9];
              onSelectGate(cxGate);
              if (onSelectControlNotationMode) onSelectControlNotationMode();
            }}
            onMouseEnter={() =>
              setActiveTooltipGate({
                id: "control-notation",
                name: "CONTROL NOTATION (●)",
                label: "●",
                category: "element",
                description: "The control qubit (●) determines whether the controlled operation is applied. Click to select control qubit on canvas.",
                qiskitCode: "qc.cx(control, target)",
                exampleEffect: "If q₀ = |1⟩ ➔ Apply operation to q₁",
                colorClass: "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]",
                numTargets: 0,
                numControls: 1,
              })
            }
            className={`p-2.5 bg-[#EFF6FF] border border-[#BFDBFE] hover:bg-[#DBEAFE] hover:border-[#2563EB] rounded-lg text-center font-bold text-[#1E40AF] transition-all flex flex-col items-center justify-center space-y-0.5 cursor-pointer ${
              activeNotationMode === "control" ? "ring-2 ring-[#2563EB] ring-offset-1 font-extrabold" : ""
            }`}
          >
            <span className="text-base text-[#2563EB] font-extrabold">●</span>
            <span className="font-bold">Control</span>
            <span className="text-[9px] text-[#2563EB] font-semibold">Click to select control</span>
          </button>

          {/* Interactive Target Card */}
          <button
            onClick={() => {
              const cxGate = PALETTE_GATES.find((g) => g.id === "cx") || PALETTE_GATES[9];
              onSelectGate(cxGate);
              if (onSelectTargetNotationMode) onSelectTargetNotationMode();
            }}
            onMouseEnter={() =>
              setActiveTooltipGate({
                id: "target-notation",
                name: "TARGET NOTATION (⊕)",
                label: "⊕",
                category: "element",
                description: "The target qubit (⊕) receives the controlled operation when control is |1⟩. Click to select target qubit.",
                qiskitCode: "qc.cx(control, target)",
                exampleEffect: "Receives X flip if control = |1⟩",
                colorClass: "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]",
                numTargets: 1,
                numControls: 0,
              })
            }
            className={`p-2.5 bg-[#EFF6FF] border border-[#BFDBFE] hover:bg-[#DBEAFE] hover:border-[#2563EB] rounded-lg text-center font-bold text-[#1E40AF] transition-all flex flex-col items-center justify-center space-y-0.5 cursor-pointer ${
              activeNotationMode === "target" ? "ring-2 ring-[#2563EB] ring-offset-1 font-extrabold" : ""
            }`}
          >
            <span className="text-base text-[#2563EB] font-extrabold">⊕</span>
            <span className="font-bold">Target</span>
            <span className="text-[9px] text-[#2563EB] font-semibold">Click to select target</span>
          </button>

          {/* Interactive Connection Card */}
          <button
            onClick={() => setConnectionPreview(!connectionPreview)}
            onMouseEnter={() =>
              setActiveTooltipGate({
                id: "connection-notation",
                name: "CONTROL CONNECTION (│)",
                label: "│",
                category: "element",
                description: "Visual vertical connection line linking control (●) and target (⊕). Connections are automatically created by controlled gates.",
                qiskitCode: "qc.cx(control, target)",
                exampleEffect: "Visual wire link (Not a standalone gate)",
                colorClass: "bg-[#F8FAFC] text-[#0F172A] border-[#CBD5E1]",
                numTargets: 0,
                numControls: 0,
              })
            }
            className="p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] hover:bg-[#E2E8F0] hover:border-[#2563EB] rounded-lg text-center font-bold text-[#0F172A] transition-all flex flex-col items-center justify-center space-y-0.5 cursor-pointer"
          >
            <span className="text-base text-[#2563EB] font-extrabold">│</span>
            <span className="font-bold">Connection</span>
            <span className="text-[9px] text-[#64748B]">Auto-created by gates</span>
          </button>

          {/* Interactive Measurement & Barrier Cards */}
          {circuitElements.map((gate) => {
            const isSelected = selectedGate?.id === gate.id;
            return (
              <button
                key={gate.id}
                onClick={() => onSelectGate(gate)}
                onMouseEnter={() => setActiveTooltipGate(gate)}
                className={`p-2.5 rounded-lg border font-bold text-center transition-all flex flex-col items-center justify-center space-y-0.5 ${
                  gate.colorClass
                } ${isSelected ? "ring-2 ring-[#2563EB] ring-offset-1 font-extrabold scale-105 shadow-xs" : ""}`}
              >
                <span className="text-base font-extrabold block">{gate.label}</span>
                <span className="font-bold">{gate.name}</span>
                <span className="text-[9px] text-[#475569]">Click to place</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CONNECTION EDUCATIONAL PREVIEW MODAL */}
      {connectionPreview && (
        <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg text-xs font-sans text-[#1E3A8A] space-y-1.5">
          <div className="flex items-center justify-between font-bold text-[#1E40AF]">
            <span>Control Connection (│) Information</span>
            <button onClick={() => setConnectionPreview(false)} className="text-[#DC2626] font-bold">Close ✕</button>
          </div>
          <p>
            Vertical connection lines (│) visually link control qubits (●) to target qubits (⊕). They are generated automatically when a controlled gate (CX, CZ, CCX) is constructed. They are NOT independent quantum gates in Quantum IR.
          </p>
        </div>
      )}

      {/* ACTIVE EDUCATIONAL TOOLTIP POPOVER */}
      {activeTooltipGate && (
        <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg space-y-1 font-sans text-xs text-[#0F172A]">
          <div className="flex items-center justify-between font-mono">
            <strong className="font-bold text-[#2563EB] text-sm">{activeTooltipGate.name} ({activeTooltipGate.label})</strong>
            {activeTooltipGate.qiskitCode && <code className="text-[#7E22CE] bg-[#FAF5FF] px-2 py-0.5 rounded border border-[#E9D5FF] font-bold">{activeTooltipGate.qiskitCode}</code>}
          </div>
          <p className="text-[#334155]">{activeTooltipGate.description}</p>
          {activeTooltipGate.matrix && (
            <div className="font-mono text-[11px] text-[#0F172A] pt-1">
              <strong>Matrix:</strong> <code>{activeTooltipGate.matrix}</code>
            </div>
          )}
          {activeTooltipGate.exampleEffect && (
            <div className="font-mono text-[11px] text-[#166534]">
              <strong>Effect Example:</strong> <code>{activeTooltipGate.exampleEffect}</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
