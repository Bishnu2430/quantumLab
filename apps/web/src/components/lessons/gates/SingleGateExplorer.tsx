"use client";

import React, { useState } from "react";
import { BlochSphere } from "@/components/visualization/BlochSphere";
import { ComplexAmplitude } from "@/lib/api/quantum";

interface SingleGateInfo {
  id: string;
  symbol: string;
  name: string;
  matrix: string;
  description: string;
  qiskit: string;
  transform0: { sv: ComplexAmplitude[]; label: string };
  transform1: { sv: ComplexAmplitude[]; label: string };
}

const GATES_DATA: SingleGateInfo[] = [
  {
    id: "x",
    symbol: "X",
    name: "Pauli-X",
    matrix: "[ 0  1 ]\n[ 1  0 ]",
    description: "Flips the basis state: X|0⟩ = |1⟩ and X|1⟩ = |0⟩. Rotates 180° around X-axis.",
    qiskit: "qc.x(0)",
    transform0: {
      label: "X|0⟩ = |1⟩",
      sv: [
        { state: "0", real: 0, imag: 0, magnitude: 0, phase: 0 },
        { state: "1", real: 1, imag: 0, magnitude: 1, phase: 0 },
      ],
    },
    transform1: {
      label: "X|1⟩ = |0⟩",
      sv: [
        { state: "0", real: 1, imag: 0, magnitude: 1, phase: 0 },
        { state: "1", real: 0, imag: 0, magnitude: 0, phase: 0 },
      ],
    },
  },
  {
    id: "z",
    symbol: "Z",
    name: "Pauli-Z",
    matrix: "[ 1   0 ]\n[ 0  -1 ]",
    description: "Leaves |0⟩ unchanged, flips phase of |1⟩: Z|0⟩ = |0⟩, Z|1⟩ = -|1⟩.",
    qiskit: "qc.z(0)",
    transform0: {
      label: "Z|0⟩ = |0⟩",
      sv: [
        { state: "0", real: 1, imag: 0, magnitude: 1, phase: 0 },
        { state: "1", real: 0, imag: 0, magnitude: 0, phase: 0 },
      ],
    },
    transform1: {
      label: "Z|1⟩ = -|1⟩",
      sv: [
        { state: "0", real: 0, imag: 0, magnitude: 0, phase: 0 },
        { state: "1", real: -1, imag: 0, magnitude: 1, phase: 3.1416 },
      ],
    },
  },
  {
    id: "h",
    symbol: "H",
    name: "Hadamard",
    matrix: "1/√2 * [ 1   1 ]\n       [ 1  -1 ]",
    description: "Creates superposition: H|0⟩ = |+⟩ and H|1⟩ = |−⟩.",
    qiskit: "qc.h(0)",
    transform0: {
      label: "H|0⟩ = |+⟩ = (|0⟩+|1⟩)/√2",
      sv: [
        { state: "0", real: 0.7071, imag: 0, magnitude: 0.5, phase: 0 },
        { state: "1", real: 0.7071, imag: 0, magnitude: 0.5, phase: 0 },
      ],
    },
    transform1: {
      label: "H|1⟩ = |−⟩ = (|0⟩-|1⟩)/√2",
      sv: [
        { state: "0", real: 0.7071, imag: 0, magnitude: 0.5, phase: 0 },
        { state: "1", real: -0.7071, imag: 0, magnitude: 0.5, phase: 3.1416 },
      ],
    },
  },
  {
    id: "y",
    symbol: "Y",
    name: "Pauli-Y",
    matrix: "[ 0  -i ]\n[ i   0 ]",
    description: "Performs both a bit flip and phase flip: Y|0⟩ = i|1⟩, Y|1⟩ = -i|0⟩.",
    qiskit: "qc.y(0)",
    transform0: {
      label: "Y|0⟩ = i|1⟩",
      sv: [
        { state: "0", real: 0, imag: 0, magnitude: 0, phase: 0 },
        { state: "1", real: 0, imag: 1, magnitude: 1, phase: 1.5708 },
      ],
    },
    transform1: {
      label: "Y|1⟩ = -i|0⟩",
      sv: [
        { state: "0", real: 0, imag: -1, magnitude: 1, phase: -1.5708 },
        { state: "1", real: 0, imag: 0, magnitude: 0, phase: 0 },
      ],
    },
  },
];

export const SingleGateExplorer: React.FC = () => {
  const [selectedGateId, setSelectedGateId] = useState<string>("x");
  const [inputState, setInputState] = useState<"0" | "1">("0");

  const gate = GATES_DATA.find((g) => g.id === selectedGateId) || GATES_DATA[0];
  const transform = inputState === "0" ? gate.transform0 : gate.transform1;

  return (
    <div className="glass-panel p-6 bg-white border border-[#CBD5E1] rounded-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div>
          <h3 className="font-bold text-base text-[#0F172A]">Explore a gate</h3>
          <p className="text-xs text-[#334155] font-medium mt-0.5">
            Select a gate to see its matrix, Qiskit code, and state transformation on the Bloch sphere.
          </p>
        </div>

        {/* Gate Selector Tabs */}
        <div className="flex bg-[#F1F5F9] p-1 rounded-lg border border-[#CBD5E1] text-xs font-mono">
          {GATES_DATA.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGateId(g.id)}
              className={`px-3 py-1 rounded transition ${
                selectedGateId === g.id
                  ? "bg-[#2563EB] text-white font-bold shadow-xs"
                  : "text-[#334155] hover:text-[#0F172A]"
              }`}
            >
              {g.symbol}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gate Details */}
        <div className="space-y-4">
          <div className="bg-[#F8FAFC] p-4 rounded-lg border border-[#CBD5E1] space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="font-bold text-sm text-[#0F172A]">
                {gate.name} ({gate.symbol})
              </span>
              <button
                onClick={() => setInputState(inputState === "0" ? "1" : "0")}
                className="text-[#2563EB] font-bold hover:underline"
              >
                Input: |{inputState}⟩
              </button>
            </div>
            <p className="text-xs text-[#334155] font-medium leading-relaxed">{gate.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#CBD5E1] space-y-1">
              <span className="text-[#334155] text-[11px] block font-bold">Gate matrix</span>
              <pre className="text-[#0F172A] font-bold">{gate.matrix}</pre>
            </div>
            <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#CBD5E1] space-y-1">
              <span className="text-[#334155] text-[11px] block font-bold">Qiskit</span>
              <span className="text-[#059669] font-bold block pt-1">{gate.qiskit}</span>
            </div>
          </div>

          <div className="bg-[#EFF6FF] p-3.5 rounded-lg border border-[#BFDBFE] font-mono text-xs text-[#1E40AF] font-bold">
            Result: {transform.label}
          </div>
        </div>

        {/* 3D Bloch Sphere Trajectory */}
        <BlochSphere statevector={transform.sv} qubitIndex={0} />
      </div>
    </div>
  );
};
