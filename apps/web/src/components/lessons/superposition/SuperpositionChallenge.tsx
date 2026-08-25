"use client";

import React, { useState } from "react";
import { QuantumIR, runQuantumSimulation } from "@/lib/api/quantum";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";

interface Challenge {
  id: number;
  title: string;
  targetDescription: string;
  verify: (circuit: QuantumIR, probs: Record<string, number>) => boolean;
}

const CHALLENGES: Challenge[] = [
  {
    id: 1,
    title: "Challenge 1: Create Superposition State |+⟩",
    targetDescription: "Transform initial state |0⟩ into equal superposition state |+⟩ = (|0⟩+|1⟩)/√2.",
    verify: (circuit, probs) => {
      const hasH = circuit.operations.some((op) => op.gate === "h" && op.targets.includes(0));
      const p0 = probs["0"] || 0;
      const p1 = probs["1"] || 0;
      return hasH && Math.abs(p0 - 0.5) < 0.1 && Math.abs(p1 - 0.5) < 0.1;
    },
  },
  {
    id: 2,
    title: "Challenge 2: Return Superposition |+⟩ back to |0⟩",
    targetDescription: "Apply a gate sequence that converts equal superposition back into deterministic state 100% |0⟩.",
    verify: (circuit, probs) => {
      const hCount = circuit.operations.filter((op) => op.gate === "h" && op.targets.includes(0)).length;
      const p0 = probs["0"] || 0;
      return hCount >= 2 && p0 > 0.95;
    },
  },
  {
    id: 3,
    title: "Challenge 3: Equal Probabilities",
    targetDescription: "Build any single-qubit circuit that results in exact 50% / 50% measurement probabilities.",
    verify: (circuit, probs) => {
      const p0 = probs["0"] || 0;
      const p1 = probs["1"] || 0;
      return Math.abs(p0 - 0.5) < 0.1 && Math.abs(p1 - 0.5) < 0.1;
    },
  },
];

interface SuperpositionChallengeProps {
  currentCircuit?: QuantumIR;
  onEvaluate?: () => Promise<Record<string, number>>;
}

export const SuperpositionChallenge: React.FC<SuperpositionChallengeProps> = ({
  currentCircuit,
  onEvaluate,
}) => {
  const [activeChallengeIdx, setActiveChallengeIdx] = useState<number>(0);
  const [status, setStatus] = useState<"idle" | "passed" | "failed">("idle");
  const [feedback, setFeedback] = useState<string>("");

  const currentChallenge = CHALLENGES[activeChallengeIdx];

  const handleTestCircuit = async () => {
    setStatus("idle");
    setFeedback("Running evaluation...");

    try {
      let probs: Record<string, number> = {};
      const targetCircuit = currentCircuit || {
        numQubits: 1,
        numClbits: 1,
        operations: [
          { id: "op-h", gate: "h", targets: [0], moment: 0 },
          { id: "op-m", gate: "measure", targets: [0], clbits: [0], moment: 1 },
        ],
      };

      if (onEvaluate) {
        probs = await onEvaluate();
      } else {
        const res = await runQuantumSimulation({
          circuit: targetCircuit,
          options: { shots: 1024, mode: "both" },
        });
        probs = res.probabilities;
      }

      const passed = currentChallenge.verify(targetCircuit, probs);

      if (passed) {
        setStatus("passed");
        setFeedback("Challenge passed! The circuit state matches the objective.");
      } else {
        setStatus("failed");
        setFeedback("Target state not reached yet. Adjust your gate sequence and try again.");
      }
    } catch (err: any) {
      setStatus("failed");
      setFeedback(`Evaluation error: ${err.message || "Failed"}`);
    }
  };

  return (
    <div className="glass-panel p-6 bg-white border border-[#CBD5E1] rounded-xl space-y-4">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <h3 className="font-bold text-base text-[#0F172A]">Quantum Superposition Challenges</h3>
        <span className="text-xs font-mono text-[#1E40AF] bg-[#EFF6FF] px-2.5 py-1 rounded border border-[#BFDBFE] font-semibold">
          Challenge {activeChallengeIdx + 1} of {CHALLENGES.length}
        </span>
      </div>

      <div className="space-y-4">
        <div className="bg-[#F8FAFC] p-4 rounded-lg border border-[#CBD5E1] space-y-1">
          <h4 className="font-bold text-xs text-[#0F172A]">{currentChallenge.title}</h4>
          <p className="text-xs text-[#334155] font-medium leading-relaxed">{currentChallenge.targetDescription}</p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={handleTestCircuit}
            className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-lg text-xs transition shadow-xs focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:outline-none"
          >
            Check Answer
          </button>

          {activeChallengeIdx < CHALLENGES.length - 1 && (
            <button
              onClick={() => {
                setActiveChallengeIdx((prev) => prev + 1);
                setStatus("idle");
                setFeedback("");
              }}
              className="flex items-center gap-1 text-xs text-[#2563EB] hover:underline font-bold"
            >
              Next challenge <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {status !== "idle" && (
          <div
            className={`p-3 rounded-lg border flex items-center gap-2 text-xs font-semibold ${
              status === "passed"
                ? "bg-[#F0FDF4] border-[#86EFAC] text-[#14532D]"
                : "bg-[#FEF2F2] border-[#FCA5A5] text-[#7F1D1D]"
            }`}
          >
            {status === "passed" ? (
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
            )}
            <span>{feedback}</span>
          </div>
        )}
      </div>
    </div>
  );
};
