"use client";

import React from "react";
import { LessonShell } from "@/components/layout/LessonShell";
import { SingleGateExplorer } from "@/components/lessons/gates/SingleGateExplorer";
import { EntanglementPreview } from "@/components/lessons/entanglement/EntanglementPreview";
import { LearningObjectives } from "@/components/education/LearningObjectives";
import { CommonMistakes } from "@/components/education/CommonMistakes";
import { WhyExpandable } from "@/components/education/WhyExpandable";
import { PipelineDiagram } from "@/components/education/PipelineDiagram";
import { TeacherLevelSelector } from "@/components/education/TeacherLevelSelector";
import { ConceptMap } from "@/components/education/ConceptMap";
import { Prerequisites } from "@/components/education/Prerequisites";
import { CircuitCodeMathBridge } from "@/components/education/CircuitCodeMathBridge";
import { MatrixVectorStepVisualizer } from "@/components/education/MatrixVectorStepVisualizer";

export default function GatesLessonPage() {
  const objectives = [
    "Analyze single-qubit unitary operators X, Y, Z, and H through 2x2 complex matrices",
    "Predict state transformations: bit flip (X), phase flip (Z), and superposition (H)",
    "Visualize gate rotations around X, Y, and Z axes on the 3D Bloch sphere",
    "Generate equivalent Qiskit Python code snippets for each unitary gate",
    "Prepare for multi-qubit entanglement and CNOT operations in future modules",
  ];

  const mistakes = [
    {
      misconception: "The Pauli-Z gate changes measurement probabilities of basis states.",
      rigorousFact: "Pauli-Z applies a phase shift Z|1⟩ = -|1⟩. Since |-1|² = 1, Z does NOT change Z-basis measurement probabilities. However, it rotates the state vector around the Z-axis, altering phase interference.",
    },
    {
      misconception: "Quantum gates can perform non-reversible operations like resetting a qubit without measurement.",
      rigorousFact: "Quantum gates are unitary operators (U†U = I), meaning all single-qubit gate operations are strictly reversible and preserve vector length.",
    },
  ];

  return (
    <LessonShell
      moduleNumber="04"
      title="Single-Qubit Gates & Rotations"
      subtitle="Master Pauli-X, Y, Z, and Hadamard unitary operators, analyze matrix transformations, inspect Qiskit code, and preview 2-qubit entanglement."
      estimatedMinutes={15}
      prevLesson={{ title: "Measurement & Collapse", href: "/learn/measurement" }}
      nextLesson={undefined}
    >
      {/* Concept Roadmap Node */}
      <ConceptMap currentModuleId="gates" />

      {/* Prerequisites */}
      <Prerequisites items={[{ title: "Module 03: Measurement & Collapse", href: "/learn/measurement" }]} />

      {/* 1. Learning Objectives */}
      <LearningObjectives objectives={objectives} />

      {/* 2. Teacher Mode Multi-Level Explanations */}
      <TeacherLevelSelector
        levels={{
          beginner: (
            <div className="space-y-2">
              <strong className="block text-[#0F172A] font-bold">Level 1: Intuitive Concept</strong>
              <p>
                A quantum gate is an instruction that turns the Bloch sphere vector. Pauli-X flips the vector top-to-bottom (|0⟩ ↔ |1⟩). Pauli-Z spins the vector around the vertical Z-axis without changing height.
              </p>
            </div>
          ),
          engineering: (
            <div className="space-y-2 font-mono">
              <strong className="block text-[#0F172A] font-bold">Level 2: Engineering Unitary Operations</strong>
              <p>
                Every single-qubit gate is represented by a 2×2 complex matrix U satisfying U†U = I. Pauli matrices X = [[0, 1], [1, 0]], Y = [[0, -i], [i, 0]], Z = [[1, 0], [0, -1]] form a basis for Hermitian operators.
              </p>
            </div>
          ),
          mathematical: (
            <div className="space-y-2 font-mono">
              <strong className="block text-[#0F172A] font-bold">Level 3: Rigorous Lie Group Geometry (SU(2))</strong>
              <p>
                Single-qubit unitary operators belong to the special unitary group SU(2) up to global phase. Any single-qubit gate can be parameterized as Rn(θ) = exp(-i θ (n · σ)/2) representing rotation by angle θ around axis n.
              </p>
            </div>
          ),
        }}
      />

      {/* 3. Interactive Circuit ↔ Mathematics ↔ Code Bridge */}
      <CircuitCodeMathBridge />

      {/* 4. Step-by-Step Matrix Multiplication Visualizer */}
      <MatrixVectorStepVisualizer />

      {/* 5. Unified Single-Gate Explorer */}
      <div className="space-y-2">
        <h3 className="font-bold text-base text-[#0F172A] px-1">1. Unified Single-Qubit Gate Explorer</h3>
        <SingleGateExplorer />
      </div>

      {/* 6. Multi-Qubit Entanglement Preview (Module 05 Preparation) */}
      <div className="space-y-2">
        <h3 className="font-bold text-base text-[#0F172A] px-1">2. Preview: Multi-Qubit Entanglement (Module 05)</h3>
        <EntanglementPreview />
      </div>

      {/* 7. Misconceptions & Pipeline */}
      <CommonMistakes pairs={mistakes} />
      <PipelineDiagram />
    </LessonShell>
  );
}
