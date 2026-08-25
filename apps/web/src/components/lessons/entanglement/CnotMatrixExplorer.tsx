"use client";

import React, { useState } from "react";
import { GitBranch, ArrowRight, Sparkles } from "lucide-react";

interface TruthTableItem {
  input: string;
  controlBit: number;
  targetBit: number;
  output: string;
  explanation: string;
}

const TRUTH_TABLE: TruthTableItem[] = [
  {
    input: "|00⟩",
    controlBit: 0,
    targetBit: 0,
    output: "|00⟩",
    explanation: "Control qubit q₀ is 0 ➔ Target qubit q₁ remains unchanged (0).",
  },
  {
    input: "|01⟩",
    controlBit: 0,
    targetBit: 1,
    output: "|01⟩",
    explanation: "Control qubit q₀ is 0 ➔ Target qubit q₁ remains unchanged (1).",
  },
  {
    input: "|10⟩",
    controlBit: 1,
    targetBit: 0,
    output: "|11⟩",
    explanation: "Control qubit q₀ is 1 ➔ Target qubit q₁ flips from 0 to 1!",
  },
  {
    input: "|11⟩",
    controlBit: 1,
    targetBit: 1,
    output: "|10⟩",
    explanation: "Control qubit q₀ is 1 ➔ Target qubit q₁ flips from 1 to 0!",
  },
];

export const CnotMatrixExplorer: React.FC = () => {
  const [selectedInput, setSelectedInput] = useState<string>("|10⟩");

  const current = TRUTH_TABLE.find((t) => t.input === selectedInput) || TRUTH_TABLE[2];

  return (
    <div className="glass-panel p-6 bg-white border border-[#CBD5E1] rounded-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div>
          <h3 className="font-bold text-base text-[#0F172A] flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-[#2563EB]" />
            Interactive CNOT (Controlled-NOT) Truth Table Explorer
          </h3>
          <p className="text-xs text-[#334155] font-medium mt-0.5">
            The CNOT gate flips the target qubit if and only if the control qubit is state |1⟩.
          </p>
        </div>

        {/* Input Selector Buttons */}
        <div className="flex items-center gap-1.5 bg-[#F1F5F9] p-1 rounded-lg border border-[#CBD5E1] text-xs font-mono">
          {TRUTH_TABLE.map((item) => {
            const isSelected = item.input === selectedInput;
            return (
              <button
                key={item.input}
                onClick={() => setSelectedInput(item.input)}
                className={`px-2.5 py-1 rounded font-bold transition ${
                  isSelected
                    ? "bg-[#2563EB] text-white shadow-xs"
                    : "text-[#334155] hover:text-[#0F172A]"
                }`}
              >
                {item.input}
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual State Transformation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#CBD5E1] space-y-1">
          <span className="text-[#64748B] font-bold block">Input Basis State</span>
          <div className="text-xl font-bold text-[#0F172A] pt-1">{current.input}</div>
          <span className="text-[11px] text-[#64748B]">Control q₀={current.controlBit}, Target q₁={current.targetBit}</span>
        </div>

        <div className="flex items-center justify-center text-[#2563EB] font-bold">
          <div className="flex items-center gap-2 bg-[#EFF6FF] px-4 py-2 rounded-full border border-[#BFDBFE]">
            <span>CX(q₀ ➔ q₁)</span>
            <ArrowRight className="w-4 h-4 text-[#2563EB]" />
          </div>
        </div>

        <div className="p-4 bg-[#F0FDF4] rounded-lg border border-[#86EFAC] space-y-1">
          <span className="text-[#166534] font-bold block">Output Basis State</span>
          <div className="text-xl font-bold text-[#166534] pt-1">{current.output}</div>
          <span className="text-[11px] text-[#14532D]">Resulting 2-qubit state</span>
        </div>
      </div>

      {/* Dynamic Explanation Box */}
      <div className="p-4 bg-[#EFF6FF] rounded-lg border border-[#BFDBFE] text-xs text-[#1E3A8A] font-sans flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
        <div>
          <strong className="block font-bold text-[#1E40AF] mb-0.5">CNOT Transformation Action</strong>
          <p>{current.explanation}</p>
        </div>
      </div>
    </div>
  );
};
