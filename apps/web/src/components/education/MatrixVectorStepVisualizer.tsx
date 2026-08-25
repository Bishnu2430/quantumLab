"use client";

import React, { useState } from "react";
import { Calculator, ArrowRight, RotateCcw } from "lucide-react";

export const MatrixVectorStepVisualizer: React.FC = () => {
  const [gateType, setGateType] = useState<"H" | "X" | "Z">("H");
  const [initialState, setInitialState] = useState<"0" | "1">("0");
  const [currentStep, setCurrentStep] = useState<number>(0);

  const matrices = {
    H: {
      name: "Hadamard (H)",
      factor: "1/√2",
      m: [
        [1, 1],
        [1, -1],
      ],
    },
    X: {
      name: "Pauli-X (Bit Flip)",
      factor: "1",
      m: [
        [0, 1],
        [1, 0],
      ],
    },
    Z: {
      name: "Pauli-Z (Phase Flip)",
      factor: "1",
      m: [
        [1, 0],
        [0, -1],
      ],
    },
  };

  const mat = matrices[gateType];
  const vec = initialState === "0" ? [1, 0] : [0, 1];

  // Calculation steps:
  // Step 0: Initial Setup
  // Step 1: Row 1 calculation: m[0][0]*vec[0] + m[0][1]*vec[1]
  // Step 2: Row 2 calculation: m[1][0]*vec[0] + m[1][1]*vec[1]
  // Step 3: Final Output Vector
  const row1Result = mat.m[0][0] * vec[0] + mat.m[0][1] * vec[1];
  const row2Result = mat.m[1][0] * vec[0] + mat.m[1][1] * vec[1];

  const totalSteps = 3;

  return (
    <div className="glass-panel p-6 bg-white border border-[#CBD5E1] rounded-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div>
          <h3 className="font-bold text-base text-[#0F172A] flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#2563EB]" />
            Step-by-Step Matrix Vector Multiplication
          </h3>
          <p className="text-xs text-[#334155] font-medium mt-0.5">
            Follow how quantum gate matrices transform input state vectors row by row.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <select
            value={gateType}
            onChange={(e) => {
              setGateType(e.target.value as any);
              setCurrentStep(0);
            }}
            className="px-2.5 py-1 bg-[#F1F5F9] border border-[#CBD5E1] rounded text-[#0F172A] font-bold"
          >
            <option value="H">Hadamard (H)</option>
            <option value="X">Pauli-X</option>
            <option value="Z">Pauli-Z</option>
          </select>

          <button
            onClick={() => {
              setInitialState(initialState === "0" ? "1" : "0");
              setCurrentStep(0);
            }}
            className="px-3 py-1 bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] rounded font-bold"
          >
            Input: |{initialState}⟩
          </button>
        </div>
      </div>

      {/* Visual Multiplication Display */}
      <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#CBD5E1] font-mono text-xs sm:text-sm space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-3 text-[#0F172A] font-bold">
          <span>{mat.factor !== "1" ? `${mat.factor} * ` : ""}</span>

          {/* 2x2 Matrix */}
          <div className="inline-flex border-l-2 border-r-2 border-[#2563EB] px-3 py-1.5 text-center">
            <div className="space-y-1">
              <div className={currentStep >= 1 ? "bg-[#DBEAFE] text-[#1E40AF] px-1.5 rounded" : ""}>
                {mat.m[0][0]} &nbsp; {mat.m[0][1]}
              </div>
              <div className={currentStep >= 2 ? "bg-[#DCFCE7] text-[#166534] px-1.5 rounded" : ""}>
                {mat.m[1][0]} &nbsp; {mat.m[1][1]}
              </div>
            </div>
          </div>

          <span>×</span>

          {/* Input Vector */}
          <div className="inline-flex border-l-2 border-r-2 border-[#0284C7] px-2 py-1.5 text-center">
            <div className="space-y-1">
              <div>{vec[0]}</div>
              <div>{vec[1]}</div>
            </div>
          </div>

          <span>=</span>

          {/* Result Vector */}
          <div className="inline-flex border-l-2 border-r-2 border-[#059669] px-3 py-1.5 text-center">
            <div className="space-y-1">
              <div className={currentStep >= 1 ? "text-[#2563EB] font-bold" : "text-[#94A3B8]"}>
                {currentStep >= 1 ? `${row1Result}` : "?"}
              </div>
              <div className={currentStep >= 2 ? "text-[#059669] font-bold" : "text-[#94A3B8]"}>
                {currentStep >= 2 ? `${row2Result}` : "?"}
              </div>
            </div>
          </div>
        </div>

        {/* Step Explanation Text */}
        <div className="p-3 bg-white rounded-md border border-[#CBD5E1] text-xs font-sans text-[#334155]">
          {currentStep === 0 && (
            <span>
              <strong>Step 0: Initial Setup.</strong> Matrix <strong>{mat.name}</strong> will multiply state vector |{initialState}⟩ = [{vec[0]}, {vec[1]}]ᵀ.
            </span>
          )}
          {currentStep === 1 && (
            <span>
              <strong>Step 1: Top Row Calculation.</strong> Row 1 dot product: ({mat.m[0][0]} × {vec[0]}) + ({mat.m[0][1]} × {vec[1]}) = <strong>{row1Result}</strong> (α amplitude).
            </span>
          )}
          {currentStep === 2 && (
            <span>
              <strong>Step 2: Bottom Row Calculation.</strong> Row 2 dot product: ({mat.m[1][0]} × {vec[0]}) + ({mat.m[1][1]} × {vec[1]}) = <strong>{row2Result}</strong> (β amplitude).
            </span>
          )}
          {currentStep >= 3 && (
            <span>
              <strong>Step 3: Final Output Vector.</strong> State transformation complete! Result vector is {mat.factor !== "1" ? `${mat.factor} * ` : ""}[{row1Result}, {row2Result}]ᵀ.
            </span>
          )}
        </div>
      </div>

      {/* Stepper Buttons */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => setCurrentStep(0)}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] rounded border border-[#CBD5E1] text-xs font-bold"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Step
        </button>

        <button
          onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
          disabled={currentStep >= totalSteps}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded text-xs font-bold shadow-xs disabled:opacity-40"
        >
          <span>Next Calculation Step ({currentStep}/{totalSteps})</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
