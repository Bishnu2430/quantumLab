import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, Clock, Code2, Cpu, Eye } from "lucide-react";

import { LESSONS } from "@/content";

export const metadata: Metadata = {
  title: "Curriculum",
  description:
    "A sequenced course in quantum computing: derivations, interactive visuals, and circuits you run on a real simulator.",
};

const DIFFICULTY_STYLES: Record<string, string> = {
  beginner: "bg-success-soft text-success border-success-border",
  intermediate: "bg-warning-soft text-warning border-warning-border",
  advanced: "bg-danger-soft text-danger border-danger-border",
};

export default function CurriculumPage() {
  const totalMinutes = LESSONS.reduce((sum, lesson) => sum + lesson.estimatedMinutes, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">Curriculum</h1>
        <p className="mt-2 text-[15px] leading-7 text-text-muted max-w-prose">
          Each lesson builds the mathematics, then lets you test it. Every circuit here runs on
          Qiskit Aer, and every stated result is verified against that simulator before it ships.
        </p>
        <p className="mt-3 text-[13px] text-text-subtle">
          {LESSONS.length} lessons · about {Math.round(totalMinutes / 60 * 10) / 10} hours
        </p>
      </header>

      <ol className="space-y-3">
        {LESSONS.map((lesson) => (
          <li key={lesson.slug}>
            <Link
              href={`/learn/${lesson.slug}`}
              className="block panel p-4 hover:border-accent-border transition-colors group"
            >
              <div className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="shrink-0 w-9 h-9 rounded-lg bg-accent-soft border border-accent-border
                             flex items-center justify-center font-mono text-xs font-bold text-accent-text"
                >
                  {String(lesson.order).padStart(2, "0")}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-[15px] font-semibold text-text group-hover:text-accent transition-colors">
                      {lesson.title}
                    </h2>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium capitalize border ${
                        DIFFICULTY_STYLES[lesson.difficulty]
                      }`}
                    >
                      {lesson.difficulty}
                    </span>
                  </div>

                  <p className="text-[13px] leading-6 text-text-muted">{lesson.summary}</p>

                  {/* Badges reflect what the lesson actually contains, so a
                      theory lesson never advertises a circuit it does not have. */}
                  <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[11px] text-text-subtle">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      {lesson.estimatedMinutes} min
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="w-3 h-3" aria-hidden="true" />
                      {lesson.sections.length} sections
                    </span>
                    {lesson.visual && (
                      <span className="inline-flex items-center gap-1">
                        <Eye className="w-3 h-3" aria-hidden="true" />
                        Interactive
                      </span>
                    )}
                    {lesson.circuit && (
                      <span className="inline-flex items-center gap-1 text-accent">
                        <Cpu className="w-3 h-3" aria-hidden="true" />
                        Runnable circuit
                      </span>
                    )}
                    {lesson.code && (
                      <span className="inline-flex items-center gap-1">
                        <Code2 className="w-3 h-3" aria-hidden="true" />
                        Code
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ol>

      <p className="mt-8 text-[13px] text-text-subtle">
        More lessons are being written. Only completed lessons appear here — nothing is listed
        until its content, visuals and verified circuits are finished.
      </p>
    </div>
  );
}
