"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Clock } from "lucide-react";

import type { Lesson } from "@/content/types";
import { BlockRenderer } from "./Blocks";
import { CodeRunner } from "@/components/lab/CodeRunner";
import { LessonCircuitPanel } from "./LessonCircuitPanel";
import { VisualRenderer } from "@/components/visuals/VisualRenderer";

interface Props {
  lesson: Lesson;
  previous?: Lesson;
  next?: Lesson;
  prerequisites: Lesson[];
}

/**
 * Renders one lesson.
 *
 * The section list adapts to what the lesson actually contains: a theory-only
 * lesson shows no circuit heading and no run step, rather than an empty panel
 * where one would be.
 */
export const LessonView: React.FC<Props> = ({ lesson, previous, next, prerequisites }) => {
  const contents = [
    ...lesson.sections.map((section) => ({ id: section.id, title: section.title })),
    ...(lesson.visual ? [{ id: "visual", title: lesson.visual.title }] : []),
    ...(lesson.circuit ? [{ id: "circuit", title: lesson.circuit.title }] : []),
    ...(lesson.code ? [{ id: "code", title: lesson.code.title }] : []),
    { id: "takeaways", title: "Key takeaways" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <nav aria-label="Breadcrumb" className="mb-4">
        <Link href="/learn" className="inline-flex items-center gap-1.5 text-xs text-text-subtle hover:text-accent transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          Curriculum
        </Link>
      </nav>

      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wide bg-accent-soft text-accent-text border border-accent-border">
            Lesson {lesson.order}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-medium capitalize bg-surface-raised text-text-muted border border-border">
            {lesson.difficulty}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-text-subtle">
            <Clock className="w-3 h-3" aria-hidden="true" />
            {lesson.estimatedMinutes} min
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">{lesson.title}</h1>
        <p className="mt-1.5 text-base text-text-muted">{lesson.subtitle}</p>
        <p className="mt-3 text-[15px] leading-7 text-text-muted max-w-prose">{lesson.summary}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-10">
        <main className="min-w-0 order-2 lg:order-1">
          {prerequisites.length > 0 && (
            <section className="mb-6 panel p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-text-subtle mb-2">
                Read these first
              </h2>
              <ul className="flex flex-wrap gap-2">
                {prerequisites.map((prerequisite) => (
                  <li key={prerequisite.slug}>
                    <Link
                      href={`/learn/${prerequisite.slug}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-surface-raised text-xs text-text-muted hover:text-accent hover:border-accent-border transition-colors"
                    >
                      <BookOpen className="w-3 h-3" aria-hidden="true" />
                      {prerequisite.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mb-8 rounded-xl border border-accent-border bg-accent-soft p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-accent-text mb-2">
              By the end of this lesson you will be able to
            </h2>
            <ul className="space-y-1.5">
              {lesson.objectives.map((objective) => (
                <li key={objective} className="flex items-start gap-2 text-[13px] leading-6 text-text-muted">
                  <CheckCircle2 className="w-3.5 h-3.5 mt-1 shrink-0 text-accent" aria-hidden="true" />
                  {objective}
                </li>
              ))}
            </ul>
          </section>

          {lesson.sections.map((section) => (
            <section key={section.id} id={section.id} className="mb-10 scroll-mt-20">
              <h2 className="text-lg font-semibold text-text mb-3 pb-2 border-b border-border">
                {section.title}
              </h2>
              <div className="space-y-4">
                {section.blocks.map((block, index) => (
                  <BlockRenderer key={index} block={block} />
                ))}
              </div>
            </section>
          ))}

          {lesson.visual && (
            <section id="visual" className="mb-10 scroll-mt-20">
              <h2 className="text-lg font-semibold text-text mb-1.5">{lesson.visual.title}</h2>
              <p className="text-[13px] leading-6 text-text-subtle mb-3 max-w-prose">
                {lesson.visual.caption}
              </p>
              <VisualRenderer visual={lesson.visual} />
            </section>
          )}

          {lesson.circuit && (
            <section id="circuit" className="mb-10 scroll-mt-20">
              <h2 className="text-lg font-semibold text-text mb-3">Run the circuit</h2>
              <LessonCircuitPanel circuit={lesson.circuit} />
            </section>
          )}

          {lesson.code && (
            <section id="code" className="mb-10 scroll-mt-20">
              <h2 className="text-lg font-semibold text-text mb-1.5">{lesson.code.title}</h2>
              <p className="text-[13px] leading-6 text-text-subtle mb-3 max-w-prose">
                {lesson.code.description}
              </p>
              {/* Runnable, not a listing. Learners send only the lesson slug
                  and the server executes its own copy of this snippet. */}
              <CodeRunner code={lesson.code.code} lessonSlug={lesson.slug} />
            </section>
          )}

          <section id="takeaways" className="mb-10 scroll-mt-20">
            <h2 className="text-lg font-semibold text-text mb-3 pb-2 border-b border-border">
              Key takeaways
            </h2>
            <ul className="space-y-2">
              {lesson.keyTakeaways.map((takeaway) => (
                <li key={takeaway} className="flex items-start gap-2.5 text-[14px] leading-6 text-text-muted">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0" aria-hidden="true" />
                  {takeaway}
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-text-subtle mb-2">
              References
            </h2>
            <ul className="space-y-1">
              {lesson.references.map((reference) => (
                <li key={reference.source} className="text-[12px] leading-6 text-text-subtle">
                  {reference.url ? (
                    <a href={reference.url} target="_blank" rel="noopener noreferrer"
                       className="hover:text-accent transition-colors">
                      {reference.source}
                    </a>
                  ) : (
                    reference.source
                  )}
                  {reference.locator && <span className="text-text-subtle"> — {reference.locator}</span>}
                </li>
              ))}
            </ul>
          </section>

          <nav className="flex items-stretch gap-3 pt-6 border-t border-border">
            {previous ? (
              <Link href={`/learn/${previous.slug}`}
                    className="flex-1 panel p-3 hover:border-accent-border transition-colors group">
                <span className="flex items-center gap-1 text-[11px] text-text-subtle mb-0.5">
                  <ArrowLeft className="w-3 h-3" aria-hidden="true" /> Previous
                </span>
                <span className="text-sm font-medium text-text group-hover:text-accent transition-colors">
                  {previous.title}
                </span>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
            {next && (
              <Link href={`/learn/${next.slug}`}
                    className="flex-1 panel p-3 text-right hover:border-accent-border transition-colors group">
                <span className="flex items-center justify-end gap-1 text-[11px] text-text-subtle mb-0.5">
                  Next <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </span>
                <span className="text-sm font-medium text-text group-hover:text-accent transition-colors">
                  {next.title}
                </span>
              </Link>
            )}
          </nav>
        </main>

        <aside className="order-1 lg:order-2">
          <nav aria-label="On this page" className="lg:sticky lg:top-20">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-subtle mb-2">
              On this page
            </p>
            <ul className="space-y-0.5 border-l border-border">
              {contents.map((entry) => (
                <li key={entry.id}>
                  <a href={`#${entry.id}`}
                     className="block pl-3 py-1 -ml-px border-l border-transparent text-[12px] leading-5 text-text-subtle hover:text-accent hover:border-accent transition-colors">
                    {entry.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </div>
  );
};
