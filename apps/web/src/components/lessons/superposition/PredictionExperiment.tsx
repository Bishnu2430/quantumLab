"use client";

import React, { useState } from "react";
import { QuantumIR, runQuantumSimulation, SimulationResult } from "@/lib/api/quantum";
import { HelpCircle, Play, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

interface QuestionSpec {
  id: string;
  title: string;
  circuitDesc: string;
  circuit: QuantumIR;
  options: { id: string; label: string; correct: boolean; explanation: string }[];
}

const EXPERIMENTS: QuestionSpec[] = [
  {
    id: "exp-1",
    title: "Experiment 1: Single Hadamard (H|0⟩)",
    circuitDesc: "q0: |0⟩ ── H ── M",
    circuit: {
      numQubits: 1,
      numClbits: 1,
      operations: [
        { id: "op-h1", gate: "h", targets: [0], moment: 0 },
        { id: "op-m1", gate: "measure", targets: [0], clbits: [0], moment: 1 },
      ],
    },
    options: [
      { id: "A", label: "Always 100% state |0⟩", correct: false, explanation: "Incorrect. Hadamard transforms |0⟩ into equal superposition |+⟩." },
      { id: "B", label: "Always 100% state |1⟩", correct: false, explanation: "Incorrect. Pauli-X flips |0⟩ to |1⟩, but Hadamard creates superposition." },
      { id: "C", label: "Approximately 50% |0⟩ and 50% |1⟩", correct: true, explanation: "Correct! H|0⟩ creates |+⟩ with equal amplitudes (α=1/√2, β=1/√2), giving 50% probability for each state." },
      { id: "D", label: "Random outcome with 0% probability for both", correct: false, explanation: "Incorrect. Probabilities must sum to 100% (|α|² + |β|² = 1)." },
    ],
  },
  {
    id: "exp-2",
    title: "Experiment 2: Double Hadamard (H²|0⟩)",
    circuitDesc: "q0: |0⟩ ── H ── H ── M",
    circuit: {
      numQubits: 1,
      numClbits: 1,
      operations: [
        { id: "op-h1", gate: "h", targets: [0], moment: 0 },
        { id: "op-h2", gate: "h", targets: [0], moment: 1 },
        { id: "op-m1", gate: "measure", targets: [0], clbits: [0], moment: 2 },
      ],
    },
    options: [
      { id: "A", label: "100% state |0⟩ (Returns to initial state)", correct: true, explanation: "Correct! H is its own inverse (H² = I). Applying H twice returns the qubit to its original state |0⟩." },
      { id: "B", label: "50% |0⟩ and 50% |1⟩", correct: false, explanation: "Incorrect. While H|0⟩ is a 50/50 superposition, applying H a second time causes quantum interference that undoes the superposition!" },
      { id: "C", label: "100% state |1⟩", correct: false, explanation: "Incorrect. H² = I, not Pauli-X." },
    ],
  },
  {
    id: "exp-3",
    title: "Experiment 3: Hadamard on state |1⟩ (H|1⟩)",
    circuitDesc: "q0: |0⟩ ── X ── H ── M",
    circuit: {
      numQubits: 1,
      numClbits: 1,
      operations: [
        { id: "op-x1", gate: "x", targets: [0], moment: 0 },
        { id: "op-h1", gate: "h", targets: [0], moment: 1 },
        { id: "op-m1", gate: "measure", targets: [0], clbits: [0], moment: 2 },
      ],
    },
    options: [
      { id: "A", label: "50% |0⟩ and 50% |1⟩ (with negative relative phase in |1⟩)", correct: true, explanation: "Correct! H|1⟩ produces |−⟩ = (|0⟩ - |1⟩)/√2. Computational measurement gives 50/50, but the amplitude of |1⟩ has a negative sign (-0.7071)!" },
      { id: "B", label: "100% state |0⟩", correct: false, explanation: "Incorrect. H|1⟩ creates superposition state |−⟩." },
      { id: "C", label: "100% state |1⟩", correct: false, explanation: "Incorrect." },
    ],
  },
];

export const PredictionExperiment: React.FC = () => {
  const [activeExpIdx, setActiveExpIdx] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const exp = EXPERIMENTS[activeExpIdx];
  const selectedOption = exp.options.find((o) => o.id === selectedOptionId);

  const handleRunSimulation = async () => {
    if (!selectedOptionId) return;
    setIsSimulating(true);

    try {
      const res = await runQuantumSimulation({
        circuit: exp.circuit,
        options: { shots: 1024, mode: "both" },
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleNextExp = () => {
    setSelectedOptionId(null);
    setResult(null);
    setActiveExpIdx((prev) => (prev + 1) % EXPERIMENTS.length);
  };

  return (
    <div className="glass-panel rounded-xl p-6 bg-white border border-[#CBD5E1] space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div>
          <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#2563EB]" />
            Predict ➔ Simulate ➔ Observe Experiment
          </h3>
          <p className="text-xs text-[#334155] font-medium mt-0.5">
            Test your intuition before executing real Qiskit quantum simulations.
          </p>
        </div>

        {/* Experiment Selector Tabs */}
        <div className="flex bg-[#F1F5F9] p-1 rounded-lg border border-[#CBD5E1] text-xs font-semibold">
          {EXPERIMENTS.map((e, idx) => (
            <button
              key={e.id}
              onClick={() => {
                setActiveExpIdx(idx);
                setSelectedOptionId(null);
                setResult(null);
              }}
              className={`px-3 py-1.5 rounded-md transition ${
                activeExpIdx === idx
                  ? "bg-[#2563EB] text-white shadow-xs font-bold"
                  : "text-[#334155] hover:text-[#0F172A]"
              }`}
            >
              Exp {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {/* Title & Circuit Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#F8FAFC] p-4 rounded-lg border border-[#CBD5E1]">
          <span className="text-sm font-bold text-[#0F172A]">{exp.title}</span>
          <span className="font-mono text-xs px-3 py-1 bg-white border border-[#BFDBFE] text-[#1E40AF] font-bold rounded-md">
            {exp.circuitDesc}
          </span>
        </div>

        {/* Options Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#334155] block">
            Select Your Prediction:
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            {exp.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedOptionId(opt.id)}
                  className={`w-full text-left p-3.5 rounded-lg border text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-[#EFF6FF] border-[#2563EB] text-[#0F172A] ring-1 ring-[#2563EB] font-semibold"
                      : "bg-white border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <span className="font-bold mr-2 text-[#2563EB]">{opt.id}.</span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Run Simulation Action Button */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleRunSimulation}
            disabled={!selectedOptionId || isSimulating}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-lg text-xs shadow-xs transition disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:outline-none"
          >
            <Play className="w-4 h-4 fill-white" />
            {isSimulating ? "Executing Qiskit Simulation..." : "Run Qiskit Simulation & Compare"}
          </button>

          {result && (
            <button
              onClick={handleNextExp}
              className="flex items-center gap-1 text-xs text-[#2563EB] hover:text-[#1D4ED8] font-bold"
            >
              Next Experiment <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Simulation Output Comparison Panel */}
        {result && selectedOption && (
          <div
            className={`p-5 rounded-lg border space-y-3 ${
              selectedOption.correct
                ? "bg-[#F0FDF4] border-[#86EFAC] text-[#14532D]"
                : "bg-[#FFFBEB] border-[#FDE68A] text-[#78350F]"
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {selectedOption.correct ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
                  <span>Prediction Verified Correct!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-[#D97706]" />
                  <span>Prediction Mismatch</span>
                </>
              )}
            </div>

            <p className="text-xs leading-relaxed font-medium">{selectedOption.explanation}</p>

            <div className="bg-white p-3 rounded-md border border-[#CBD5E1] space-y-1 font-mono text-xs text-[#0F172A]">
              <div className="text-[#334155] font-bold mb-1">VERIFIED QISKIT AER EXECUTION OUTPUT:</div>
              <div className="flex justify-between">
                <span>Backend:</span> <span className="text-[#2563EB] font-bold">{result.backend}</span>
              </div>
              <div className="flex justify-between">
                <span>Measured Probabilities:</span>
                <span className="text-[#059669] font-bold">
                  {Object.entries(result.probabilities)
                    .map(([k, v]) => `|${k}⟩: ${(v * 100).toFixed(1)}%`)
                    .join(" | ")}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
