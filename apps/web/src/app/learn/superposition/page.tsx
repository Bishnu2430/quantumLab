"use client";

import React from "react";
import { LessonShell } from "@/components/layout/LessonShell";
import { PredictionPanel } from "@/components/ui/PredictionPanel";
import { SuperpositionChallenge } from "@/components/lessons/superposition/SuperpositionChallenge";
import { LearningObjectives } from "@/components/education/LearningObjectives";
import { CommonMistakes } from "@/components/education/CommonMistakes";
import { WhyExpandable } from "@/components/education/WhyExpandable";
import { PipelineDiagram } from "@/components/education/PipelineDiagram";
import { TeacherLevelSelector } from "@/components/education/TeacherLevelSelector";
import { ConceptMap } from "@/components/education/ConceptMap";
import { Prerequisites } from "@/components/education/Prerequisites";
import { MatrixVectorStepVisualizer } from "@/components/education/MatrixVectorStepVisualizer";
import { InterferenceAnimator } from "@/components/education/InterferenceAnimator";
import { runQuantumSimulation } from "@/lib/api/quantum";

export default function SuperpositionLessonPage() {
  const objectives = [
    "Understand how the Hadamard (H) gate creates an equal superposition state",
    "Calculate matrix multiplication H|0⟩ = |+⟩ and H|1⟩ = |−⟩",
    "Demonstrate quantum interference: why H(H|0⟩) returns to |0⟩",
    "Distinguish between constructive and destructive amplitude interference",
    "Predict and verify measurement outcomes using Qiskit Aer simulation",
  ];

  const mistakes = [
    {
      misconception: "Superposition is just random noise or classical coin flipping.",
      rigorousFact: "Superposition maintains precise quantum phase relationships. Gates like H can recombine superposition states deterministically through interference.",
    },
    {
      misconception: "Applying a Hadamard gate twice adds even more superposition.",
      rigorousFact: "The Hadamard gate is self-inverse (H² = I). Applying H twice destroys superposition through destructive interference and restores the initial basis state |0⟩.",
    },
  ];

  const handleRunSimulation = async () => {
    const res = await runQuantumSimulation({
      circuit: {
        numQubits: 1,
        numClbits: 1,
        operations: [
          { id: "op-h", gate: "h", targets: [0], moment: 0 },
          { id: "op-m", gate: "measure", targets: [0], clbits: [0], moment: 1 },
        ],
      },
      options: { shots: 1024, mode: "both" },
    });
    return res;
  };

  return (
    <LessonShell
      moduleNumber="02"
      title="Superposition & The Hadamard Gate"
      subtitle="Discover how single qubits enter linear combinations, analyze Hadamard matrix transformations, and explore constructive/destructive interference."
      estimatedMinutes={20}
      prevLesson={{ title: "Qubits", href: "/learn/qubits" }}
      nextLesson={{ title: "Measurement & Collapse", href: "/learn/measurement" }}
    >
      {/* Concept Roadmap Node */}
      <ConceptMap currentModuleId="superposition" />

      {/* Prerequisites */}
      <Prerequisites items={[{ title: "Module 01: Qubits & State Vector", href: "/learn/qubits" }]} />

      {/* 1. Learning Objectives */}
      <LearningObjectives objectives={objectives} />

      {/* 2. Teacher Mode Multi-Level Explanations */}
      <TeacherLevelSelector
        levels={{
          beginner: (
            <div className="space-y-2">
              <strong className="block text-[#0F172A] font-bold">Level 1: Intuitive Concept</strong>
              <p>
                Imagine a spinning coin before it lands. It isn&apos;t just heads or tails; it is in a spinning blend. The Hadamard gate sets a qubit into this exact 50/50 state. But unlike a coin, quantum phase allows two Hadamards to undo each other!
              </p>
            </div>
          ),
          engineering: (
            <div className="space-y-2 font-mono">
              <strong className="block text-[#0F172A] font-bold">Level 2: Engineering Matrix Action</strong>
              <p>
                The Hadamard gate is represented by unitary matrix H = 1/√2 [[1, 1], [1, -1]]. Multiplying H by |0⟩ = [1, 0]ᵀ yields state |+⟩ = 1/√2 [1, 1]ᵀ, creating equal measurement probabilities P(0) = P(1) = 50%.
              </p>
            </div>
          ),
          mathematical: (
            <div className="space-y-2 font-mono">
              <strong className="block text-[#0F172A] font-bold">Level 3: Rigorous Quantum Interference Proof</strong>
              <p>
                Because H = H† and H² = I, applying H twice to state |0⟩ evaluates to H(H|0⟩) = 1/2 [ (|0⟩+|1⟩) + (|0⟩-|1⟩) ]. Amplitude for |1⟩ cancels out to 0 (destructive interference), while |0⟩ constructively reinforces to 1.
              </p>
            </div>
          ),
        }}
      />

      {/* 3. Step-by-Step Matrix Vector Multiplication Visualizer */}
      <MatrixVectorStepVisualizer />

      {/* 4. Interactive Quantum Interference Animator */}
      <InterferenceAnimator />

      {/* 5. Interactive Prediction Experiment */}
      <PredictionPanel
        questionTitle="What happens when you apply a Hadamard gate to state |0⟩ and measure?"
        circuitDescription="|0⟩ ──[ H ]──[ M ]──"
        options={[
          {
            id: "A",
            label: "Outcome is guaranteed to be 100% state |0⟩",
            correct: false,
            explanation: "Hadamard creates superposition state |+⟩. Measurement collapses the state randomly.",
          },
          {
            id: "B",
            label: "Equal 50% probability of |0⟩ and 50% probability of |1⟩",
            correct: true,
            explanation: "Correct. The Hadamard gate sets amplitudes to α = 1/√2 and β = 1/√2, so P(0) = |1/√2|² = 50% and P(1) = 50%.",
          },
          {
            id: "C",
            label: "The qubit is destroyed and returns no measurement counts",
            correct: false,
            explanation: "Measurement measures quantum state into a classical bit register without destroying the system.",
          },
        ]}
        onRunSimulation={handleRunSimulation}
      />

      {/* 6. Superposition Challenge */}
      <SuperpositionChallenge />

      {/* 7. Misconceptions & Pipeline */}
      <CommonMistakes pairs={mistakes} />
      <PipelineDiagram />
    </LessonShell>
  );
}
