"use client";

import React, { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathProps {
  latex: string;
  display?: boolean;
  className?: string;
}

/**
 * Renders LaTeX with KaTeX.
 *
 * KaTeX is synchronous and throws on malformed input, so rendering happens in
 * a memo with `throwOnError: false` — a broken expression shows as highlighted
 * source rather than taking down the page. The curriculum test suite is what
 * catches bad LaTeX before it ships; this is the runtime safety net.
 */
export const Math: React.FC<MathProps> = ({ latex, display = false, className = "" }) => {
  const html = useMemo(
    () =>
      katex.renderToString(latex, {
        displayMode: display,
        throwOnError: false,
        errorColor: "rgb(var(--color-danger))",
        strict: false,
        trust: false,
        macros: {
          "\\ket": "\\left|#1\\right\\rangle",
          "\\bra": "\\left\\langle#1\\right|",
          "\\braket": "\\left\\langle#1\\middle|#2\\right\\rangle",
        },
      }),
    [latex, display],
  );

  return (
    <span
      className={className}
      // KaTeX output is generated from author-controlled lesson content with
      // trust disabled, so no \href or \includegraphics can be injected.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

/**
 * Renders a string that mixes prose with `$inline math$`.
 *
 * Splitting on single `$` is adequate here because lesson prose is authored,
 * not user-supplied, and currency amounts do not appear in it.
 */
export const RichText: React.FC<{ text: string; className?: string }> = ({
  text,
  className = "",
}) => {
  const parts = useMemo(() => splitRichText(text), [text]);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        switch (part.kind) {
          case "math":
            return <Math key={index} latex={part.value} />;
          case "bold":
            return (
              <strong key={index} className="font-semibold text-text">
                {part.value}
              </strong>
            );
          case "italic":
            return (
              <em key={index} className="italic">
                {part.value}
              </em>
            );
          case "code":
            return (
              <code
                key={index}
                className="font-mono text-[0.9em] px-1.5 py-0.5 rounded bg-surface-raised border border-border text-text"
              >
                {part.value}
              </code>
            );
          default:
            return <React.Fragment key={index}>{part.value}</React.Fragment>;
        }
      })}
    </span>
  );
};

type Part = { kind: "text" | "math" | "bold" | "italic" | "code"; value: string };

/** Tokenises `$math$`, `**bold**`, `*italic*` and `` `code` `` out of prose. */
function splitRichText(text: string): Part[] {
  // Bold alternates first so `**x**` is never mistaken for two italic markers.
  const pattern = /(\$[^$]+\$)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(`[^`]+`)/g;
  const parts: Part[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push({ kind: "text", value: text.slice(lastIndex, index) });
    }
    const token = match[0];
    if (token.startsWith("$")) {
      parts.push({ kind: "math", value: token.slice(1, -1) });
    } else if (token.startsWith("**")) {
      parts.push({ kind: "bold", value: token.slice(2, -2) });
    } else if (token.startsWith("*")) {
      parts.push({ kind: "italic", value: token.slice(1, -1) });
    } else {
      parts.push({ kind: "code", value: token.slice(1, -1) });
    }
    lastIndex = index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push({ kind: "text", value: text.slice(lastIndex) });
  }
  return parts;
}
