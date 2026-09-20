"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Check, RotateCcw } from "lucide-react";

import { LESSONS } from "@/content";

const STORAGE_KEY = "pbq-progress";

/**
 * Lesson progress.
 *
 * Reads real state rather than the hardcoded "Module 01–04 completed" list
 * this page previously showed for modules that no longer exist. Progress lives
 * in browser storage for now, which means it is per-device and honest about
 * that; moving it behind the accounts system is a later change.
 */
export default function ProgressPage() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setCompleted(new Set(JSON.parse(stored) as string[]));
    } catch {
      // Blocked or unavailable storage: start empty rather than failing.
    }
    setLoaded(true);
  }, []);

  const persist = (next: Set<string>) => {
    setCompleted(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch {
      // The toggle still applies for this session.
    }
  };

  const toggle = (slug: string) => {
    const next = new Set(completed);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    persist(next);
  };

  const done = LESSONS.filter((lesson) => completed.has(lesson.slug));
  const percent = LESSONS.length ? Math.round((done.length / LESSONS.length) * 100) : 0;
  const minutesDone = done.reduce((sum, lesson) => sum + lesson.estimatedMinutes, 0);
  const minutesLeft =
    LESSONS.reduce((sum, lesson) => sum + lesson.estimatedMinutes, 0) - minutesDone;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-text">Progress</h1>
        <p className="mt-1.5 text-[14px] text-text-muted">
          Mark a lesson complete once you can meet its objectives without rereading it.
        </p>
      </header>

      <section className="panel p-5 mb-6">
        <div className="flex items-end justify-between gap-4 mb-3">
          <div>
            <p className="text-3xl font-bold text-text">{percent}%</p>
            <p className="text-[13px] text-text-subtle mt-0.5">
              {done.length} of {LESSONS.length} lessons
            </p>
          </div>
          <div className="text-right text-[13px] text-text-subtle">
            <p>{minutesDone} min done</p>
            <p>{minutesLeft} min remaining</p>
          </div>
        </div>

        <div
          className="h-2 rounded-full bg-surface-sunken overflow-hidden"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Curriculum completion"
        >
          <div className="h-full bg-accent rounded-full transition-[width] duration-300"
               style={{ width: `${percent}%` }} />
        </div>

        {loaded && done.length > 0 && (
          <button
            type="button"
            onClick={() => persist(new Set())}
            className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-text-subtle hover:text-danger transition-colors"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
            Reset progress
          </button>
        )}
      </section>

      <ol className="space-y-2">
        {LESSONS.map((lesson) => {
          const isDone = completed.has(lesson.slug);
          return (
            <li key={lesson.slug} className="panel p-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggle(lesson.slug)}
                aria-pressed={isDone}
                aria-label={`Mark ${lesson.title} as ${isDone ? "not complete" : "complete"}`}
                className={`w-6 h-6 shrink-0 rounded-md border flex items-center justify-center transition-colors ${
                  isDone
                    ? "bg-success-soft border-success-border text-success"
                    : "bg-surface border-border text-transparent hover:border-accent-border"
                }`}
              >
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
              </button>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/learn/${lesson.slug}`}
                  className="text-[14px] font-medium text-text hover:text-accent transition-colors"
                >
                  {lesson.title}
                </Link>
                <p className="text-[11px] text-text-subtle mt-0.5">
                  {lesson.estimatedMinutes} min · {lesson.sections.length} sections
                  {lesson.circuit && " · runnable circuit"}
                </p>
              </div>

              <Link
                href={`/learn/${lesson.slug}`}
                className="p-1.5 rounded-md text-text-subtle hover:text-accent transition-colors shrink-0"
                aria-label={`Open ${lesson.title}`}
              >
                <BookOpen className="w-4 h-4" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ol>

      <p className="mt-6 text-[12px] text-text-subtle">
        Progress is stored in this browser only, so it will not follow you to another
        device. Account-backed progress comes with the accounts system.
      </p>
    </div>
  );
}
