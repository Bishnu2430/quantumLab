"use client";

import React, { useState } from "react";
import { SimulationResult } from "@/lib/api/quantum";
import { HelpCircle, CheckCircle2, XCircle, ArrowRight, Sparkles } from "lucide-react";

interface PredictionPanelProps {
  result: SimulationResult | null;
  onRunSimulation: () => void;
  isLoading: boolean;
}

export const PREDICTION_OPTIONS = [
  { id: "bell", label: "50% |00⟩, 50% |11⟩", description: "Bell State / Maximally Entangled State" },
  { id: "superposition", label: "25% |00⟩, 25% |01⟩, 25% |10⟩, 25% |11⟩", description: "Uniform Superposition State" },
  { id: "zero", label: "100% |00⟩", description: "Ground Basis State" },
  { id: "one", label: "100% |11⟩", description: "Excited Basis State" },
];

export const PredictionPanel: React.FC<PredictionPanelProps> = ({
  result,
  onRunSimulation,
  isLoading,
}) => {
  const [selectedPrediction, setSelectedPrediction] = useState<string | null>(null);

  const getAccuracyFeedback = () => {
    if (!result || !selectedPrediction) return null;

    const probs = result.probabilities || {};
    const topState = Object.entries(probs).sort((a, b) => b[1] - a[1])[0];

    let isCorrect = false;
    let explanation = "";

    if (selectedPrediction === "bell") {
      const p00 = probs["00"] || 0;
      const p11 = probs["11"] || 0;
      isCorrect = p00 > 0.4 && p11 > 0.4 && Object.keys(probs).length === 2;
      explanation = isCorrect
        ? "Spot on! The circuit generates the Bell state (|00⟩+|11⟩)/√2, giving 50% probability for |00⟩ and 50% for |11⟩."
        : `Your prediction expected a Bell state, but the observed state was dominated by |${topState ? topState[0] : "00"}⟩.`;
    } else if (selectedPrediction === "superposition") {
      const numEqual = Object.values(probs).filter((p) => p >= 0.2).length;
      isCorrect = numEqual >= 4;
      explanation = isCorrect
        ? "Correct! Hadamard gates on all wires create a uniform superposition where every basis state has equal probability."
        : "Not quite equal superposition. Check if all qubits received Hadamard gates.";
    } else if (selectedPrediction === "zero") {
      isCorrect = (probs["0"] || probs["00"] || probs["000"] || 0) > 0.95;
      explanation = isCorrect
        ? "Correct! The circuit remains in ground state |0...0⟩."
        : "The state evolved away from ground state.";
    } else if (selectedPrediction === "one") {
      isCorrect = (probs["1"] || probs["11"] || probs["111"] || 0) > 0.95;
      explanation = isCorrect
        ? "Correct! Bit-flip (X) gates flipped the qubits into excited state |1...1⟩."
        : "The state did not flip entirely to |1...1⟩.";
    }

    return { isCorrect, explanation };
  };

  const feedback = getAccuracyFeedback();

  return (
    <div className="glass-panel p-5 bg-white border border-[#CBD5E1] rounded-xl font-mono text-xs space-y-4">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
        <div className="flex items-center gap-2 text-[#2563EB] font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-[#2563EB]" />
          <span>Predict Before Run (Hypothesis Testing)</span>
        </div>
        <span className="text-[11px] font-bold text-[#475569] bg-[#F1F5F9] px-2 py-0.5 rounded border border-[#CBD5E1]">
          Educational Step
        </span>
      </div>

      <p className="text-[#334155] font-sans text-xs">
        Formulate a theoretical hypothesis! Select your predicted outcome before executing the real Qiskit Aer simulation.
      </p>

      {/* Prediction Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PREDICTION_OPTIONS.map((opt) => {
          const isSelected = selectedPrediction === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setSelectedPrediction(opt.id)}
              className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? "bg-[#EFF6FF] border-[#2563EB] ring-2 ring-[#2563EB] ring-offset-1 font-bold text-[#1E40AF]"
                  : "bg-[#F8FAFC] border-[#CBD5E1] hover:bg-[#E2E8F0] text-[#0F172A]"
              }`}
            >
              <span className="text-sm font-extrabold">{opt.label}</span>
              <span className="text-[11px] text-[#475569] mt-1 font-sans">{opt.description}</span>
            </button>
          );
        })}
      </div>

      {/* Execute with Prediction Button */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onRunSimulation}
          disabled={isLoading || !selectedPrediction}
          className="flex items-center gap-2 px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-lg shadow-xs transition-all disabled:opacity-50"
        >
          <span>Run Simulation & Validate Prediction</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Feedback Banner */}
      {result && feedback && (
        <div
          className={`p-3.5 rounded-lg border text-xs font-sans space-y-1.5 ${
            feedback.isCorrect
              ? "bg-[#F0FDF4] border-[#86EFAC] text-[#166534]"
              : "bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B]"
          }`}
        >
          <div className="flex items-center gap-2 font-bold font-mono">
            {feedback.isCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                <span>HYPOTHESIS CONFIRMED!</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-[#DC2626]" />
                <span>HYPOTHESIS DISPROVED</span>
              </>
            )}
          </div>
          <p>{feedback.explanation}</p>
        </div>
      )}
    </div>
  );
};
