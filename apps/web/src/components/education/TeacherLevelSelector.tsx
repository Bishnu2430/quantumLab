"use client";

import React, { useState } from "react";
import { GraduationCap, BookOpen, Sigma } from "lucide-react";

interface ExplanationLevel {
  level: "beginner" | "engineering" | "mathematical";
  label: string;
  icon: any;
  content: React.ReactNode;
}

interface TeacherLevelSelectorProps {
  levels: {
    beginner: React.ReactNode;
    engineering: React.ReactNode;
    mathematical: React.ReactNode;
  };
}

export const TeacherLevelSelector: React.FC<TeacherLevelSelectorProps> = ({ levels }) => {
  const [activeLevel, setActiveLevel] = useState<"beginner" | "engineering" | "mathematical">("beginner");

  const tabs = [
    { id: "beginner" as const, label: "Level 1 — Intuitive", icon: GraduationCap, bg: "bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]" },
    { id: "engineering" as const, label: "Level 2 — Engineering", icon: BookOpen, bg: "bg-[#F0FDF4] text-[#166534] border-[#86EFAC]" },
    { id: "mathematical" as const, label: "Level 3 — Rigorous Math", icon: Sigma, bg: "bg-[#FAF5FF] text-[#6B21A8] border-[#E9D5FF]" },
  ];

  return (
    <div className="glass-panel p-5 bg-white border border-[#CBD5E1] rounded-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
        <div className="flex items-center gap-2 text-[#0F172A] font-bold text-xs uppercase font-mono tracking-wider">
          <GraduationCap className="w-4 h-4 text-[#2563EB]" />
          <span>Multi-Level Explanation (Teacher Mode)</span>
        </div>

        {/* Level Selector Tabs */}
        <div className="flex bg-[#F1F5F9] p-1 rounded-lg border border-[#CBD5E1] text-xs font-semibold">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeLevel === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveLevel(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
                  isActive
                    ? "bg-[#2563EB] text-white font-bold shadow-xs"
                    : "text-[#334155] hover:text-[#0F172A]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Level Explanation */}
      <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0F172A] leading-relaxed">
        {levels[activeLevel]}
      </div>
    </div>
  );
};
