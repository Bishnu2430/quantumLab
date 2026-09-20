import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Cpu, FlaskConical, GitBranch, ShieldCheck, Sigma } from "lucide-react";

import { LESSONS } from "@/content";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description: BRAND.description,
};

export default function HomePage() {
  const totalMinutes = LESSONS.reduce((sum, lesson) => sum + lesson.estimatedMinutes, 0);
  const withCircuits = LESSONS.filter((lesson) => lesson.circuit).length;
  const first = LESSONS[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <section className="py-14 sm:py-20 max-w-3xl">
        <p className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-soft
                      border border-accent-border text-[11px] font-medium text-accent-text mb-5">
          <Sigma className="w-3 h-3" aria-hidden="true" />
          Powered by IBM Qiskit Aer
        </p>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-text leading-[1.1]">
          Quantum computing,
          <br />
          <span className="text-accent">worked out and run.</span>
        </h1>

        <p className="mt-5 text-base sm:text-lg leading-8 text-text-muted">
          Most introductions either hand-wave the mathematics or bury it. This one derives
          each result step by step, then lets you run the circuit and watch the simulator
          agree — or not.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href={`/learn/${first?.slug ?? ""}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent
                       text-text-inverse text-sm font-semibold hover:bg-accent-hover transition-colors"
          >
            Start with lesson one
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <Link
            href="/lab"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border
                       bg-surface text-sm font-semibold text-text hover:border-accent-border transition-colors"
          >
            <FlaskConical className="w-4 h-4" aria-hidden="true" />
            Open the lab
          </Link>
        </div>

        <p className="mt-4 text-[13px] text-text-subtle">
          {LESSONS.length} lessons · {Math.round((totalMinutes / 60) * 10) / 10} hours ·{" "}
          {withCircuits} runnable circuits · free and open source
        </p>
      </section>

      {/* What makes this different, stated as verifiable facts rather than adjectives. */}
      <section className="pb-16 grid gap-4 sm:grid-cols-3">
        <Feature
          Icon={ShieldCheck}
          title="Nothing is made up"
          body="Every probability a lesson states is checked against Qiskit Aer in CI. If the simulator disagrees with the text, the build fails and the lesson does not ship."
        />
        <Feature
          Icon={Cpu}
          title="You run the physics"
          body="Circuits execute on a real simulator and Python runs in an isolated sandbox. The numbers on screen were computed while you watched, not written in advance."
        />
        <Feature
          Icon={GitBranch}
          title="Derivations, not assertions"
          body="Each step of every derivation says why it is licensed. Common misconceptions are named and corrected rather than quietly avoided."
        />
      </section>

      <section className="pb-20">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-semibold text-text">Start here</h2>
          <Link href="/learn" className="text-[13px] text-accent hover:text-accent-hover">
            All lessons →
          </Link>
        </div>

        <ol className="grid gap-3 sm:grid-cols-2">
          {LESSONS.slice(0, 4).map((lesson) => (
            <li key={lesson.slug}>
              <Link
                href={`/learn/${lesson.slug}`}
                className="block h-full panel p-4 hover:border-accent-border transition-colors group"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-[11px] text-text-subtle">
                    {String(lesson.order).padStart(2, "0")}
                  </span>
                  <h3 className="text-sm font-semibold text-text group-hover:text-accent transition-colors">
                    {lesson.title}
                  </h3>
                </div>
                <p className="text-[13px] leading-6 text-text-muted">{lesson.summary}</p>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

const Feature: React.FC<{
  Icon: typeof Cpu;
  title: string;
  body: string;
}> = ({ Icon, title, body }) => (
  <div className="panel p-4">
    <Icon className="w-4 h-4 text-accent mb-2.5" aria-hidden="true" />
    <h3 className="text-sm font-semibold text-text mb-1">{title}</h3>
    <p className="text-[13px] leading-6 text-text-muted">{body}</p>
  </div>
);
