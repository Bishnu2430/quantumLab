"use client";

import React, { useState } from "react";
import { Trophy, CheckCircle2, Play } from "lucide-react";
import { runQuantumSimulation, QuantumIR } from "@/lib/api/quantum";

interface ChallengeItem {
  id: string;
  title: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  points: number;
  description: string;
  hint: string;
  initialCircuit: QuantumIR;
}

const CHALLENGE_LIST: ChallengeItem[] = [
  {
    id: "ch-1",
    title: "Create Equal Superposition (|+] State)",
    category: "Superposition",
    difficulty: "Beginner",
    points: 100,
    description: "Construct a single-qubit circuit that places initial state |0⟩ into equal superposition state |+⟩.",
    hint: "Apply a Hadamard (H) gate to qubit 0.",
    initialCircuit: {
      numQubits: 1,
      numClbits: 1,
      operations: [
        { id: "op-h", gate: "h", targets: [0], moment: 0 },
        { id: "op-m", gate: "measure", targets: [0], clbits: [0], moment: 1 },
      ],
    },
  },
  {
    id: "ch-2",
    title: "Bell State Entanglement (|Φ⁺⟩)",
    category: "Entanglement",
    difficulty: "Intermediate",
    points: 250,
    description: "Entangle two qubits into the Bell state (|00⟩ + |11⟩) / √2.",
    hint: "Apply Hadamard to qubit 0, then a CNOT with control=0 and target=1.",
    initialCircuit: {
      numQubits: 2,
      numClbits: 2,
      operations: [
        { id: "op-1", gate: "h", targets: [0], moment: 0 },
        { id: "op-2", gate: "cx", controls: [0], targets: [1], moment: 1 },
        { id: "op-3", gate: "measure", targets: [0], clbits: [0], moment: 2 },
        { id: "op-4", gate: "measure", targets: [1], clbits: [1], moment: 2 },
      ],
    },
  },
  {
    id: "ch-3",
    title: "Phase Inversion Identity (H · Z · H = X)",
    category: "Gate Identities",
    difficulty: "Intermediate",
    points: 200,
    description: "Verify that sandwiching a Z gate between two H gates produces a bit flip (X gate equivalent).",
    hint: "Apply H, Z, then H on qubit 0. Check if state flips from |0⟩ to |1⟩.",
    initialCircuit: {
      numQubits: 1,
      numClbits: 1,
      operations: [
        { id: "op-1", gate: "h", targets: [0], moment: 0 },
        { id: "op-2", gate: "z", targets: [0], moment: 1 },
        { id: "op-3", gate: "h", targets: [0], moment: 2 },
        { id: "op-4", gate: "measure", targets: [0], clbits: [0], moment: 3 },
      ],
    },
  },
];

function checkChallengeCondition(id: string, probs: Record<string, number>): boolean {
  if (id === "ch-1") {
    const p0 = probs["0"] || 0;
    const p1 = probs["1"] || 0;
    return Math.abs(p0 - 0.5) < 0.08 && Math.abs(p1 - 0.5) < 0.08;
  }
  if (id === "ch-2") {
    const p00 = probs["00"] || 0;
    const p11 = probs["11"] || 0;
    return Math.abs(p00 - 0.5) < 0.08 && Math.abs(p11 - 0.5) < 0.08;
  }
  if (id === "ch-3") {
    const p1 = probs["1"] || 0;
    return p1 > 0.95;
  }
  return false;
}

export default function ChallengesPage() {
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeItem>(CHALLENGE_LIST[0]);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ passed: boolean; message: string } | null>(null);

  const handleTestChallenge = async () => {
    setEvaluating(true);
    setTestResult(null);
    try {
      const res = await runQuantumSimulation({
        circuit: selectedChallenge.initialCircuit,
        options: { shots: 1024, mode: "both" },
      });

      const passed = checkChallengeCondition(selectedChallenge.id, res.probabilities);

      if (passed) {
        setTestResult({
          passed: true,
          message: `Challenge Solved! Qiskit Aer confirmed valid state distribution (${Object.entries(res.probabilities)
            .map(([k, v]) => `|${k}⟩: ${(v * 100).toFixed(1)}%`)
            .join(" · ")})`,
        });
      } else {
        setTestResult({
          passed: false,
          message: "Target state distribution not satisfied yet. Check gate sequence and retry.",
        });
      }
    } catch (err: any) {
      setTestResult({ passed: false, message: `Error: ${err.message}` });
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6 bg-white">
      {/* Title Banner */}
      <div className="glass-panel p-6 bg-slate-50 border border-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-blue-600 font-mono text-xs font-black uppercase tracking-wider">
          <Trophy className="w-4 h-4 text-blue-600" /> Quantum Challenges Hub
        </div>
        <h1 className="text-2xl font-black text-black tracking-tight">Interactive Challenges</h1>
        <p className="text-xs text-slate-800 font-medium max-w-2xl leading-relaxed">
          Test your quantum computing skills by building circuits that solve specific state-preparation targets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Challenge Selection List (Col-span-5) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-mono text-blue-600 font-black uppercase tracking-wider px-1">Select Challenge</div>
          {CHALLENGE_LIST.map((ch) => {
            const isSelected = selectedChallenge.id === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => {
                  setSelectedChallenge(ch);
                  setTestResult(null);
                }}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-blue-50 border-blue-500 shadow-md font-bold"
                    : "bg-white border-slate-300 hover:border-blue-400"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-blue-600 font-black">{ch.category}</span>
                  <span className="px-2 py-0.5 bg-amber-50 border border-amber-300 text-amber-800 rounded font-bold">
                    +{ch.points} pts
                  </span>
                </div>
                <h3 className="font-black text-sm text-black">{ch.title}</h3>
                <p className="text-xs text-slate-800 font-medium mt-1 line-clamp-2">{ch.description}</p>
              </button>
            );
          })}
        </div>

        {/* Selected Challenge Details & Runner (Col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-6 bg-slate-50 border border-slate-300 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-300 pb-3">
              <h2 className="font-black text-lg text-black">{selectedChallenge.title}</h2>
              <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-300 font-bold">
                {selectedChallenge.difficulty}
              </span>
            </div>

            <p className="text-xs text-slate-800 font-medium leading-relaxed">{selectedChallenge.description}</p>

            <div className="p-3 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 font-bold space-y-1">
              <div className="text-blue-600 text-[11px] font-black">Hint / Strategy</div>
              <div>{selectedChallenge.hint}</div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={handleTestChallenge}
                disabled={evaluating}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-lg text-xs shadow-md transition disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-white text-white" />
                {evaluating ? "Executing Qiskit Aer..." : "Run & Test Circuit"}
              </button>
            </div>

            {testResult && (
              <div
                className={`p-4 rounded-lg border text-xs font-mono font-bold ${
                  testResult.passed
                    ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                    : "bg-red-50 border-red-300 text-red-950"
                }`}
              >
                <div className="flex items-center gap-2 font-black mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{testResult.passed ? "Challenge Solved!" : "Test Failed"}</span>
                </div>
                <p>{testResult.message}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
