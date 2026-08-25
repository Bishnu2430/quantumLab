"use client";

import React from "react";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

interface MisconceptionPair {
  misconception: string;
  rigorousFact: string;
}

interface CommonMistakesProps {
  pairs: MisconceptionPair[];
}

export const CommonMistakes: React.FC<CommonMistakesProps> = ({ pairs }) => {
  return (
    <div className="glass-panel p-5 bg-white border border-[#E2E8F0] rounded-xl space-y-4">
      <div className="flex items-center gap-2 text-[#D97706] font-bold text-xs uppercase font-mono tracking-wider">
        <AlertCircle className="w-4 h-4 text-[#D97706]" />
        <span>Common Misconceptions vs. Quantum Rigor</span>
      </div>

      <div className="space-y-3">
        {pairs.map((pair, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Common Misconception */}
            <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#991B1B]">
                <XCircle className="w-4 h-4 text-[#DC2626]" />
                <span>Common Misconception</span>
              </div>
              <p className="text-[#7F1D1D] leading-relaxed font-medium">{pair.misconception}</p>
            </div>

            {/* Rigorous Explanation */}
            <div className="p-3 bg-[#F0FDF4] border border-[#86EFAC] rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#166534]">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                <span>Rigorous Quantum Mechanics</span>
              </div>
              <p className="text-[#14532D] leading-relaxed font-medium">{pair.rigorousFact}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
