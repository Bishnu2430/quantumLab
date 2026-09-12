"use client";

import React from "react";
import Link from "next/link";
import { GitCommit, ChevronRight, CheckCircle2 } from "lucide-react";

interface ConceptMapProps {
  currentModuleId: string;
}

const MODULE_NODES = [
  { id: "qubits", number: "01", title: "Qubits & State Vector", href: "/learn/qubits" },
  { id: "superposition", number: "02", title: "Superposition & Hadamard", href: "/learn/superposition" },
  { id: "measurement", number: "03", title: "Measurement & Collapse", href: "/learn/measurement" },
  { id: "gates", number: "04", title: "Single-Qubit Gates", href: "/learn/gates" },
  { id: "entanglement", number: "05", title: "CNOT & Entanglement", href: "/learn/entanglement" },
];

export const ConceptMap: React.FC<ConceptMapProps> = ({ currentModuleId }) => {
  return (
    <div className="glass-panel p-5 bg-white border border-[#CBD5E1] rounded-xl space-y-3">
      <div className="flex items-center gap-2 text-[#2563EB] font-bold text-xs uppercase font-mono tracking-wider">
        <GitCommit className="w-4 h-4 text-[#2563EB]" />
        <span>Quantum Curriculum Roadmap · Select Any Lesson</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        {MODULE_NODES.map((node, idx) => {
          const isCurrent = node.id === currentModuleId || (currentModuleId === "multi-qubits" && node.id === "entanglement");
          const isCompleted =
            MODULE_NODES.findIndex((n) => n.id === currentModuleId || (currentModuleId === "multi-qubits" && n.id === "entanglement")) > idx;

          return (
            <React.Fragment key={node.id}>
              <Link
                href={node.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                  isCurrent
                    ? "bg-[#2563EB] text-white border-[#1D4ED8] shadow-xs font-bold ring-2 ring-[#2563EB] ring-offset-1"
                    : isCompleted
                    ? "bg-[#F0FDF4] text-[#166534] border-[#86EFAC] hover:bg-[#DCFCE7]"
                    : "bg-[#F8FAFC] text-[#0F172A] border-[#CBD5E1] hover:bg-[#EFF6FF] hover:border-[#BFDBFE]"
                }`}
              >
                {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />}
                <span>
                  M{node.number}: {node.title}
                </span>
              </Link>
              {idx < MODULE_NODES.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
