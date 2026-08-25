"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ArrowRight, ArrowLeft } from "lucide-react";

interface LessonShellProps {
  moduleNumber: string;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  prevLesson?: { title: string; href: string };
  nextLesson?: { title: string; href: string };
  children: React.ReactNode;
}

export const LessonShell: React.FC<LessonShellProps> = ({
  moduleNumber,
  title,
  subtitle,
  estimatedMinutes,
  prevLesson,
  nextLesson,
  children,
}) => {
  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-700 font-semibold">
        <Link href="/learn" className="hover:text-blue-600 transition">Curriculum</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-blue-600 font-bold">Module {moduleNumber}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-black font-bold">{title}</span>
      </div>

      {/* Lesson Header Hero */}
      <div className="glass-panel p-6 sm:p-8 space-y-3 bg-slate-50 border border-slate-300">
        <div className="text-xs font-mono text-blue-600 font-bold uppercase tracking-wider">
          Module {moduleNumber} · {estimatedMinutes} min
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">{title}</h1>
        <p className="text-sm font-medium text-slate-800 max-w-3xl leading-relaxed">{subtitle}</p>
      </div>

      {/* Main Lesson Content */}
      <div className="space-y-8">{children}</div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between gap-4 pt-6 border-t border-slate-300">
        {prevLesson ? (
          <Link
            href={prevLesson.href}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" /> Previous: {prevLesson.title}
          </Link>
        ) : (
          <div />
        )}

        {nextLesson && (
          <Link
            href={nextLesson.href}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition shadow-sm"
          >
            Next: {nextLesson.title} <ArrowRight className="w-4 h-4 text-white" />
          </Link>
        )}
      </div>
    </div>
  );
};
