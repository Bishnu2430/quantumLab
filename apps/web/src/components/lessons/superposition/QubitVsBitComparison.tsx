"use client";

import React, { useState } from "react";
import { Binary, Sparkles } from "lucide-react";

export const QubitVsBitComparison: React.FC = () => {
  const [alpha, setAlpha] = useState<number>(0.7071);
  const beta = Math.sqrt(Math.max(0, 1 - alpha * alpha));

  const prob0 = (alpha * alpha * 100).toFixed(1);
  const prob1 = (beta * beta * 100).toFixed(1);

  return (
    <div className="glass-panel rounded-xl p-6 bg-white border border-[#CBD5E1] space-y-6">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
        <div>
          <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
            <Binary className="w-5 h-5 text-[#2563EB]" />
            Classical Bit vs Quantum Qubit
          </h3>
          <p className="text-xs text-[#334155] font-medium mt-0.5">
            A qubit is not &quot;both 0 and 1 simultaneously&quot; — it is a linear combination of basis vectors in a complex Hilbert space.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Classical Bit Box */}
        <div className="bg-[#F8FAFC] rounded-lg p-5 border border-[#CBD5E1] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#334155]">Classical Bit</span>
            <span className="text-xs font-mono bg-white px-2 py-0.5 rounded text-[#0F172A] border border-[#CBD5E1] font-semibold">
              Deterministic
            </span>
          </div>

          <div className="py-6 flex items-center justify-center gap-6">
            <div className="w-16 h-16 rounded-xl bg-white border-2 border-[#CBD5E1] flex items-center justify-center font-mono font-extrabold text-2xl text-[#0F172A] shadow-xs">
              0
            </div>
            <span className="text-xs text-[#334155] font-bold">OR</span>
            <div className="w-16 h-16 rounded-xl bg-white border-2 border-[#CBD5E1] flex items-center justify-center font-mono font-extrabold text-2xl text-[#0F172A] shadow-xs">
              1
            </div>
          </div>

          <p className="text-xs text-[#334155] font-medium leading-relaxed">
            Must be in exactly state <b>0</b> or state <b>1</b>. Measurement directly reveals the pre-existing value without probabilistic uncertainty.
          </p>
        </div>

        {/* Quantum Qubit Box */}
        <div className="bg-[#EFF6FF] rounded-lg p-5 border border-[#BFDBFE] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E40AF] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" /> Quantum Qubit (|Ψ⟩)
            </span>
            <span className="text-xs font-mono bg-white px-2 py-0.5 rounded text-[#1E40AF] border border-[#BFDBFE] font-bold">
              State Vector
            </span>
          </div>

          <div className="bg-white rounded-lg p-3 border border-[#BFDBFE] font-mono text-center text-sm font-bold text-[#0F172A] shadow-xs">
            |Ψ⟩ = <span className="text-[#2563EB]">{alpha.toFixed(3)}</span>|0⟩ + <span className="text-[#0284C7]">{beta.toFixed(3)}</span>|1⟩
          </div>

          {/* Interactive Amplitude Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#1E40AF] font-semibold">α = {alpha.toFixed(3)} (P(0): {prob0}%)</span>
              <span className="text-[#0369A1] font-semibold">β = {beta.toFixed(3)} (P(1): {prob1}%)</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={alpha}
              onChange={(e) => setAlpha(parseFloat(e.target.value))}
              className="w-full h-2 bg-[#DBEAFE] rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
            />
            <div className="text-[11px] text-[#334155] text-center font-mono font-medium">
              Normalization Constraint: |α|² + |β|² = <span className="text-[#059669] font-bold">1.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
