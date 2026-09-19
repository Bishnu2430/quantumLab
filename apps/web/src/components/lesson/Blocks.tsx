"use client";

import React, { useState } from "react";
import { AlertTriangle, ChevronRight, Lightbulb, ScrollText, XCircle } from "lucide-react";

import type {
  Block,
  CalloutBlock,
  ComparisonBlock,
  DerivationBlock,
  EquationBlock,
  MisconceptionBlock,
  ProseBlock,
} from "@/content/types";
import { Math, RichText } from "./Math";

export const BlockRenderer: React.FC<{ block: Block }> = ({ block }) => {
  switch (block.kind) {
    case "prose":
      return <Prose block={block} />;
    case "equation":
      return <Equation block={block} />;
    case "derivation":
      return <Derivation block={block} />;
    case "comparison":
      return <Comparison block={block} />;
    case "callout":
      return <Callout block={block} />;
    case "misconception":
      return <Misconception block={block} />;
  }
};

const Prose: React.FC<{ block: ProseBlock }> = ({ block }) => (
  <p className="lesson-prose max-w-prose">
    <RichText text={block.text} />
  </p>
);

/**
 * An equation, its caption, and an optional symbol legend.
 *
 * The caption is required by the content schema: an equation shown without an
 * explanation of what it says is decoration.
 */
const Equation: React.FC<{ block: EquationBlock }> = ({ block }) => (
  <figure className="my-5">
    <div className="panel px-5 py-4 overflow-x-auto">
      <Math latex={block.latex} display />
    </div>
    <figcaption className="mt-2 text-[13px] leading-6 text-text-subtle max-w-prose">
      {block.caption}
    </figcaption>
    {block.where && block.where.length > 0 && (
      <dl className="mt-3 grid gap-x-4 gap-y-1.5 sm:grid-cols-[auto_1fr] text-[13px]">
        {block.where.map((entry) => (
          <React.Fragment key={entry.symbol}>
            <dt className="text-text font-medium whitespace-nowrap">
              <Math latex={entry.symbol} />
            </dt>
            <dd className="text-text-subtle sm:pl-2 mb-1 sm:mb-0">{entry.meaning}</dd>
          </React.Fragment>
        ))}
      </dl>
    )}
  </figure>
);

/**
 * A derivation, shown as numbered steps.
 *
 * Every step carries an explanation of *why* the step is licensed, which the
 * content tests enforce. Steps are collapsible so a reader who follows the
 * algebra can skip the prose without losing their place.
 */
const Derivation: React.FC<{ block: DerivationBlock }> = ({ block }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <section className="my-6 panel overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="w-full flex items-center gap-2.5 px-4 py-3 bg-surface-raised border-b border-border text-left hover:bg-surface-sunken transition-colors"
      >
        <ScrollText className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
        <span className="text-sm font-semibold text-text flex-1">{block.title}</span>
        <ChevronRight
          className={`w-4 h-4 text-text-subtle transition-transform ${expanded ? "rotate-90" : ""}`}
          aria-hidden="true"
        />
      </button>

      {expanded && (
        <div className="px-4 py-4">
          <p className="text-[13px] leading-6 text-text-subtle mb-4 pb-3 border-b border-border">
            <span className="font-semibold text-text-muted">Starting point. </span>
            <RichText text={block.premise} />
          </p>

          <ol className="space-y-4">
            {block.steps.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="shrink-0 w-6 h-6 rounded-full bg-accent-soft border border-accent-border text-accent-text text-[11px] font-mono font-bold flex items-center justify-center mt-0.5"
                >
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text mb-1.5">{step.title}</p>
                  {step.latex && (
                    <div className="my-2 px-3 py-2.5 rounded-lg bg-surface-sunken border border-border overflow-x-auto">
                      <Math latex={step.latex} display />
                    </div>
                  )}
                  <p className="text-[13px] leading-6 text-text-subtle">
                    <RichText text={step.explanation} />
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-4 pt-3 border-t border-border text-[13px] leading-6 text-text-muted">
            <span className="font-semibold text-text">Conclusion. </span>
            <RichText text={block.conclusion} />
          </p>
        </div>
      )}
    </section>
  );
};

const Comparison: React.FC<{ block: ComparisonBlock }> = ({ block }) => (
  <figure className="my-6">
    <figcaption className="text-sm font-semibold text-text mb-2.5">{block.title}</figcaption>
    <div className="panel overflow-x-auto">
      <table className="w-full text-[13px] border-collapse">
        <thead>
          <tr className="bg-surface-raised">
            <th scope="col" className="text-left font-semibold text-text-muted px-4 py-2.5 border-b border-border w-[22%]">
              <span className="sr-only">Aspect</span>
            </th>
            {block.columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="text-left font-semibold text-text px-4 py-2.5 border-b border-border"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row) => (
            <tr key={row.aspect} className="border-b border-border last:border-0">
              <th scope="row" className="text-left font-medium text-text-muted px-4 py-3 align-top">
                <RichText text={row.aspect} />
              </th>
              <td className="px-4 py-3 align-top text-text-subtle leading-6">
                <RichText text={row.left} />
              </td>
              <td className="px-4 py-3 align-top text-text-subtle leading-6">
                <RichText text={row.right} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </figure>
);

const CALLOUT_STYLES = {
  insight: {
    Icon: Lightbulb,
    wrapper: "bg-accent-soft border-accent-border",
    icon: "text-accent",
    title: "text-accent-text",
  },
  warning: {
    Icon: AlertTriangle,
    wrapper: "bg-warning-soft border-warning-border",
    icon: "text-warning",
    title: "text-warning",
  },
  history: {
    Icon: ScrollText,
    wrapper: "bg-surface-raised border-border",
    icon: "text-text-subtle",
    title: "text-text",
  },
} as const;

const Callout: React.FC<{ block: CalloutBlock }> = ({ block }) => {
  const style = CALLOUT_STYLES[block.tone];
  const { Icon } = style;

  return (
    <aside className={`my-5 rounded-xl border px-4 py-3.5 ${style.wrapper}`}>
      <div className="flex items-start gap-2.5">
        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${style.icon}`} aria-hidden="true" />
        <div className="min-w-0">
          <p className={`text-sm font-semibold mb-1 ${style.title}`}>{block.title}</p>
          <p className="text-[13px] leading-6 text-text-muted">
            <RichText text={block.text} />
          </p>
        </div>
      </div>
    </aside>
  );
};

/**
 * A named misconception paired with its correction.
 *
 * The claim is shown as something a learner might genuinely believe, then
 * struck through visually by the correction beneath it — stating the wrong
 * idea plainly is what makes the correction land.
 */
const Misconception: React.FC<{ block: MisconceptionBlock }> = ({ block }) => (
  <aside className="my-5 rounded-xl border border-border overflow-hidden">
    <div className="flex items-start gap-2.5 bg-danger-soft border-b border-danger-border px-4 py-3">
      <XCircle className="w-4 h-4 mt-0.5 shrink-0 text-danger" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-danger mb-1">
          Common misconception
        </p>
        <p className="text-[13px] leading-6 text-text-muted italic">
          <RichText text={block.claim} />
        </p>
      </div>
    </div>
    <div className="bg-surface px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-success mb-1">
        What is actually true
      </p>
      <p className="text-[13px] leading-6 text-text-muted">
        <RichText text={block.correction} />
      </p>
    </div>
  </aside>
);
