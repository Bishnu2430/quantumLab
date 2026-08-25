"use client";

import React from "react";
import { LessonShell } from "@/components/layout/LessonShell";
import { EntanglementPreview } from "@/components/lessons/entanglement/EntanglementPreview";
import { CnotMatrixExplorer } from "@/components/lessons/entanglement/CnotMatrixExplorer";
import { LearningObjectives } from "@/components/education/LearningObjectives";
import { CommonMistakes } from "@/components/education/CommonMistakes";
import { WhyExpandable } from "@/components/education/WhyExpandable";
import { PipelineDiagram } from "@/components/education/PipelineDiagram";
import { TeacherLevelSelector } from "@/components/education/TeacherLevelSelector";
import { ConceptMap } from "@/components/education/ConceptMap";
import { Prerequisites } from "@/components/education/Prerequisites";
import { CircuitCodeMathBridge } from "@/components/education/CircuitCodeMathBridge";

export default function EntanglementLessonPage() {
  const objectives = [
    "Understand 2-qubit computational basis states |00⟩, |01⟩, |10⟩, |11⟩",
    "Master the Controlled-NOT (CNOT) gate transformation logic",
    "Prepare the maximally entangled Bell state |Φ⁺⟩ = (|00⟩ + |11⟩) / √2",
    "Prove quantum non-separability: why entangled states cannot be factored into independent qubits",
    "Execute real IBM Qiskit Aer simulations to observe 100% correlated measurement counts",
  ];

  const mistakes = [
    {
      misconception: "Quantum entanglement allows faster-than-light (FTL) communication.",
      rigorousFact: "No information is transmitted faster than light. Measurement outcomes are locally random. Communication requires sending classical measurement results over classical channels (No-Communication Theorem).",
    },
    {
      misconception: "Entangled qubits have pre-existing hidden classical values decided at creation.",
      rigorousFact: "Bell's Theorem proves that local hidden variable theories are incompatible with quantum mechanics predictions. Entangled correlations exist continuously in state vector space prior to measurement.",
    },
  ];

  return (
    <LessonShell
      moduleNumber="05"
      title="CNOT Gate & Quantum Entanglement"
      subtitle="Discover 2-qubit tensor product basis states, master the Controlled-NOT gate, prepare the Bell state |Φ⁺⟩, and observe non-local correlations using IBM Qiskit Aer."
      estimatedMinutes={25}
      prevLesson={{ title: "Single-Qubit Gates", href: "/learn/gates" }}
      nextLesson={undefined}
    >
      {/* Concept Roadmap Node */}
      <ConceptMap currentModuleId="entanglement" />

      {/* Prerequisites */}
      <Prerequisites items={[{ title: "Module 04: Single-Qubit Gates & Rotations", href: "/learn/gates" }]} />

      {/* 1. Learning Objectives */}
      <LearningObjectives objectives={objectives} />

      {/* 2. Teacher Mode Multi-Level Explanations */}
      <TeacherLevelSelector
        levels={{
          beginner: (
            <div className="space-y-2">
              <strong className="block text-[#0F172A] font-bold">Level 1: Intuitive Concept</strong>
              <p>
                Imagine two magic coins. When spun separately, each coin lands on Heads (0) or Tails (1) 50% of the time. But when entangled, whenever coin A lands on Heads, coin B instantly lands on Heads too — no matter how far apart they are!
              </p>
            </div>
          ),
          engineering: (
            <div className="space-y-2 font-mono">
              <strong className="block text-[#0F172A] font-bold">Level 2: Engineering Circuit & Bell State</strong>
              <p>
                Applying Hadamard to q₀ produces (|0⟩+|1⟩)/√2 ⊗ |0⟩ = (|00⟩+|10⟩)/√2. Passing this state through CNOT(q₀ ➔ q₁) flips the second qubit if q₀=1, producing non-separable Bell state |Φ⁺⟩ = (|00⟩+|11⟩)/√2.
              </p>
            </div>
          ),
          mathematical: (
            <div className="space-y-2 font-mono">
              <strong className="block text-[#0F172A] font-bold">Level 3: Rigorous Tensor Product Hilbert Space</strong>
              <p>
                A 2-qubit system lives in tensor product space H₁ ⊗ H₂ ≅ C⁴. State |Φ⁺⟩ = 1/√2 [1, 0, 0, 1]ᵀ cannot be written as |ψ_A⟩ ⊗ |ψ_B⟩. Partial trace Tr_B(|Φ⁺⟩⟨Φ⁺|) yields maximally mixed density matrix I/2.
              </p>
            </div>
          ),
        }}
      />

      {/* 3. Interactive CNOT Truth Table Explorer */}
      <CnotMatrixExplorer />

      {/* 4. Interactive 3-Step Bell State Preparation Workflow */}
      <div className="space-y-2">
        <h3 className="font-bold text-base text-[#0F172A] px-1">1. Bell State |Φ⁺⟩ Interactive Preparation Workflow</h3>
        <EntanglementPreview />
      </div>

      {/* 5. Circuit Code Math Bridge */}
      <CircuitCodeMathBridge />

      {/* 6. Non-Separability Mathematical Proof */}
      <div className="glass-panel p-6 bg-white border border-[#CBD5E1] space-y-4 rounded-xl">
        <h3 className="font-bold text-base text-[#0F172A]">2. Mathematical Proof of Non-Separability</h3>
        <p className="text-xs text-[#334155] font-medium leading-relaxed">
          A state vector is entangled if it cannot be decomposed into independent single-qubit states.
        </p>

        <WhyExpandable
          questionTitle="Why can't Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 be factored?"
          explanation={
            <div className="space-y-2 font-mono text-xs">
              <p>
                Assume separable state |ψ⟩ = (a₀|0⟩ + a₁|1⟩) ⊗ (b₀|0⟩ + b₁|1⟩) = a₀b₀|00⟩ + a₀b₁|01⟩ + a₁b₀|10⟩ + a₁b₁|11⟩.
              </p>
              <p>
                Matching coefficients for |Φ⁺⟩ gives: a₀b₀ = 1/√2, a₀b₁ = 0, a₁b₀ = 0, a₁b₁ = 1/√2.
              </p>
              <p className="font-sans font-bold text-[#DC2626]">
                If a₀b₁ = 0, then either a₀ = 0 or b₁ = 0. But if a₀ = 0, then a₀b₀ = 0, contradicting a₀b₀ = 1/√2! Contradiction proved: Bell state is strictly non-separable (entangled).
              </p>
            </div>
          }
        />
      </div>

      {/* 7. Misconceptions & Pipeline */}
      <CommonMistakes pairs={mistakes} />
      <PipelineDiagram />
    </LessonShell>
  );
}
