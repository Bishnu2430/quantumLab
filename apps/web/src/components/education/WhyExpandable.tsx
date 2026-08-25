"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

interface WhyExpandableProps {
  questionTitle: string;
  explanation: React.ReactNode;
}

export const WhyExpandable: React.FC<WhyExpandableProps> = ({ questionTitle, explanation }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="border border-[#BFDBFE] rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-left transition font-mono text-xs text-[#1E40AF] font-bold focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:outline-none"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#2563EB] shrink-0" />
          <span>Why? — {questionTitle}</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-[#2563EB]" /> : <ChevronDown className="w-4 h-4 text-[#2563EB]" />}
      </button>

      {isOpen && (
        <div className="p-4 text-xs text-[#0F172A] leading-relaxed space-y-2 border-t border-[#BFDBFE] bg-white font-sans">
          {explanation}
        </div>
      )}
    </div>
  );
};
