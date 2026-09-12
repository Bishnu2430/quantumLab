"use client";

import React, { useState } from "react";
import { BlochSphere } from "@/components/visualization/BlochSphere";
import { ComplexAmplitude } from "@/lib/api/quantum";
import { Info } from "lucide-react";

export const QubitStateExplorer: React.FC = () => {
  const [alpha, setAlpha] = useState<number>(1.0); // Default |0>
  const [phaseDeg, setPhaseDeg] = useState<number>(0);

  const betaMag = Math.sqrt(Math.max(0, 1 - alpha * alpha));
  const phaseRad = (phaseDeg * Math.PI) / 180;

  const betaReal = betaMag * Math.cos(phaseRad);
  const betaImag = betaMag * Math.sin(phaseRad);

  const prob0 = alpha * alpha;
  const prob1 = betaMag * betaMag;

  const statevector: ComplexAmplitude[] = [
    {
      state: "0",
      real: parseFloat(alpha.toFixed(4)),
      imag: 0,
      magnitude: parseFloat(prob0.toFixed(4)),
      phase: 0,
    },
    {
      state: "1",
      real: parseFloat(betaReal.toFixed(4)),
      imag: parseFloat(betaImag.toFixed(4)),
      magnitude: parseFloat(prob1.toFixed(4)),
      phase: parseFloat(phaseRad.toFixed(4)),
    },
  ];

  const applyPreset = (type: "0" | "1" | "+" | "-" | "i" | "-i") => {
    if (type === "0") {
      setAlpha(1.0);
      setPhaseDeg(0);
    } else if (type === "1") {
      setAlpha(0.0);
      setPhaseDeg(0);
    } else if (type === "+") {
      setAlpha(0.7071);
      setPhaseDeg(0);
    } else if (type === "-") {
      setAlpha(0.7071);
      setPhaseDeg(180);
    } else if (type === "i") {
      setAlpha(0.7071);
      setPhaseDeg(90);
    } else if (type === "-i") {
      setAlpha(0.7071);
      setPhaseDeg(270);
    }
  };

  return (
    <div className="glass-panel p-6 bg-white border border-[#CBD5E1] rounded-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div>
          <h3 className="font-bold text-base text-[#0F172A]">Explore a qubit</h3>
          <p className="text-xs text-[#334155] font-medium mt-0.5">
            Change the amplitude and relative phase to see the state vector and Bloch sphere move together.
          </p>
        </div>

        {/* Preset State Buttons */}
        <div className="flex flex-wrap gap-1 text-xs font-mono font-bold">
          <button
            onClick={() => applyPreset("0")}
            className="px-2.5 py-1 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] rounded border border-[#CBD5E1]"
          >
            |0⟩
          </button>
          <button
            onClick={() => applyPreset("1")}
            className="px-2.5 py-1 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] rounded border border-[#CBD5E1]"
          >
            |1⟩
          </button>
          <button
            onClick={() => applyPreset("+")}
            className="px-2.5 py-1 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] rounded border border-[#CBD5E1]"
          >
            |+⟩
          </button>
          <button
            onClick={() => applyPreset("-")}
            className="px-2.5 py-1 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] rounded border border-[#CBD5E1]"
          >
            |−⟩
          </button>
          <button
            onClick={() => applyPreset("i")}
            className="px-2.5 py-1 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] rounded border border-[#CBD5E1]"
          >
            |i⟩
          </button>
          <button
            onClick={() => applyPreset("-i")}
            className="px-2.5 py-1 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] rounded border border-[#CBD5E1]"
          >
            |-i⟩
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls & Math View */}
        <div className="space-y-4">
          <div className="bg-[#F8FAFC] p-3.5 rounded-lg border border-[#CBD5E1] font-mono text-xs text-center text-[#0F172A] font-bold">
            |Ψ⟩ = <span className="text-[#2563EB]">{alpha.toFixed(3)}</span>|0⟩ + (
            <span className="text-[#0284C7]">
              {betaReal.toFixed(3)} {betaImag >= 0 ? "+" : ""} {betaImag.toFixed(3)}i
            </span>
            )|1⟩
          </div>

          {/* Alpha Magnitude Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono font-semibold">
              <span className="text-[#0F172A]">α magnitude: {alpha.toFixed(3)}</span>
              <span className="text-[#2563EB]">P(0) = {(prob0 * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={alpha}
              onChange={(e) => setAlpha(parseFloat(e.target.value))}
              className="w-full h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
            />
          </div>

          {/* Phase Angle Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono font-semibold">
              <span className="text-[#0F172A]">Relative phase φ: {phaseDeg}°</span>
              <span className="text-[#0284C7]">P(1) = {(prob1 * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={phaseDeg}
              onChange={(e) => setPhaseDeg(parseInt(e.target.value))}
              className="w-full h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#0284C7]"
            />
          </div>

          <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#CBD5E1] text-xs space-y-1.5 text-[#0F172A] font-mono">
            <div className="flex justify-between">
              <span>|α|² + |β|²:</span> <span className="text-[#059669] font-bold">1.0000</span>
            </div>
            <div className="flex justify-between">
              <span>P(0) = |α|²:</span> <span className="text-[#2563EB] font-bold">{(prob0 * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>P(1) = |β|²:</span> <span className="text-[#0284C7] font-bold">{(prob1 * 100).toFixed(1)}%</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#EFF6FF] rounded-lg text-xs text-[#1E3A8A] flex items-start gap-2 border border-[#BFDBFE]">
            <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">
              The larger |α| is, the more likely a measurement returns |0⟩. The phase φ rotates the state vector around the Z-axis of the Bloch sphere without altering P(0) or P(1).
            </span>
          </div>
        </div>

        {/* 3D Bloch Sphere View */}
        <BlochSphere statevector={statevector} qubitIndex={0} />
      </div>
    </div>
  );
};
