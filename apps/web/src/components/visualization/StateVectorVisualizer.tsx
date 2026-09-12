"use client";

import React from "react";
import { ComplexAmplitude } from "@/lib/api/quantum";
import { Compass, Info } from "lucide-react";

interface StateVectorVisualizerProps {
  statevector?: ComplexAmplitude[];
}

export const StateVectorVisualizer: React.FC<StateVectorVisualizerProps> = ({ statevector }) => {
  if (!statevector || statevector.length === 0) {
    return (
      <div className="glass-panel p-4 text-center text-[#64748B] text-xs italic font-sans bg-white border border-[#CBD5E1] rounded-xl">
        Run statevector simulation to inspect complex probability amplitudes.
      </div>
    );
  }

  const numQubits = Math.log2(statevector.length);

  return (
    <div className="glass-panel p-4 space-y-3 bg-white border border-[#CBD5E1] rounded-xl font-mono text-xs">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
        <div className="flex items-center gap-1.5 text-[#0F172A] font-bold">
          <Compass className="w-4 h-4 text-[#2563EB]" />
          <span>State Vector Amplitudes (|Ψ⟩)</span>
        </div>
        <span className="text-[11px] text-[#475569] font-bold bg-[#F1F5F9] px-2 py-0.5 rounded border border-[#CBD5E1]">
          2^{numQubits} = {statevector.length} Hilbert Space
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {statevector.map((amp) => {
          const isNonZero = amp.magnitude > 1e-6;
          const phaseDeg = isNonZero ? `${((amp.phase * 180) / Math.PI).toFixed(1)}°` : "—";
          const probPct = (amp.magnitude * 100).toFixed(1);

          return (
            <div
              key={amp.state}
              className={`p-2.5 rounded-lg border transition-all ${
                isNonZero
                  ? "bg-[#EFF6FF] border-[#BFDBFE] shadow-xs"
                  : "bg-[#F8FAFC] border-[#CBD5E1] opacity-60"
              }`}
            >
              <div className="flex items-center justify-between font-mono text-xs mb-1.5">
                <span className="px-1.5 py-0.5 bg-white border border-[#CBD5E1] text-[#2563EB] rounded font-extrabold shadow-xs">
                  |{amp.state}⟩
                </span>
                <span className="text-[#2563EB] font-bold">{probPct}%</span>
              </div>

              <div className="space-y-0.5 text-[11px] font-mono text-[#0F172A]">
                <div className="flex justify-between">
                  <span className="text-[#475569]">Amp:</span>
                  <span className="font-bold">
                    {amp.real >= 0 ? `+${amp.real}` : amp.real} {amp.imag >= 0 ? `+ ${amp.imag}i` : `- ${Math.abs(amp.imag)}i`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#475569]">Mag (|α|²):</span>
                  <span>{amp.magnitude}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#475569]">Phase:</span>
                  <span className={`font-bold ${isNonZero ? "text-[#2563EB]" : "text-[#94A3B8]"}`}>
                    {phaseDeg}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[11px] font-sans text-[#334155] flex items-center gap-2">
        <Info className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
        <span>
          <strong>Phase Rule:</strong> For zero complex amplitude (|&alpha;| &lt; 10⁻⁶), phase angle arg(0) is mathematically undefined (represented as <code>—</code>).
        </span>
      </div>
    </div>
  );
};
