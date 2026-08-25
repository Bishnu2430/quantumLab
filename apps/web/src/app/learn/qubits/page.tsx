"use client";

import React from "react";
import { LessonShell } from "@/components/layout/LessonShell";
import { QubitStateExplorer } from "@/components/lessons/qubits/QubitStateExplorer";
import { LearningObjectives } from "@/components/education/LearningObjectives";
import { CommonMistakes } from "@/components/education/CommonMistakes";
import { WhyExpandable } from "@/components/education/WhyExpandable";
import { PipelineDiagram } from "@/components/education/PipelineDiagram";
import { TeacherLevelSelector } from "@/components/education/TeacherLevelSelector";
import { ConceptMap } from "@/components/education/ConceptMap";
import { Prerequisites } from "@/components/education/Prerequisites";

export default function QubitsLessonPage() {
  const objectives = [
    "Explain what a quantum bit (qubit) is and distinguish it from a classical bit",
    "Understand the state vector expression |ψ⟩ = α|0⟩ + β|1⟩",
    "Calculate state probabilities P(0) = |α|² and P(1) = |β|²",
    "Apply the normalization constraint |α|² + |β|² = 1",
    "Interpret single-qubit states geometrically on the 3D Bloch sphere",
  ];

  const mistakes = [
    {
      misconception: "A qubit is literally 0 and 1 at the exact same time.",
      rigorousFact: "A qubit exists in a linear combination (superposition) of basis states |0⟩ and |1⟩. Measurement yields a single basis state according to probability amplitudes α and β.",
    },
    {
      misconception: "Probability amplitudes α and β are ordinary percentage numbers.",
      rigorousFact: "Amplitudes α and β are complex numbers. The measurement probability is given by the squared magnitude |α|² and |β|².",
    },
    {
      misconception: "Every quantum state can be represented by a classical point.",
      rigorousFact: "Single pure qubit states map to points on the 3D unit Bloch sphere, but multi-qubit entangled states require tensor product Hilbert spaces.",
    },
  ];

  return (
    <LessonShell
      moduleNumber="01"
      title="Qubits & The Quantum State Vector"
      subtitle="Master the fundamental unit of quantum information: basis states, complex probability amplitudes, normalization, and the 3D Bloch sphere representation."
      estimatedMinutes={15}
      prevLesson={undefined}
      nextLesson={{ title: "Superposition & Hadamard", href: "/learn/superposition" }}
    >
      {/* Concept Roadmap Node */}
      <ConceptMap currentModuleId="qubits" />

      {/* Prerequisites */}
      <Prerequisites items={[{ title: "Basic Complex Numbers & Vectors", href: "/learn" }]} />

      {/* 1. Learning Objectives */}
      <LearningObjectives objectives={objectives} />

      {/* 2. Teacher Mode Multi-Level Explanations */}
      <TeacherLevelSelector
        levels={{
          beginner: (
            <div className="space-y-2">
              <strong className="block text-[#0F172A] font-bold">Level 1: Intuitive Concept</strong>
              <p>
                A classical bit is like a light switch: it is strictly OFF (0) or ON (1). A qubit is like a sphere where the top pole is 0 and the bottom pole is 1. The qubit state vector can point anywhere on this surface before measurement.
              </p>
            </div>
          ),
          engineering: (
            <div className="space-y-2 font-mono">
              <strong className="block text-[#0F172A] font-bold">Level 2: Engineering State Vector</strong>
              <p>
                A single-qubit state vector |ψ⟩ = α|0⟩ + β|1⟩ stores two complex amplitudes α, β. When measured in the computational Z-basis, outcome 0 occurs with probability P(0) = |α|² and outcome 1 with P(1) = |β|².
              </p>
            </div>
          ),
          mathematical: (
            <div className="space-y-2 font-mono">
              <strong className="block text-[#0F172A] font-bold">Level 3: Rigorous Hilbert Space Mathematics</strong>
              <p>
                A pure single-qubit state is a normalized unit vector in a 2D complex Hilbert space H = C². Normalization is expressed via inner product ⟨ψ|ψ⟩ = |α|² + |β|² = 1.
              </p>
            </div>
          ),
        }}
      />

      {/* 3. Classical Bit vs Qubit Concept */}
      <div className="glass-panel p-6 bg-white border border-[#CBD5E1] space-y-4 rounded-xl">
        <h3 className="font-bold text-base text-[#0F172A]">1. Classical Bit vs. Quantum Bit</h3>
        <p className="text-xs text-[#334155] font-medium leading-relaxed">
          In classical computing, a bit is a binary switch: it is strictly in state <strong>0</strong> or state <strong>1</strong>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#CBD5E1] space-y-1">
            <span className="text-[#2563EB] font-bold block">Classical Bit</span>
            <div className="text-lg font-bold text-[#0F172A] pt-1">Bit = 0  OR  1</div>
            <span className="text-[11px] text-[#64748B]">Deterministic discrete values</span>
          </div>

          <div className="p-4 bg-[#EFF6FF] rounded-lg border border-[#BFDBFE] space-y-1">
            <span className="text-[#1E40AF] font-bold block">Quantum Bit (Qubit)</span>
            <div className="text-lg font-bold text-[#1E3A8A] pt-1">|ψ⟩ = α|0⟩ + β|1⟩</div>
            <span className="text-[11px] text-[#1E40AF]">Linear combination with complex amplitudes α, β</span>
          </div>
        </div>
      </div>

      {/* 4. Mathematical Normalization & Expandable Derivation */}
      <div className="glass-panel p-6 bg-white border border-[#CBD5E1] space-y-4 rounded-xl">
        <h3 className="font-bold text-base text-[#0F172A]">2. Normalization Constraint: |α|² + |β|² = 1</h3>
        <p className="text-xs text-[#334155] font-medium leading-relaxed">
          Because total probability must equal 100%, the squared magnitudes of the complex amplitudes must sum to 1.
        </p>

        <WhyExpandable
          questionTitle="Why do probabilities use squared magnitudes |α|²?"
          explanation={
            <div className="space-y-2">
              <p>
                Quantum mechanics uses state vectors where amplitudes α, β are complex numbers (a + bi).
              </p>
              <p>
                By Born&apos;s Rule, measurement probabilities are positive real numbers defined by P(0) = |α|² = α* α. This guarantees valid non-negative probabilities.
              </p>
            </div>
          }
        />
      </div>

      {/* 5. Interactive Qubit State Explorer & 3D Bloch Sphere */}
      <div className="space-y-2">
        <h3 className="font-bold text-base text-[#0F172A] px-1">3. Interactive Qubit State Vector & Bloch Sphere</h3>
        <QubitStateExplorer />
      </div>

      {/* 6. Common Misconceptions */}
      <CommonMistakes pairs={mistakes} />

      {/* 7. Pipeline Diagram */}
      <PipelineDiagram />
    </LessonShell>
  );
}
