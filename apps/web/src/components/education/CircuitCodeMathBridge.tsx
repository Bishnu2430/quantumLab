"use client";

import React, { useState } from "react";
import { Network, Code, Layers, Sparkles } from "lucide-react";

interface BridgeGateSpec {
  id: string;
  gate: string;
  name: string;
  matrix: string;
  qiskitCode: string;
  mathEffect: string;
}

const BRIDGE_GATES: BridgeGateSpec[] = [
  {
    id: "g-h",
    gate: "H",
    name: "Hadamard Gate",
    matrix: "1/√2 * [[1, 1], [1, -1]]",
    qiskitCode: "qc.h(0)",
    mathEffect: "H|0⟩ = (|0⟩ + |1⟩) / √2 = |+⟩",
  },
  {
    id: "g-x",
    gate: "X",
    name: "Pauli-X Gate",
    matrix: "[[0, 1], [1, 0]]",
    qiskitCode: "qc.x(0)",
    mathEffect: "X|0⟩ = |1⟩ (Quantum Bit Flip)",
  },
  {
    id: "g-z",
    gate: "Z",
    name: "Pauli-Z Gate",
    matrix: "[[1, 0], [0, -1]]",
    qiskitCode: "qc.z(0)",
    mathEffect: "Z|+⟩ = |−⟩ (180° Relative Phase Shift)",
  },
  {
    id: "g-m",
    gate: "M",
    name: "Measurement Operator",
    matrix: "P₀ = |0⟩⟨0|, P₁ = |1⟩⟨1|",
    qiskitCode: "qc.measure(0, 0)",
    mathEffect: "Collapse |ψ⟩ ➔ 0 or 1 with Probabilities |α|², |β|²",
  },
];

export const CircuitCodeMathBridge: React.FC = () => {
  const [selectedGateId, setSelectedGateId] = useState<string>("g-h");

  const selectedGate = BRIDGE_GATES.find((g) => g.id === selectedGateId) || BRIDGE_GATES[0];

  return (
    <div className="glass-panel p-6 bg-white border border-[#CBD5E1] rounded-xl space-y-5">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <div className="flex items-center gap-2 text-[#2563EB] font-bold text-xs uppercase font-mono tracking-wider">
          <Network className="w-4 h-4 text-[#2563EB]" />
          <span>Interactive Circuit ↔ Mathematics ↔ Qiskit Code Bridge</span>
        </div>
        <span className="text-xs text-[#334155] font-semibold font-mono">Select a Gate on Wire Below</span>
      </div>

      {/* Interactive Circuit Wire */}
      <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#CBD5E1] font-mono text-xs space-y-2">
        <span className="text-[#64748B] font-bold block mb-1">q[0]: |0⟩ ─────────────</span>
        <div className="flex items-center gap-3 py-2 px-3 bg-white rounded border border-[#CBD5E1]">
          <span>|0⟩ ──</span>
          {BRIDGE_GATES.map((g) => {
            const isSelected = g.id === selectedGateId;
            return (
              <React.Fragment key={g.id}>
                <button
                  onClick={() => setSelectedGateId(g.id)}
                  className={`w-9 h-9 rounded font-bold transition-all shadow-xs flex items-center justify-center ${
                    isSelected
                      ? "bg-[#2563EB] text-white ring-2 ring-[#2563EB] ring-offset-1 scale-105"
                      : "bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1] hover:bg-[#E2E8F0]"
                  }`}
                >
                  {g.gate}
                </button>
                <span className="text-[#CBD5E1]">──</span>
              </React.Fragment>
            );
          })}
          <span> [ M ]</span>
        </div>
      </div>

      {/* Synchronized Synchronous Bridge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        {/* Panel 1: Matrix Representation */}
        <div className="p-4 bg-[#EFF6FF] rounded-lg border border-[#BFDBFE] space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-[#1E40AF]">
            <Layers className="w-4 h-4 text-[#2563EB]" />
            <span>Unitary Matrix</span>
          </div>
          <strong className="block text-[#0F172A] text-sm">{selectedGate.name}</strong>
          <pre className="p-2 bg-white rounded border border-[#BFDBFE] font-bold text-[#0F172A]">
            {selectedGate.matrix}
          </pre>
        </div>

        {/* Panel 2: State Transformation */}
        <div className="p-4 bg-[#F0FDF4] rounded-lg border border-[#86EFAC] space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-[#166534]">
            <Sparkles className="w-4 h-4 text-[#16A34A]" />
            <span>Mathematical Transformation</span>
          </div>
          <strong className="block text-[#0F172A] text-sm">Statevector Shift</strong>
          <div className="p-2 bg-white rounded border border-[#86EFAC] font-bold text-[#166534]">
            {selectedGate.mathEffect}
          </div>
        </div>

        {/* Panel 3: Equivalent Qiskit Python Code */}
        <div className="p-4 bg-[#FAF5FF] rounded-lg border border-[#E9D5FF] space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-[#6B21A8]">
            <Code className="w-4 h-4 text-[#7E22CE]" />
            <span>Equivalent Qiskit Code</span>
          </div>
          <strong className="block text-[#0F172A] text-sm">Python Script</strong>
          <code className="block p-2 bg-white rounded border border-[#E9D5FF] font-bold text-[#7E22CE]">
            {selectedGate.qiskitCode}
          </code>
        </div>
      </div>
    </div>
  );
};
