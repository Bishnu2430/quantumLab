"use client";

import React from "react";
import { CheckCircle2, Target } from "lucide-react";

interface LearningObjectivesProps {
  objectives: string[];
}

export const LearningObjectives: React.FC<LearningObjectivesProps> = ({ objectives }) => {
  return (
    <div className="glass-panel p-5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl space-y-3">
      <div className="flex items-center gap-2 text-[#1E40AF] font-bold text-xs uppercase font-mono tracking-wider">
        <Target className="w-4 h-4 text-[#2563EB]" />
        <span>Learning Objectives</span>
      </div>

      <p className="text-xs text-[#1E3A8A] font-semibold">
        By the end of this lesson, you should be able to:
      </p>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#0F172A]">
        {objectives.map((obj, idx) => (
          <li key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-[#DBEAFE]">
            <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
            <span className="font-medium leading-snug">{obj}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
