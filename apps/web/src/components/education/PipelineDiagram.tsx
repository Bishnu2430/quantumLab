"use client";

import React from "react";
import { ArrowDown, Cpu, Network, Layers, BarChart3 } from "lucide-react";

export const PipelineDiagram: React.FC = () => {
  return (
    <div className="glass-panel p-5 bg-white border border-[#E2E8F0] rounded-xl space-y-4">
      <div className="flex items-center gap-2 text-[#2563EB] font-bold text-xs uppercase font-mono tracking-wider">
        <Network className="w-4 h-4 text-[#2563EB]" />
        <span>How PBQuantum Labs Simulator Works</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs font-mono">
        <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
          <Layers className="w-4 h-4 text-[#2563EB] mx-auto mb-1" />
          <strong className="block text-[#0F172A]">Circuit Canvas</strong>
          <span className="text-[10px] text-[#64748B]">User constructs circuit</span>
        </div>

        <div className="hidden sm:flex items-center justify-center text-[#94A3B8]">➔</div>

        <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg">
          <Network className="w-4 h-4 text-[#2563EB] mx-auto mb-1" />
          <strong className="block text-[#1E40AF]">Quantum IR v1</strong>
          <span className="text-[10px] text-[#1E3A8A]">FastAPI Payload</span>
        </div>

        <div className="hidden sm:flex items-center justify-center text-[#94A3B8]">➔</div>

        <div className="p-3 bg-[#F0FDF4] border border-[#86EFAC] rounded-lg">
          <Cpu className="w-4 h-4 text-[#16A34A] mx-auto mb-1" />
          <strong className="block text-[#166534]">Qiskit Aer</strong>
          <span className="text-[10px] text-[#14532D]">Statevector & Shots</span>
        </div>
      </div>
    </div>
  );
};
