"use client";

import React, { useState } from "react";
import { Grid, Layers, Sparkles, RefreshCw, ArrowRight } from "lucide-react";

export const MultiQubitMatrixLab: React.FC = () => {
  // 2-Qubit state vector amplitudes: c00, c01, c10, c11
  const [amplitudes, setAmplitudes] = useState<number[]>([1, 0, 0, 0]); // default |00>
  const [selectedGate, setSelectedGate] = useState<string>("cnot");

  // Basis names
  const basis = ["|00⟩", "|01⟩", "|10⟩", "|11⟩"];

  // Gate Matrices (4x4)
  const GATES: { [key: string]: { name: string; matrix: number[][]; desc: string } } = {
    cnot: {
      name: "CNOT (CX)",
      desc: "Flips Qubit 1 (target) if Qubit 0 (control) is |1⟩. Transforms |10⟩ ↔ |11⟩.",
      matrix: [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 1],
        [0, 0, 1, 0],
      ],
    },
    swap: {
      name: "SWAP",
      desc: "Exchanges the states of Qubit 0 and Qubit 1. Transforms |01⟩ ↔ |10⟩.",
      matrix: [
        [1, 0, 0, 0],
        [0, 0, 1, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 1],
      ],
    },
    cz: {
      name: "Controlled-Z (CZ)",
      desc: "Applies a π phase shift only to the |11⟩ component. Symmetric in control/target.",
      matrix: [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, -1],
      ],
    },
    h_on_0: {
      name: "H ⊗ I (Hadamard on Q0)",
      desc: "Creates superposition on Qubit 0 while leaving Qubit 1 unaffected.",
      matrix: [
        [1 / Math.SQRT2, 0, 1 / Math.SQRT2, 0],
        [0, 1 / Math.SQRT2, 0, 1 / Math.SQRT2],
        [1 / Math.SQRT2, 0, -1 / Math.SQRT2, 0],
        [0, 1 / Math.SQRT2, 0, -1 / Math.SQRT2],
      ],
    },
  };

  const gateInfo = GATES[selectedGate];

  // Apply matrix multiplication to state vector
  const applyGate = (gateKey: string) => {
    setSelectedGate(gateKey);
    const M = GATES[gateKey].matrix;
    const nextAmps = [0, 0, 0, 0];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        nextAmps[r] += M[r][c] * amplitudes[c];
      }
    }
    // Clean tiny float rounding
    setAmplitudes(nextAmps.map((v) => (Math.abs(v) < 1e-9 ? 0 : v)));
  };

  const resetState = (initial: number[]) => {
    setAmplitudes(initial);
  };

  // Check separability: c00*c11 - c01*c10
  const det = amplitudes[0] * amplitudes[3] - amplitudes[1] * amplitudes[2];
  const isEntangled = Math.abs(det) > 0.05;

  return (
    <div className="flex flex-col bg-surface-sunken text-text rounded-2xl border border-border shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-surface/90 border-b border-border/80 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-viz-negative/20 text-viz-negative border border-viz-negative/30">
              <Grid className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-text tracking-wide">
              Multi-Qubit State Space & 4×4 Matrix Lab
            </h2>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Explore the 4-dimensional Hilbert space (ℂ⁴), 2-qubit unitary operators, and tensor products.
          </p>
        </div>

        {/* Entanglement Status Badge */}
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              isEntangled
                ? "bg-viz-secondary/80 border-viz-secondary text-viz-secondary shadow-lg shadow-viz-secondary"
                : "bg-surface border-border text-text-muted"
            }`}
          >
            {isEntangled ? "✨ State is Entangled" : "Product (Separable) State"}
          </span>
        </div>
      </div>

      {/* Main Studio Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
        {/* Left: State Vector & Probability Bars */}
        <div className="lg:col-span-6 p-6 flex flex-col justify-between bg-radial from-surface via-surface-sunken to-black space-y-6">
          <div>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">
              Current 2-Qubit State Vector |ψ⟩
            </span>
            <div className="p-3 bg-surface/80 rounded-xl border border-border font-mono text-sm text-text">
              |ψ⟩ ={" "}
              {amplitudes
                .map((amp, i) => {
                  if (Math.abs(amp) < 1e-4) return null;
                  const sign = amp > 0 ? (i === 0 ? "" : "+ ") : "- ";
                  const val = Math.abs(amp);
                  const strVal = Math.abs(val - 1 / Math.SQRT2) < 0.01 ? "1/√2" : val.toFixed(3);
                  return `${sign}${strVal}${basis[i]}`;
                })
                .filter(Boolean)
                .join(" ") || "0"}
            </div>
          </div>

          {/* Basis Probability Bars */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
              Measurement Probabilities P(|ij⟩) = |c_ij|²
            </span>
            <div className="grid grid-cols-2 gap-3">
              {amplitudes.map((amp, i) => {
                const prob = Math.pow(amp, 2) * 100;
                return (
                  <div key={i} className="p-3 bg-surface/70 rounded-xl border border-border font-mono">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-viz-negative font-bold">{basis[i]}</span>
                      <span className="text-text-muted">{prob.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-surface-raised rounded-full overflow-hidden">
                      <div
                        className="h-full bg-viz-negative transition-all duration-300"
                        style={{ width: `${prob}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-text-subtle mt-1">amp: {amp.toFixed(3)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preset Shortcuts */}
          <div>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">
              Input State Presets
            </span>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <button
                onClick={() => resetState([1, 0, 0, 0])}
                className="px-3 py-1.5 rounded-lg bg-surface-raised hover:bg-surface-raised text-text border border-border"
              >
                |00⟩
              </button>
              <button
                onClick={() => resetState([0, 0, 1, 0])}
                className="px-3 py-1.5 rounded-lg bg-surface-raised hover:bg-surface-raised text-text border border-border"
              >
                |10⟩
              </button>
              <button
                onClick={() => resetState([1 / 2, 1 / 2, 1 / 2, 1 / 2])}
                className="px-3 py-1.5 rounded-lg bg-surface-raised hover:bg-surface-raised text-text border border-border"
              >
                |++⟩
              </button>
              <button
                onClick={() => resetState([1 / Math.SQRT2, 0, 0, 1 / Math.SQRT2])}
                className="px-3 py-1.5 rounded-lg bg-viz-secondary/60 hover:bg-viz-secondary/80 text-viz-secondary border border-viz-secondary"
              >
                Bell |Φ⁺⟩
              </button>
            </div>
          </div>
        </div>

        {/* Right: 4x4 Unitary Matrix View & Gate Deck */}
        <div className="lg:col-span-6 bg-surface/70 border-t lg:border-t-0 lg:border-l border-border p-6 flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2.5">
              Apply 2-Qubit Gate (U |ψ⟩)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(GATES).map((key) => (
                <button
                  key={key}
                  onClick={() => applyGate(key)}
                  className={`p-3 rounded-xl border text-left font-mono transition flex flex-col ${
                    selectedGate === key
                      ? "bg-viz-negative/60 border-viz-negative shadow-md shadow-viz-negative text-viz-negative"
                      : "bg-surface-sunken/60 border-border hover:border-border text-text-muted"
                  }`}
                >
                  <span className="text-xs font-bold">{GATES[key].name}</span>
                  <span className="text-[10px] text-text-muted mt-1 line-clamp-1">{GATES[key].desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4x4 Matrix Grid Display */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                {gateInfo.name} Matrix (4×4)
              </span>
              <span className="text-[10px] font-mono text-text-subtle">Unitary: U† U = I</span>
            </div>

            <div className="p-4 bg-surface-sunken rounded-xl border border-border font-mono text-center">
              <div className="grid grid-cols-4 gap-2 text-xs">
                {gateInfo.matrix.map((row, r) =>
                  row.map((val, c) => {
                    const str =
                      Math.abs(val - 1 / Math.SQRT2) < 0.01
                        ? "1/√2"
                        : Math.abs(val + 1 / Math.SQRT2) < 0.01
                        ? "-1/√2"
                        : val.toString();
                    const isActive = Math.abs(val) > 0;
                    return (
                      <div
                        key={`${r}-${c}`}
                        className={`py-2 rounded-lg border ${
                          isActive
                            ? "bg-viz-negative/30 border-viz-negative/50 text-viz-negative font-bold"
                            : "bg-surface/40 border-border text-text-subtle"
                        }`}
                      >
                        {str}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-surface-sunken rounded-xl border border-border text-xs text-text-muted leading-relaxed">
            <strong className="text-text">Entanglement Creation:</strong> If you start from product state{" "}
            <code className="text-viz-negative">|00⟩</code>, apply <code className="text-viz-negative">H ⊗ I</code> to get{" "}
            <code className="text-viz-negative">(|00⟩ + |10⟩)/√2</code>, then apply <code className="text-viz-negative">CNOT</code>{" "}
            to create the entangled Bell state <code className="text-viz-secondary">(|00⟩ + |11⟩)/√2</code>!
          </div>
        </div>
      </div>
    </div>
  );
};
