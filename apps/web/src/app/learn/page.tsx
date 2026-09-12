"use client";

import React from "react";
import Link from "next/link";
import { CircleDot, Layers2, BarChart3, Waypoints, GitBranch, ArrowRight } from "lucide-react";

interface ModuleCardSpec {
  id: string;
  number: string;
  title: string;
  description: string;
  difficulty: string;
  minutes: number;
  href: string;
  icon: any;
}

const MODULES: ModuleCardSpec[] = [
  {
    id: "qubits",
    number: "01",
    title: "Qubits & State Vector",
    description: "Learn how a qubit is represented, how amplitudes describe its state, and how the Bloch sphere gives that state a geometric picture.",
    difficulty: "Beginner",
    minutes: 15,
    href: "/learn/qubits",
    icon: CircleDot,
  },
  {
    id: "superposition",
    number: "02",
    title: "Superposition & Hadamard",
    description: "See how a qubit can be placed into superposition and follow the Hadamard transformation from matrix to measurement.",
    difficulty: "Beginner",
    minutes: 20,
    href: "/learn/superposition",
    icon: Layers2,
  },
  {
    id: "measurement",
    number: "03",
    title: "Measurement & Collapse",
    description: "Explore what happens when a quantum state is measured and how repeated shots reveal the underlying probabilities.",
    difficulty: "Beginner",
    minutes: 15,
    href: "/learn/measurement",
    icon: BarChart3,
  },
  {
    id: "gates",
    number: "04",
    title: "Single-Qubit Gates",
    description: "Study X, Y, Z and Hadamard gates through their matrices, state transformations and Bloch-sphere rotations.",
    difficulty: "Intermediate",
    minutes: 15,
    href: "/learn/gates",
    icon: Waypoints,
  },
  {
    id: "entanglement",
    number: "05",
    title: "CNOT & Entanglement",
    description: "Master multi-qubit basis states |00⟩..|11⟩, the Controlled-NOT gate, non-separability, and prepare Bell state |Φ⁺⟩.",
    difficulty: "Intermediate",
    minutes: 25,
    href: "/learn/entanglement",
    icon: GitBranch,
  },
];

export default function CurriculumOverviewPage() {
  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 space-y-3 bg-white border border-[#E2E8F0]">
        <div className="text-xs font-mono text-[#2563EB] font-semibold uppercase tracking-wider">
          PBQuantum Labs · Interactive Curriculum
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
          Learn Quantum Computing
        </h1>
        <p className="text-sm text-[#475569] max-w-2xl leading-relaxed">
          Build the fundamentals step by step, then test what you learn with interactive circuits and simulations.
        </p>
      </div>

      {/* Module Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link
              key={mod.id}
              href={mod.href}
              className="glass-panel p-6 border border-[#E2E8F0] hover:border-[#2563EB] transition-all group flex flex-col justify-between space-y-4 bg-white focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:outline-none rounded-xl shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-semibold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded border border-[#BFDBFE]">
                    Module {mod.number}
                  </span>
                  <span className="text-[#64748B] font-medium">{mod.difficulty} · {mod.minutes} min</span>
                </div>

                <div className="flex items-start gap-3.5 pt-1">
                  <div className="p-2.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-[#475569] leading-relaxed mt-1">{mod.description}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end text-xs font-semibold text-[#2563EB] group-hover:translate-x-1 transition-transform pt-3 border-t border-[#E2E8F0]">
                <span className="mr-1.5">Start lesson</span>
                <ArrowRight className="w-4 h-4 text-[#2563EB]" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
