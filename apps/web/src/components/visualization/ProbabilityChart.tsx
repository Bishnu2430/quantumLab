"use client";

import React, { useState } from "react";
import { BarChart3, Info } from "lucide-react";

interface ProbabilityChartProps {
  probabilities: Record<string, number>;
  counts?: Record<string, number>;
  shots?: number;
}

export const ProbabilityChart: React.FC<ProbabilityChartProps> = ({
  probabilities,
  counts,
  shots = 1024,
}) => {
  const [viewMode, setViewMode] = useState<"both" | "observed" | "theory">("both");

  // Get all basis state keys from both probabilities and counts
  const allStateKeys = Array.from(
    new Set([...Object.keys(probabilities), ...(counts ? Object.keys(counts) : [])])
  ).sort();

  return (
    <div className="glass-panel p-4 space-y-3 bg-white border border-[#CBD5E1] rounded-xl font-mono text-xs">
      <div className="flex flex-wrap items-center justify-between border-b border-[#E2E8F0] pb-2 gap-2">
        <div className="flex items-center gap-1.5 text-[#0F172A] font-bold">
          <BarChart3 className="w-4 h-4 text-[#2563EB]" />
          <span>Measurement Probabilities</span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#F1F5F9] rounded p-0.5 border border-[#CBD5E1] text-[10px]">
            <button
              onClick={() => setViewMode("both")}
              className={`px-2 py-0.5 rounded font-bold transition ${
                viewMode === "both" ? "bg-[#2563EB] text-white" : "text-[#475569] hover:bg-[#E2E8F0]"
              }`}
            >
              Theory vs Observed
            </button>
            <button
              onClick={() => setViewMode("observed")}
              className={`px-2 py-0.5 rounded font-bold transition ${
                viewMode === "observed" ? "bg-[#2563EB] text-white" : "text-[#475569] hover:bg-[#E2E8F0]"
              }`}
            >
              Observed
            </button>
            <button
              onClick={() => setViewMode("theory")}
              className={`px-2 py-0.5 rounded font-bold transition ${
                viewMode === "theory" ? "bg-[#2563EB] text-white" : "text-[#475569] hover:bg-[#E2E8F0]"
              }`}
            >
              Theory
            </button>
          </div>

          {shots && (
            <span className="text-[11px] font-mono text-[#475569] bg-[#F1F5F9] px-2 py-0.5 rounded border border-[#CBD5E1]">
              Shots: {shots}
            </span>
          )}
        </div>
      </div>

      {allStateKeys.length === 0 ? (
        <div className="text-center py-6 text-[#64748B] text-xs italic font-sans">
          Run simulation to observe outcome probabilities.
        </div>
      ) : (
        <div className="space-y-3">
          {allStateKeys.map((bitstring) => {
            const theoryProb = probabilities[bitstring] || 0.0;
            const theoryPct = (theoryProb * 100).toFixed(1);

            const countVal = counts ? counts[bitstring] || 0 : null;
            const observedProb = countVal !== null && shots > 0 ? countVal / shots : theoryProb;
            const observedPct = (observedProb * 100).toFixed(1);

            const devPct = (observedProb * 100 - theoryProb * 100).toFixed(1);
            const devSign = parseFloat(devPct) > 0 ? `+${devPct}` : devPct;

            return (
              <div key={bitstring} className="space-y-1 bg-[#F8FAFC] p-2.5 rounded-lg border border-[#CBD5E1]">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-white border border-[#CBD5E1] text-[#2563EB] rounded font-extrabold shadow-xs">
                      |{bitstring}⟩
                    </span>
                    {countVal !== null && (
                      <span className="text-[#475569] text-[11px] font-bold">
                        ({countVal} counts)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {viewMode !== "theory" && countVal !== null && (
                      <span className="text-[#166534] font-extrabold">
                        Observed: {observedPct}%
                      </span>
                    )}
                    {viewMode !== "observed" && (
                      <span className="text-[#2563EB] font-bold">
                        Theory: {theoryPct}%
                      </span>
                    )}
                    {viewMode === "both" && countVal !== null && Math.abs(parseFloat(devPct)) > 0.01 && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          parseFloat(devPct) > 0
                            ? "bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]"
                            : "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]"
                        }`}
                      >
                        Dev: {devSign}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bars */}
                {viewMode !== "theory" && countVal !== null && (
                  <div className="w-full h-2.5 bg-[#E2E8F0] rounded overflow-hidden border border-[#CBD5E1]">
                    <div
                      className="h-full bg-[#166534] rounded transition-all duration-300 shadow-xs"
                      style={{ width: `${Math.max(observedProb * 100, 1)}%` }}
                      title={`Observed: ${observedPct}% (${countVal}/${shots} counts)`}
                    />
                  </div>
                )}

                {viewMode === "theory" && (
                  <div className="w-full h-2.5 bg-[#E2E8F0] rounded overflow-hidden border border-[#CBD5E1]">
                    <div
                      className="h-full bg-[#2563EB] rounded transition-all duration-300 shadow-xs"
                      style={{ width: `${Math.max(theoryProb * 100, 1)}%` }}
                      title={`Theoretical: ${theoryPct}%`}
                    />
                  </div>
                )}
              </div>
            );
          })}

          <div className="p-2.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg text-[11px] font-sans text-[#1E3A8A] flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-[#2563EB] shrink-0 mt-0.5" />
            <span>
              <strong>Theory vs Observation:</strong> Quantum theory predicts exact probabilities P = |&alpha;|². Finite measurements (N = {shots} shots) produce empirical frequencies (P_observed = counts/N) that fluctuate around theoretical values due to statistical sampling.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
