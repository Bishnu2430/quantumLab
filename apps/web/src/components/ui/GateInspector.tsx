"use client";

import React from "react";
import { QuantumOperation } from "@/lib/api/quantum";
import { Code2 } from "lucide-react";

interface GateInspectorProps {
  operation: QuantumOperation | null;
}

const GATE_DETAILS: Record<
  string,
  { name: string; matrix: string; effect: string; qiskit: string; description: string }
> = {
  h: {
    name: "Hadamard Gate",
    matrix: "1/√2 * [ 1   1 ]\n       [ 1  -1 ]",
    effect: "H|0⟩ = |+⟩ = (|0⟩+|1⟩)/√2\nH|1⟩ = |−⟩ = (|0⟩-|1⟩)/√2",
    qiskit: "qc.h(0)",
    description: "Creates an equal-amplitude superposition from a basis state.",
  },
  x: {
    name: "Pauli-X",
    matrix: "[ 0  1 ]\n[ 1  0 ]",
    effect: "X|0⟩ = |1⟩\nX|1⟩ = |0⟩",
    qiskit: "qc.x(0)",
    description: "Flips the computational basis state (bit flip).",
  },
  y: {
    name: "Pauli-Y",
    matrix: "[ 0  -i ]\n[ i   0 ]",
    effect: "Y|0⟩ = i|1⟩\nY|1⟩ = -i|0⟩",
    qiskit: "qc.y(0)",
    description: "Performs both a bit flip and phase flip.",
  },
  z: {
    name: "Pauli-Z",
    matrix: "[ 1   0 ]\n[ 0  -1 ]",
    effect: "Z|0⟩ = |0⟩\nZ|1⟩ = -|1⟩",
    qiskit: "qc.z(0)",
    description: "Applies a 180° phase shift to state |1⟩.",
  },
  cx: {
    name: "Controlled-NOT (CNOT)",
    matrix: "[ 1 0 0 0 ]\n[ 0 1 0 0 ]\n[ 0 0 0 1 ]\n[ 0 0 1 0 ]",
    effect: "CNOT|00⟩ = |00⟩\nCNOT|10⟩ = |11⟩",
    qiskit: "qc.cx(0, 1)",
    description: "Flips target qubit if control qubit is in state |1⟩.",
  },
  measure: {
    name: "Measurement",
    matrix: "Projective Measurement",
    effect: "Collapses superposition into |0⟩ or |1⟩",
    qiskit: "qc.measure(0, 0)",
    description: "Measures quantum state into a classical bit register.",
  },
};

export const GateInspector: React.FC<GateInspectorProps> = ({ operation }) => {
  if (!operation) {
    return (
      <div className="glass-panel p-4 text-center text-xs text-[#64748B] italic bg-white border border-[#CBD5E1] rounded-xl font-sans">
        Click any gate on the circuit canvas to inspect its matrix, effect, and Qiskit code.
      </div>
    );
  }

  const details = GATE_DETAILS[operation.gate.toLowerCase()] || {
    name: operation.gate.toUpperCase(),
    matrix: "Unitary Operator",
    effect: "Transforms state vector",
    qiskit: `qc.${operation.gate}(0)`,
    description: "Standard quantum gate operation.",
  };

  const targetIdx = operation.targets[0] ?? 0;
  const controlIdx = operation.controls && operation.controls.length > 0 ? operation.controls[0] : null;

  // FIX #2: Valid executable Python syntax in educational inspector (qc.h(0), qc.cx(0, 1))
  let qiskitCodeFormatted = `qc.${operation.gate.toLowerCase()}(${targetIdx})`;
  if (operation.gate.toLowerCase() === "cx" && controlIdx !== null) {
    qiskitCodeFormatted = `qc.cx(${controlIdx}, ${targetIdx})`;
  } else if (operation.gate.toLowerCase() === "cz" && controlIdx !== null) {
    qiskitCodeFormatted = `qc.cz(${controlIdx}, ${targetIdx})`;
  } else if (operation.gate.toLowerCase() === "swap") {
    qiskitCodeFormatted = `qc.swap(${operation.targets[0]}, ${operation.targets[1]})`;
  } else if (operation.gate.toLowerCase() === "measure") {
    qiskitCodeFormatted = `qc.measure(${targetIdx}, ${operation.clbits ? operation.clbits[0] : targetIdx})`;
  }

  const targetStr = operation.targets.map((t) => `q[${t}]`).join(", ");
  const controlStr = operation.controls?.map((c) => `q[${c}]`).join(", ");

  return (
    <div className="glass-panel p-5 space-y-4 bg-white border border-[#CBD5E1] rounded-xl">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <h4 className="font-bold text-sm text-[#0F172A]">{details.name}</h4>
        <span className="font-mono text-xs text-[#475569] bg-[#F1F5F9] px-2.5 py-1 rounded border border-[#CBD5E1]">
          ID: {operation.id}
        </span>
      </div>

      <p className="text-xs text-[#334155] leading-relaxed font-sans">{details.description}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
        {/* Targets & Controls */}
        <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#CBD5E1] space-y-1">
          <div className="text-[#475569] text-[11px]">Wire bindings</div>
          <div><span className="text-[#475569]">Target:</span> <span className="text-[#2563EB] font-bold">{targetStr}</span></div>
          {controlStr && <div><span className="text-[#475569]">Control:</span> <span className="text-[#7E22CE] font-bold">{controlStr}</span></div>}
          <div><span className="text-[#475569]">Moment:</span> <span className="text-[#0F172A] font-bold">{operation.moment}</span></div>
        </div>

        {/* Qiskit Python Code Equivalent (Fix #2) */}
        <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#CBD5E1] space-y-1">
          <div className="text-[#475569] text-[11px] flex items-center gap-1">
            <Code2 className="w-3.5 h-3.5 text-[#475569]" /> Valid Qiskit Syntax
          </div>
          <div className="text-[#7E22CE] font-bold pt-1">
            <code>{qiskitCodeFormatted}</code>
          </div>
        </div>
      </div>

      {/* Matrix & Effect */}
      <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#CBD5E1] text-xs font-mono space-y-2">
        <div className="flex justify-between text-[11px] text-[#475569]">
          <span>Gate matrix</span>
          <span>Transformation effect</span>
        </div>
        <div className="flex flex-col sm:flex-row justify-between gap-2 text-[#0F172A]">
          <pre className="text-[#0F172A] font-bold">{details.matrix}</pre>
          <div className="text-[#2563EB] whitespace-pre-line text-right font-bold">{details.effect}</div>
        </div>
      </div>
    </div>
  );
};
