"use client";

import React from "react";
import { SimulationResult } from "@/lib/api/quantum";
import { BarChart2, Info } from "lucide-react";

interface ShotsExplanationPanelProps {
  result: SimulationResult | null;
  shots: number;
  onShotsChange: (newShots: number) => void;
}

export const ShotsExplanationPanel: React.FC<ShotsExplanationPanelProps> = ({
  result,
  shots,
  onShotsChange,
}) => {
  return (
    <div className="glass-panel p-5 bg-white border border-[#CBD5E1] rounded-xl space-y-4 font-mono text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
        <div className="flex items-center gap-2 text-[#2563EB] font-bold uppercase tracking-wider">
          <BarChart2 className="w-4 h-4 text-[#2563EB]" />
          <span>Shots Sampling & Statistical Distribution</span>
        </div>

        {/* Shots Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[#334155] font-bold font-sans">Shots Count (N):</span>
          <select
            value={shots}
            onChange={(e) => onShotsChange(Number(e.target.value))}
            className="px-2.5 py-1 bg-[#F1F5F9] border border-[#CBD5E1] rounded text-[#0F172A] font-bold"
          >
            <option value={10}>10 Shots (High Fluctuation)</option>
            <option value={100}>100 Shots</option>
            <option value={1024}>1,024 Shots (Standard)</option>
            <option value={8192}>8,192 Shots (High Precision)</option>
          </select>
        </div>
      </div>

      {/* Educational Explanation Box */}
      <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg text-[#1E3A8A] font-sans space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-[#1E40AF]">
          <Info className="w-4 h-4 text-[#2563EB]" />
          <span>What is a &quot;Shot&quot; in Quantum Computing?</span>
        </div>
        <p className="text-xs leading-relaxed">
          One shot means preparing the quantum circuit once and performing a projective Z-basis measurement. Because quantum states collapse probabilistically, repeating the experiment for N shots generates a statistical frequency distribution that approaches Born&apos;s Rule probabilities.
        </p>
      </div>

      {/* Real Backend Counts Visualization */}
      {result?.counts ? (
        <div className="space-y-2">
          <span className="font-bold text-[#0F172A] block">Empirical Measurement Counts ({result.shots} Shots):</span>
          <div className="space-y-2">
            {Object.entries(result.counts).map(([bitstring, count]) => {
              const percentage = ((count / result.shots) * 100).toFixed(1);
              return (
                <div key={bitstring} className="space-y-1">
                  <div className="flex justify-between font-bold text-[#0F172A]">
                    <span>Basis State |{bitstring}⟩</span>
                    <span className="text-[#2563EB]">{count} counts ({percentage}%)</span>
                  </div>
                  <div className="w-full h-3 bg-[#E2E8F0] rounded overflow-hidden">
                    <div
                      className="h-full bg-[#2563EB] rounded transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-3 bg-[#F8FAFC] rounded border border-[#CBD5E1] text-[#64748B] text-center">
          Run simulation to see real IBM Qiskit Aer shot count sampling distribution.
        </div>
      )}
    </div>
  );
};
