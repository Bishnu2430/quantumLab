"use client";

import React, { useState } from "react";
import { Calculator } from "lucide-react";

export const EquationDerivationBlock: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"H0" | "H1">("H0");

  return (
    <div className="glass-panel rounded-xl p-6 bg-white border border-[#CBD5E1] space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div>
          <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#2563EB]" />
            Hadamard Gate Mathematical Derivation
          </h3>
          <p className="text-xs text-[#334155] font-medium mt-0.5">
            Step-by-step matrix multiplication showing state transformation.
          </p>
        </div>

        {/* Tab Selector for H|0> vs H|1> */}
        <div className="flex bg-[#F1F5F9] p-1 rounded-lg border border-[#CBD5E1] text-xs font-semibold">
          <button
            onClick={() => setActiveTab("H0")}
            className={`px-4 py-1.5 rounded-md transition ${
              activeTab === "H0"
                ? "bg-[#2563EB] text-white shadow-xs font-bold"
                : "text-[#334155] hover:text-[#0F172A]"
            }`}
          >
            H|0⟩ → |+⟩
          </button>
          <button
            onClick={() => setActiveTab("H1")}
            className={`px-4 py-1.5 rounded-md transition ${
              activeTab === "H1"
                ? "bg-[#0284C7] text-white shadow-xs font-bold"
                : "text-[#334155] hover:text-[#0F172A]"
            }`}
          >
            H|1⟩ → |−⟩
          </button>
        </div>
      </div>

      {activeTab === "H0" ? (
        <div className="space-y-4">
          <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#CBD5E1] font-mono text-xs sm:text-sm space-y-3">
            <div className="text-[#334155]">
              <span className="text-[#2563EB] font-bold">Initial State:</span> |0⟩ = [1, 0]ᵀ
            </div>
            <div className="text-[#334155]">
              <span className="text-[#0284C7] font-bold">Hadamard Matrix:</span> H = (1/√2) * [[1, 1], [1, -1]]
            </div>

            {/* Matrix Multiplication */}
            <div className="py-3 px-4 bg-white rounded-lg border border-[#CBD5E1] text-[#0F172A] font-extrabold flex flex-wrap items-center gap-3 shadow-xs">
              <span>H|0⟩ =</span>
              <span className="text-[#334155]">(1/√2)</span>
              <div className="inline-flex border-l-2 border-r-2 border-[#2563EB] px-2 py-1 text-center text-xs">
                <div>1 &nbsp; 1</div>
                <div>1 &nbsp; -1</div>
              </div>
              <div className="inline-flex border-l-2 border-r-2 border-[#0284C7] px-2 py-1 text-center text-xs">
                <div>1</div>
                <div>0</div>
              </div>
              <span>=</span>
              <span className="text-[#334155]">(1/√2)</span>
              <div className="inline-flex border-l-2 border-r-2 border-[#2563EB] px-2 py-1 text-center text-xs">
                <div>1</div>
                <div>1</div>
              </div>
              <span>=</span>
              <span className="text-[#059669] font-bold">|+⟩</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-[#EFF6FF] p-3 rounded-lg border border-[#BFDBFE]">
              <span className="text-[#1E40AF] block mb-1 font-semibold">Statevector Amplitudes:</span>
              <span className="font-mono text-[#0F172A] font-bold">α = +1/√2 ≈ +0.7071, β = +1/√2 ≈ +0.7071</span>
            </div>
            <div className="bg-[#F0FDF4] p-3 rounded-lg border border-[#86EFAC]">
              <span className="text-[#166534] block mb-1 font-semibold">Measurement Probabilities:</span>
              <span className="font-mono text-[#166534] font-bold">P(0) = |α|² = 50%, P(1) = |β|² = 50%</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#CBD5E1] font-mono text-xs sm:text-sm space-y-3">
            <div className="text-[#334155]">
              <span className="text-[#2563EB] font-bold">Initial State:</span> |1⟩ = [0, 1]ᵀ
            </div>
            <div className="text-[#334155]">
              <span className="text-[#0284C7] font-bold">Hadamard Matrix:</span> H = (1/√2) * [[1, 1], [1, -1]]
            </div>

            {/* Matrix Multiplication */}
            <div className="py-3 px-4 bg-white rounded-lg border border-[#CBD5E1] text-[#0F172A] font-extrabold flex flex-wrap items-center gap-3 shadow-xs">
              <span>H|1⟩ =</span>
              <span className="text-[#334155]">(1/√2)</span>
              <div className="inline-flex border-l-2 border-r-2 border-[#2563EB] px-2 py-1 text-center text-xs">
                <div>1 &nbsp; 1</div>
                <div>1 &nbsp; -1</div>
              </div>
              <div className="inline-flex border-l-2 border-r-2 border-[#0284C7] px-2 py-1 text-center text-xs">
                <div>0</div>
                <div>1</div>
              </div>
              <span>=</span>
              <span className="text-[#334155]">(1/√2)</span>
              <div className="inline-flex border-l-2 border-r-2 border-[#DC2626] px-2 py-1 text-center text-xs">
                <div>1</div>
                <div className="text-[#DC2626]">-1</div>
              </div>
              <span>=</span>
              <span className="text-[#DC2626] font-bold">|−⟩</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-[#EFF6FF] p-3 rounded-lg border border-[#BFDBFE]">
              <span className="text-[#1E40AF] block mb-1 font-semibold">Statevector Amplitudes (Relative Phase!):</span>
              <span className="font-mono text-[#0F172A] font-bold">α = +0.7071, β = -0.7071 (Phase = 180°)</span>
            </div>
            <div className="bg-[#F0FDF4] p-3 rounded-lg border border-[#86EFAC]">
              <span className="text-[#166534] block mb-1 font-semibold">Measurement Probabilities:</span>
              <span className="font-mono text-[#166534] font-bold">P(0) = |+0.7071|² = 50%, P(1) = |-0.7071|² = 50%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
