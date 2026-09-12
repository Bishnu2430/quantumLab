"use client";

import React, { useState } from "react";
import { runQuantumSimulation, SimulationResult } from "@/lib/api/quantum";
import { Info } from "lucide-react";

export const MeasurementShotExperiment: React.FC = () => {
  const [shots, setShots] = useState<number>(1024);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const handleRunShots = async (shotCount: number) => {
    setShots(shotCount);
    setIsSimulating(true);
    try {
      const res = await runQuantumSimulation({
        circuit: {
          numQubits: 1,
          numClbits: 1,
          operations: [
            { id: "op-h", gate: "h", targets: [0], moment: 0 },
            { id: "op-m", gate: "measure", targets: [0], clbits: [0], moment: 1 },
          ],
        },
        options: { shots: shotCount, mode: "both" },
      });
      setResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const count0 = result?.counts ? result.counts["0"] || 0 : 0;
  const count1 = result?.counts ? result.counts["1"] || 0 : 0;

  const observedProb0 = result?.shots ? ((count0 / result.shots) * 100).toFixed(2) : "50.00";
  const observedProb1 = result?.shots ? ((count1 / result.shots) * 100).toFixed(2) : "50.00";

  return (
    <div className="glass-panel p-6 bg-white border border-[#CBD5E1] rounded-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div>
          <h3 className="font-bold text-base text-[#0F172A]">Compare shot counts</h3>
          <p className="text-xs text-[#334155] font-medium mt-0.5">
            Run different shot counts to observe how measurement sampling approaches theoretical probabilities.
          </p>
        </div>

        {/* Shot Count Selector Buttons */}
        <div className="flex bg-[#F1F5F9] p-1 rounded-lg border border-[#CBD5E1] text-xs font-mono">
          {[10, 100, 1024, 10000].map((s) => (
            <button
              key={s}
              onClick={() => handleRunShots(s)}
              disabled={isSimulating}
              className={`px-3 py-1 rounded transition ${
                shots === s
                  ? "bg-[#2563EB] text-white font-bold shadow-xs"
                  : "text-[#334155] hover:text-[#0F172A]"
              }`}
            >
              {s.toLocaleString()} shots
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theoretical Probability Box */}
        <div className="bg-[#F8FAFC] p-4 rounded-lg border border-[#CBD5E1] space-y-3">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-[#0F172A] font-bold">Theoretical probability</span>
            <span className="text-[#334155] font-medium">Statevector</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#0F172A] font-medium">P(0):</span>
                <span className="text-[#2563EB] font-bold">50.00%</span>
              </div>
              <div className="w-full h-2.5 bg-[#E2E8F0] rounded overflow-hidden">
                <div className="h-full bg-[#2563EB] rounded" style={{ width: "50%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#0F172A] font-medium">P(1):</span>
                <span className="text-[#0284C7] font-bold">50.00%</span>
              </div>
              <div className="w-full h-2.5 bg-[#E2E8F0] rounded overflow-hidden">
                <div className="h-full bg-[#0284C7] rounded" style={{ width: "50%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Observed Shot Sampling Box */}
        <div className="bg-[#F8FAFC] p-4 rounded-lg border border-[#CBD5E1] space-y-3">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-[#0F172A] font-bold">Observed counts</span>
            <span className="text-[#334155] font-medium">{shots.toLocaleString()} shots</span>
          </div>

          {result ? (
            <div className="space-y-2 font-mono text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#0F172A] font-medium">0 outcome ({count0} shots):</span>
                  <span className="text-[#2563EB] font-bold">{observedProb0}%</span>
                </div>
                <div className="w-full h-2.5 bg-[#E2E8F0] rounded overflow-hidden">
                  <div
                    className="h-full bg-[#2563EB] rounded transition-all duration-300"
                    style={{ width: `${observedProb0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#0F172A] font-medium">1 outcome ({count1} shots):</span>
                  <span className="text-[#0284C7] font-bold">{observedProb1}%</span>
                </div>
                <div className="w-full h-2.5 bg-[#E2E8F0] rounded overflow-hidden">
                  <div
                    className="h-full bg-[#0284C7] rounded transition-all duration-300"
                    style={{ width: `${observedProb1}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-[#64748B] italic">
              Click a shot button above to run Qiskit Aer simulation.
            </div>
          )}
        </div>
      </div>

      <div className="p-3.5 bg-[#EFF6FF] rounded-lg text-xs text-[#1E3A8A] flex items-start gap-2 border border-[#BFDBFE]">
        <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-[#1E40AF] block">Why the results vary:</span>
          <span className="font-medium leading-relaxed">
            With fewer shots (e.g. 10), measurement sampling exhibits statistical fluctuation. As shot count increases (10,000), observed frequencies converge to theoretical probabilities under the Law of Large Numbers.
          </span>
        </div>
      </div>
    </div>
  );
};
