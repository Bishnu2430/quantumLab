"use client";

import React, { useState } from "react";
import { Play, RotateCcw, ArrowRight, Layers } from "lucide-react";

export const InterferenceAnimator: React.FC = () => {
  const [step, setStep] = useState<number>(0);

  const stepsData = [
    {
      title: "Step 0: Initial Basis State |0⟩",
      desc: "The qubit starts in 100% basis state |0⟩. Amplitude α = 1.0, β = 0.",
      a0: 1.0,
      a1: 0.0,
      p0: 100,
      p1: 0,
      badge: "|0⟩ State",
    },
    {
      title: "Step 1: First Hadamard H|0⟩ ➔ Equal Superposition |+⟩",
      desc: "First Hadamard gate splits amplitude evenly into α = +0.7071 (+1/√2) and β = +0.7071 (+1/√2). Measurement yields 50% |0⟩ and 50% |1⟩.",
      a0: 0.7071,
      a1: 0.7071,
      p0: 50,
      p1: 50,
      badge: "|+⟩ Superposition",
    },
    {
      title: "Step 2: Second Hadamard H(H|0⟩) ➔ Quantum Interference",
      desc: "Second Hadamard transforms both amplitudes: State |0⟩ receives (1/2 + 1/2 = 1.0) while State |1⟩ receives (1/2 - 1/2 = 0.0).",
      a0: 1.0,
      a1: 0.0,
      p0: 100,
      p1: 0,
      badge: "Constructive / Destructive Interference",
    },
  ];

  const current = stepsData[step];

  return (
    <div className="glass-panel p-6 bg-white border border-[#CBD5E1] rounded-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div>
          <h3 className="font-bold text-base text-[#0F172A] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#2563EB]" />
            Interactive Quantum Interference Animator: H(H|0⟩) = |0⟩
          </h3>
          <p className="text-xs text-[#334155] font-medium mt-0.5">
            Observe how quantum phase causes constructive & destructive amplitude interference.
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-[#1E40AF] bg-[#EFF6FF] px-3 py-1 rounded border border-[#BFDBFE]">
          {current.badge}
        </span>
      </div>

      <div className="space-y-4">
        <h4 className="font-bold text-sm text-[#0F172A]">{current.title}</h4>
        <p className="text-xs text-[#334155] font-medium leading-relaxed">{current.desc}</p>

        {/* Animated Amplitude & Probability Bars */}
        <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#CBD5E1] space-y-3 font-mono text-xs">
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-bold text-[#0F172A]">Amplitude α (|0⟩): {current.a0}</span>
              <span className="text-[#2563EB] font-bold">P(0) = {current.p0}%</span>
            </div>
            <div className="w-full h-3 bg-[#E2E8F0] rounded overflow-hidden">
              <div
                className="h-full bg-[#2563EB] rounded transition-all duration-500"
                style={{ width: `${current.p0}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="font-bold text-[#0F172A]">Amplitude β (|1⟩): {current.a1}</span>
              <span className="text-[#0284C7] font-bold">P(1) = {current.p1}%</span>
            </div>
            <div className="w-full h-3 bg-[#E2E8F0] rounded overflow-hidden">
              <div
                className="h-full bg-[#0284C7] rounded transition-all duration-500"
                style={{ width: `${current.p1}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step Controls */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setStep(0)}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] rounded border border-[#CBD5E1] text-xs font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to Initial State
          </button>

          <button
            onClick={() => setStep((prev) => (prev + 1) % stepsData.length)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded text-xs font-bold shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Step Animation ({step + 1}/{stepsData.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
