"use client";

import React from "react";
import { LessonShell } from "@/components/layout/LessonShell";
import { MeasurementShotExperiment } from "@/components/lessons/measurement/MeasurementShotExperiment";
import { LearningObjectives } from "@/components/education/LearningObjectives";
import { CommonMistakes } from "@/components/education/CommonMistakes";
import { WhyExpandable } from "@/components/education/WhyExpandable";
import { PipelineDiagram } from "@/components/education/PipelineDiagram";
import { TeacherLevelSelector } from "@/components/education/TeacherLevelSelector";
import { ConceptMap } from "@/components/education/ConceptMap";
import { Prerequisites } from "@/components/education/Prerequisites";
import { Layers } from "lucide-react";

export default function MeasurementLessonPage() {
  const objectives = [
    "Understand the distinction between quantum state vectors and classical measurement outcomes",
    "Explain statevector collapse during projective measurement",
    "Compare theoretical probabilities against empirical shot counts (10 to 10,000 shots)",
    "Observe statistical convergence under the Law of Large Numbers",
    "Analyze how repeated Qiskit Aer simulation runs reveal underlying state probabilities",
  ];

  const mistakes = [
    {
      misconception: "Measurement simply reveals a pre-existing hidden classical value.",
      rigorousFact: "Prior to measurement, the qubit exists in a continuous quantum state |ψ⟩. The act of measurement forces the state to project into a single eigenstate (|0⟩ or |1⟩).",
    },
    {
      misconception: "Running 10 shots gives exact theoretical probabilities every time.",
      rigorousFact: "Small shot counts exhibit statistical fluctuation. As shots increase to 1,000+, observed frequencies converge toward Born's Rule probabilities.",
    },
  ];

  return (
    <LessonShell
      moduleNumber="03"
      title="Measurement & Wavefunction Collapse"
      subtitle="Explore how projective measurement forces quantum states to collapse into classical bit outcomes and observe shot sampling convergence using Qiskit Aer."
      estimatedMinutes={15}
      prevLesson={{ title: "Superposition & Hadamard", href: "/learn/superposition" }}
      nextLesson={{ title: "Single-Qubit Gates", href: "/learn/gates" }}
    >
      {/* Concept Roadmap Node */}
      <ConceptMap currentModuleId="measurement" />

      {/* Prerequisites */}
      <Prerequisites items={[{ title: "Module 02: Superposition & Hadamard", href: "/learn/superposition" }]} />

      {/* 1. Learning Objectives */}
      <LearningObjectives objectives={objectives} />

      {/* 2. Teacher Mode Multi-Level Explanations */}
      <TeacherLevelSelector
        levels={{
          beginner: (
            <div className="space-y-2">
              <strong className="block text-[#0F172A] font-bold">Level 1: Intuitive Concept</strong>
              <p>
                Imagine shaking a closed box with a bouncing ball inside. As long as the box stays closed, the ball travels everywhere inside. The moment you open the box to look (measurement), the ball is forced to freeze in one spot!
              </p>
            </div>
          ),
          engineering: (
            <div className="space-y-2 font-mono">
              <strong className="block text-[#0F172A] font-bold">Level 2: Engineering Wavefunction Collapse</strong>
              <p>
                Projective measurement in the Z-basis measures quantum state |ψ⟩ = α|0⟩ + β|1⟩, storing a classical bit 0 or 1 in a classical register `c`. After measurement, the quantum state irreversibly collapses to |0⟩ (with prob |α|²) or |1⟩ (with prob |β|²).
              </p>
            </div>
          ),
          mathematical: (
            <div className="space-y-2 font-mono">
              <strong className="block text-[#0F172A] font-bold">Level 3: Rigorous Projective Operator Formalism</strong>
              <p>
                Measurement operators P0 = |0⟩⟨0| and P1 = |1⟩⟨1| satisfy completeness P0 + P1 = I. Probability of outcome m is p(m) = ⟨ψ|Pm|ψ⟩, and post-measurement state is |ψ′⟩ = Pm|ψ⟩ / √p(m).
              </p>
            </div>
          ),
        }}
      />

      {/* 3. Before / After Collapse Diagram */}
      <div className="glass-panel p-6 bg-white border border-[#CBD5E1] space-y-4 rounded-xl">
        <h3 className="font-bold text-base text-[#0F172A]">1. Quantum Measurement Collapse</h3>
        <p className="text-xs text-[#334155] font-medium leading-relaxed">
          Before measurement, a qubit maintains complex amplitudes α and β. Measurement projects the qubit into one classical outcome.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-center">
          <div className="p-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg">
            <span className="text-[#1E40AF] font-bold block mb-1">BEFORE</span>
            <strong className="block text-[#1E3A8A] text-sm">|ψ⟩ = α|0⟩ + β|1⟩</strong>
            <span className="text-[11px] text-[#1E40AF]">Continuous superposition</span>
          </div>

          <div className="flex items-center justify-center text-[#2563EB] font-bold">
            <div className="flex items-center gap-1 bg-[#F1F5F9] px-3 py-1.5 rounded-full border border-[#CBD5E1]">
              <Layers className="w-3.5 h-3.5" /> Measure
            </div>
          </div>

          <div className="p-4 bg-[#F0FDF4] border border-[#86EFAC] rounded-lg">
            <span className="text-[#166534] font-bold block mb-1">AFTER</span>
            <strong className="block text-[#166534] text-sm">|0⟩  OR  |1⟩</strong>
            <span className="text-[11px] text-[#14532D]">Collapsed classical bit</span>
          </div>
        </div>

        <WhyExpandable
          questionTitle="Why do shot counts fluctuate on small sample sizes?"
          explanation={
            <div className="space-y-2">
              <p>
                Each shot execution is an independent Bernoulli trial. For state |+⟩, the probability is p = 0.5.
              </p>
              <p>
                By the Law of Large Numbers, standard error decreases as N increases. At N = 10, fluctuation error is higher. At N = 10,000, observed frequencies match theoretical probabilities to high precision.
              </p>
            </div>
          }
        />
      </div>

      {/* 4. Real Qiskit Aer Shot Sampling Experiment */}
      <div className="space-y-2">
        <h3 className="font-bold text-base text-[#0F172A] px-1">2. Shot Sampling Convergence Experiment</h3>
        <MeasurementShotExperiment />
      </div>

      {/* 5. Misconceptions & Pipeline */}
      <CommonMistakes pairs={mistakes} />
      <PipelineDiagram />
    </LessonShell>
  );
}
