"use client";

import React from "react";
import { BarChart2, CheckCircle2, Award, BookOpen, Clock, Cpu } from "lucide-react";

export default function ProgressPage() {
  const completedModules = [
    { title: "Module 01: Qubits", status: "Completed", date: "Verified" },
    { title: "Module 02: Superposition & Hadamard", status: "Completed", date: "Verified" },
    { title: "Module 03: Measurement & Collapse", status: "Completed", date: "Verified" },
    { title: "Module 04: Single-Qubit Gates", status: "Completed", date: "Verified" },
  ];

  return (
    <div className="space-y-6 bg-white">
      {/* Title Header */}
      <div className="glass-panel p-6 bg-slate-50 border border-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-blue-600 font-mono text-xs font-black uppercase tracking-wider">
          <BarChart2 className="w-4 h-4 text-blue-600" /> Student Progress Tracker
        </div>
        <h1 className="text-2xl font-black text-black tracking-tight">Learning Overview</h1>
        <p className="text-xs text-slate-800 font-medium max-w-2xl leading-relaxed">
          Track your curriculum completion, unlocked achievement badges, and simulation metrics.
        </p>
      </div>

      {/* Progress Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="glass-panel p-4 bg-slate-50 border border-slate-300 space-y-1">
          <span className="text-slate-800 text-xs font-bold flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Curriculum
          </span>
          <div className="text-2xl font-black text-black">4 / 4</div>
          <span className="text-[11px] text-emerald-700 font-black">100% Modules Complete</span>
        </div>

        <div className="glass-panel p-4 bg-slate-50 border border-slate-300 space-y-1">
          <span className="text-slate-800 text-xs font-bold flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-blue-600" /> Qiskit Runs
          </span>
          <div className="text-2xl font-black text-black">128</div>
          <span className="text-[11px] text-blue-700 font-black">Qiskit Aer Executions</span>
        </div>

        <div className="glass-panel p-4 bg-slate-50 border border-slate-300 space-y-1">
          <span className="text-slate-800 text-xs font-bold flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-blue-600" /> Badges Unlocked
          </span>
          <div className="text-2xl font-black text-black">3</div>
          <span className="text-[11px] text-amber-700 font-black">Achievement Badges</span>
        </div>

        <div className="glass-panel p-4 bg-slate-50 border border-slate-300 space-y-1">
          <span className="text-slate-800 text-xs font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" /> Lab Time
          </span>
          <div className="text-2xl font-black text-black">1h 05m</div>
          <span className="text-[11px] text-purple-700 font-black">Interactive Learning</span>
        </div>
      </div>

      {/* Completed Modules Breakdown */}
      <div className="glass-panel p-6 bg-slate-50 border border-slate-300 space-y-4">
        <h3 className="font-black text-base text-black border-b border-slate-300 pb-3">
          Completed Curriculum Modules
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {completedModules.map((m, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg bg-white border border-slate-300 flex items-center justify-between font-mono text-xs shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-black font-black">{m.title}</span>
              </div>
              <span className="text-emerald-800 font-black text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                {m.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
