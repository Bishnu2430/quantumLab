"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, GraduationCap } from "lucide-react";

export const ExecutionExplanationAccordion: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [depthLevel, setDepthLevel] = useState<"beginner" | "intermediate" | "technical">("beginner");

  return (
    <div className="glass-panel p-5 bg-white border border-[#CBD5E1] rounded-xl space-y-4">
      {/* Accordion Toggle Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left font-bold text-[#0F172A] text-sm focus-visible:outline-none"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#2563EB]" />
          <span>What Happens When I Click &quot;Run Simulation&quot;?</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#2563EB]">
          <span>{isOpen ? "Hide Explanation" : "Expand Explanation"}</span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-[#2563EB]" /> : <ChevronDown className="w-4 h-4 text-[#2563EB]" />}
        </div>
      </button>

      {/* Expandable Explanation Body */}
      {isOpen && (
        <div className="pt-3 border-t border-[#E2E8F0] space-y-4 text-xs">
          {/* Depth Selector Tabs */}
          <div className="flex items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
            <span className="font-mono text-[#0F172A] font-bold flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-[#2563EB]" /> Select Depth Level:
            </span>

            <div className="flex bg-[#F1F5F9] p-1 rounded-lg border border-[#CBD5E1] font-mono">
              <button
                onClick={() => setDepthLevel("beginner")}
                className={`px-3 py-1 rounded font-bold transition ${
                  depthLevel === "beginner" ? "bg-[#2563EB] text-white shadow-xs" : "text-[#334155] hover:text-[#0F172A]"
                }`}
              >
                Beginner
              </button>
              <button
                onClick={() => setDepthLevel("intermediate")}
                className={`px-3 py-1 rounded font-bold transition ${
                  depthLevel === "intermediate" ? "bg-[#2563EB] text-white shadow-xs" : "text-[#334155] hover:text-[#0F172A]"
                }`}
              >
                Intermediate
              </button>
              <button
                onClick={() => setDepthLevel("technical")}
                className={`px-3 py-1 rounded font-bold transition ${
                  depthLevel === "technical" ? "bg-[#2563EB] text-white shadow-xs" : "text-[#334155] hover:text-[#0F172A]"
                }`}
              >
                Technical
              </button>
            </div>
          </div>

          {/* Level Explanations */}
          {depthLevel === "beginner" && (
            <div className="space-y-2 text-[#334155] leading-relaxed">
              <p>
                <strong>1. Reading the Circuit:</strong> The app reads the gates you placed on your wires (like Hadamard or CNOT).
              </p>
              <p>
                <strong>2. Sending to Server:</strong> Your browser packages the circuit into a standard JSON message and sends it to our Python backend service.
              </p>
              <p>
                <strong>3. Real Quantum Calculation:</strong> IBM Qiskit Aer calculates the exact quantum probabilities and simulates measurement shots.
              </p>
              <p>
                <strong>4. Updating Visuals:</strong> The results travel back to your browser, updating your probability bars and 3D Bloch sphere vector instantly!
              </p>
            </div>
          )}

          {depthLevel === "intermediate" && (
            <div className="space-y-2 font-mono text-[#0F172A] leading-relaxed">
              <p>
                <strong>1. Circuit Serialization:</strong> The visual canvas converts your gate sequence into a standard <code>QuantumIR v1</code> JSON object.
              </p>
              <p>
                <strong>2. FastAPI API Call:</strong> An HTTP POST request is sent to <code>/api/v1/simulations/run</code> containing circuit specifications and shot counts (e.g. 1024 shots).
              </p>
              <p>
                <strong>3. Qiskit Transpilation:</strong> Python converts Quantum IR into a native Qiskit <code>QuantumCircuit</code> and compiles matrix operators.
              </p>
              <p>
                <strong>4. Aer Execution:</strong> <code>AerSimulator()</code> computes exact Hilbert space statevectors ($\alpha|00\rangle + \beta|11\rangle$) and samples measurement outcomes.
              </p>
            </div>
          )}

          {depthLevel === "technical" && (
            <div className="space-y-2 font-mono text-[#0F172A] leading-relaxed">
              <p>
                <strong>1. IR Schema Validation:</strong> <code>IRValidator.validate(circuit)</code> verifies qubit index bounds, gate arity, moment alignment, and parameter types.
              </p>
              <p>
                <strong>2. Dual-Circuit Compilation:</strong> Transpiles two parallel Qiskit circuits: <code>eval_qc</code> for pure statevector evaluation and <code>measure_qc</code> for Z-basis shot measurement.
              </p>
              <p>
                <strong>3. Statevector Extraction:</strong> <code>Statevector.from_instruction(eval_qc)</code> returns complex amplitudes ($\alpha = a + bi$), Born&apos;s Rule probabilities $|\alpha|^2$, and phase angles phi = atan2(Im, Re).
              </p>
              <p>
                <strong>4. C++ Aer Engine:</strong> Executes <code>AerSimulator().run(measure_qc, shots=N)</code> in C++, returning discrete bitstring frequency counts.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
