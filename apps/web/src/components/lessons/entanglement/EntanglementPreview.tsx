"use client";

import React, { useState } from "react";
import { Network, Play, ArrowRight } from "lucide-react";
import { runQuantumSimulation } from "@/lib/api/quantum";

export const EntanglementPreview: React.FC = () => {
  const [step, setStep] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [probabilities, setProbabilities] = useState<Record<string, number>>({ "00": 1.0 });

  const steps = [
    {
      title: "Step 1: Initial State |00⟩",
      desc: "Both qubits q0 and q1 start in computational basis state |0⟩.",
      circuit: {
        numQubits: 2,
        numClbits: 2,
        operations: [],
      },
    },
    {
      title: "Step 2: Apply Hadamard H(q0)",
      desc: "Qubit 0 enters superposition state |+⟩, producing state (|00⟩ + |10⟩) / √2.",
      circuit: {
        numQubits: 2,
        numClbits: 2,
        operations: [{ id: "op-h", gate: "h" as const, targets: [0], moment: 0 }],
      },
    },
    {
      title: "Step 3: Apply CNOT CX(q0 → q1)",
      desc: "CNOT entangles q0 and q1. Measurement of q0 instantaneously forces q1 into the same state: Bell state (|00⟩ + |11⟩) / √2.",
      circuit: {
        numQubits: 2,
        numClbits: 2,
        operations: [
          { id: "op-h", gate: "h" as const, targets: [0], moment: 0 },
          { id: "op-cx", gate: "cx" as const, controls: [0], targets: [1], moment: 1 },
          { id: "op-m0", gate: "measure" as const, targets: [0], clbits: [0], moment: 2 },
          { id: "op-m1", gate: "measure" as const, targets: [1], clbits: [1], moment: 2 },
        ],
      },
    },
  ];

  const handleStepChange = async (newStep: number) => {
    setStep(newStep);
    setIsSimulating(true);
    try {
      const res = await runQuantumSimulation({
        circuit: steps[newStep].circuit,
        options: { shots: 1024, mode: "both" },
      });
      setProbabilities(res.probabilities);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="glass-panel p-6 bg-white border border-[#E2E8F0] space-y-4">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <div className="flex items-center gap-2 text-[#2563EB] font-bold text-xs uppercase font-mono tracking-wider">
          <Network className="w-4 h-4 text-[#2563EB]" />
          <span>Multi-Qubit Entanglement Preview</span>
        </div>
        <span className="text-xs font-mono text-[#64748B] font-semibold">
          Step {step + 1} of {steps.length}
        </span>
      </div>

      <div className="space-y-2">
        <h4 className="font-bold text-sm text-[#0F172A]">{steps[step].title}</h4>
        <p className="text-xs text-[#475569] leading-relaxed">{steps[step].desc}</p>
      </div>

      {/* Probabilities Output */}
      <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-2 text-xs font-mono">
        <div className="text-[11px] text-[#64748B] font-bold flex justify-between">
          <span>Qiskit Aer Probabilities</span>
          <span>{isSimulating ? "Simulating..." : "Execution Complete"}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(probabilities).map(([state, p]) => (
            <div key={state} className="p-2 bg-white rounded border border-[#CBD5E1] flex justify-between font-bold">
              <span>|{state}⟩:</span>
              <span className="text-[#2563EB]">{(p * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center pt-2">
        <button
          onClick={() => handleStepChange(Math.max(0, step - 1))}
          disabled={step === 0 || isSimulating}
          className="px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] rounded border border-[#E2E8F0] text-xs font-bold disabled:opacity-30"
        >
          Previous Step
        </button>

        {step < steps.length - 1 && (
          <button
            onClick={() => handleStepChange(step + 1)}
            disabled={isSimulating}
            className="flex items-center gap-1 px-4 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded text-xs font-bold shadow-xs"
          >
            <span>Next Step</span> <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
