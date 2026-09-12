"use client";

import React, { useState } from "react";
import { QuantumWorkspace } from "@/components/quantum/QuantumWorkspace";
import { Boxes, Code2, Copy, Check, Sparkles } from "lucide-react";
import { generateQiskitPythonCode } from "@/lib/api/quantum";

export default function PlaygroundPage() {
  const [activeTab, setActiveTab] = useState<"workspace" | "code">("workspace");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const sampleBellCircuit = {
    numQubits: 2,
    numClbits: 2,
    operations: [
      { id: "op-1", gate: "h" as const, targets: [0], moment: 0 },
      { id: "op-2", gate: "cx" as const, controls: [0], targets: [1], moment: 1 },
      { id: "op-3", gate: "measure" as const, targets: [0], clbits: [0], moment: 2 },
      { id: "op-4", gate: "measure" as const, targets: [1], clbits: [1], moment: 2 },
    ],
  };

  const generatedQiskitCode = generateQiskitPythonCode(sampleBellCircuit, 1024);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedQiskitCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 bg-white max-w-7xl mx-auto pb-8">
      {/* Page Title & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-[#2563EB] font-mono text-xs font-bold uppercase tracking-wider">
            <Boxes className="w-4 h-4 text-[#2563EB]" /> Interactive Quantum Circuit Playground
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight mt-1">Quantum Simulation & Code Laboratory</h1>
          <p className="text-xs text-[#334155] font-medium mt-1 max-w-2xl">
            Build visual circuits, trace the 8-stage execution pipeline (IR ➔ FastAPI ➔ Qiskit Aer), inspect statevectors, and export generated Python code.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-[#F1F5F9] p-1 rounded-lg border border-[#CBD5E1] text-xs font-mono">
          <button
            onClick={() => setActiveTab("workspace")}
            className={`px-3 py-1.5 rounded transition font-bold ${
              activeTab === "workspace"
                ? "bg-[#2563EB] text-white shadow-xs"
                : "text-[#334155] hover:text-[#0F172A]"
            }`}
          >
            Visual Workspace
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`px-3 py-1.5 rounded transition font-bold ${
              activeTab === "code"
                ? "bg-[#2563EB] text-white shadow-xs"
                : "text-[#334155] hover:text-[#0F172A]"
            }`}
          >
            Generated Qiskit Code
          </button>
        </div>
      </div>

      {activeTab === "workspace" ? (
        <QuantumWorkspace />
      ) : (
        <div className="glass-panel p-6 space-y-4 bg-white border border-[#CBD5E1] rounded-xl font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div className="flex items-center gap-2 text-[#2563EB] font-bold">
              <Code2 className="w-4 h-4 text-[#2563EB]" /> Equivalent IBM Qiskit Python Code
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] rounded border border-[#BFDBFE] transition font-bold shadow-xs"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5 text-[#2563EB]" />}
              {copiedCode ? "Copied to Clipboard!" : "Copy Python Code"}
            </button>
          </div>

          <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#CBD5E1] space-y-2 text-[#1E3A8A] font-sans">
            <div className="flex items-center gap-1.5 font-bold text-[#1E40AF]">
              <Sparkles className="w-4 h-4 text-[#2563EB]" />
              <span>Production-Ready IBM Qiskit Script</span>
            </div>
            <p className="text-xs text-[#334155]">
              This Python code represents the exact circuit created in your visual playground. You can copy and execute this script directly in Jupyter Notebook, VS Code, or IBM Quantum Cloud.
            </p>
          </div>

          <pre className="p-4 bg-[#F8FAFC] rounded-lg border border-[#CBD5E1] text-xs font-mono text-[#0F172A] font-bold overflow-x-auto leading-relaxed">
            {generatedQiskitCode}
          </pre>
        </div>
      )}
    </div>
  );
}
