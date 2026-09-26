"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AlertCircle, ArrowUp, Check, Copy, Square, X } from "lucide-react";

import { Math as Tex } from "@/components/lesson/Math";
import { LESSONS } from "@/content";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

type Depth = "intuitive" | "applied" | "rigorous";

const DEPTHS: { value: Depth; label: string; hint: string }[] = [
  { value: "intuitive", label: "Intuitive", hint: "Analogies first, notation explained as it appears" },
  { value: "applied", label: "Applied", hint: "Dirac notation, matrices and Qiskit assumed" },
  { value: "rigorous", label: "Rigorous", hint: "Full derivations and named theorems" },
];

/**
 * The course assistant.
 *
 * Rebuilt around streaming and a much plainer surface. The previous version
 * opened by claiming mastery of 36 curriculum domains that no longer exist,
 * offered a grid of research-level prompts before the learner had asked
 * anything, and blocked on a non-streaming request. Suggestions now come from
 * the page the learner is actually on.
 */
export const QuantumCopilotDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const pathname = usePathname() ?? "";
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [depth, setDepth] = useState<Depth>("applied");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Escape closes, which is what people try first.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || streaming) return;

      setError(null);
      setInput("");

      const userMessage: Message = { id: `u-${Date.now()}`, role: "user", content: question };
      const assistantId = `a-${Date.now()}`;
      const history = [...messages, userMessage];

      setMessages([...history, { id: assistantId, role: "assistant", content: "" }]);
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/copilot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            messages: history.map(({ role, content }) => ({ role, content })),
            currentPath: pathname,
            level: depth,
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? `Request failed (${response.status}).`);
        }
        if (!response.body) throw new Error("The response contained no data.");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          // Update in place so the answer appears as it is generated.
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantId ? { ...message, content: accumulated } : message,
            ),
          );
        }

        if (!accumulated.trim()) {
          setMessages((current) => current.filter((message) => message.id !== assistantId));
          setError("The model returned an empty response. Try rephrasing.");
        }
      } catch (caught) {
        if ((caught as Error).name !== "AbortError") {
          setMessages((current) => current.filter((message) => message.id !== assistantId));
          setError(caught instanceof Error ? caught.message : "Something went wrong.");
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [depth, messages, pathname, streaming],
  );

  const stop = () => abortRef.current?.abort();

  const copy = (message: Message) => {
    void navigator.clipboard.writeText(message.content);
    setCopied(message.id);
    setTimeout(() => setCopied(null), 1500);
  };

  if (!isOpen) return null;

  const currentLesson = LESSONS.find((lesson) => pathname.endsWith(lesson.slug));
  const suggestions = currentLesson
    ? [
        `Explain ${currentLesson.title.toLowerCase()} more simply`,
        currentLesson.objectives[0],
        "What do people usually get wrong here?",
      ]
    : [
        "What makes a quantum computer different from a fast classical one?",
        "Why do amplitudes need to be complex numbers?",
        "Where should I start?",
      ];

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-canvas/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Course assistant"
        className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[440px] bg-surface
                   border-l border-border flex flex-col shadow-raised"
      >
        <header className="flex items-center justify-between gap-2 px-4 h-14 border-b border-border shrink-0">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-text">Assistant</h2>
            <p className="text-[11px] text-text-subtle truncate">
              {currentLesson ? currentLesson.title : "Grounded in this course"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close the assistant"
            className="p-1.5 rounded-md text-text-subtle hover:text-text hover:bg-surface-raised transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </header>

        <div className="px-4 py-2 border-b border-border shrink-0">
          <div className="flex gap-1" role="radiogroup" aria-label="Explanation depth">
            {DEPTHS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={depth === option.value}
                onClick={() => setDepth(option.value)}
                title={option.hint}
                className={`flex-1 px-2 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                  depth === option.value
                    ? "bg-accent-soft border-accent-border text-accent-text"
                    : "bg-surface border-border text-text-subtle hover:text-text"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-text-subtle mt-1.5">
            {DEPTHS.find((option) => option.value === depth)?.hint}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div>
              <p className="text-[13px] leading-6 text-text-muted mb-3">
                Ask about anything in the course. I can be wrong — when a question has a
                numerical answer, run the circuit and trust that instead.
              </p>
              <div className="space-y-1.5">
                {suggestions.filter(Boolean).map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void send(suggestion)}
                    className="w-full text-left px-3 py-2 rounded-lg border border-border
                               bg-surface-raised text-[12px] leading-5 text-text-muted
                               hover:border-accent-border hover:text-text transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={message.role === "user" ? "flex justify-end" : ""}>
              {message.role === "user" ? (
                <p className="max-w-[85%] px-3 py-2 rounded-xl rounded-br-sm bg-accent
                              text-text-inverse text-[13px] leading-6">
                  {message.content}
                </p>
              ) : (
                <div className="group">
                  <AssistantMessage content={message.content} />
                  {message.content && !streaming && (
                    <button
                      type="button"
                      onClick={() => copy(message)}
                      className="mt-1 inline-flex items-center gap-1 text-[10px] text-text-subtle
                                 hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copied === message.id ? (
                        <><Check className="w-3 h-3" aria-hidden="true" /> Copied</>
                      ) : (
                        <><Copy className="w-3 h-3" aria-hidden="true" /> Copy</>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-danger-soft border border-danger-border">
              <AlertCircle className="w-4 h-4 mt-0.5 text-danger shrink-0" aria-hidden="true" />
              <p className="text-[12px] leading-5 text-text-muted">{error}</p>
            </div>
          )}

          <div ref={endRef} />
        </div>

        <footer className="p-3 border-t border-border shrink-0">
          <form
            onSubmit={(event) => { event.preventDefault(); void send(input); }}
            className="flex items-end gap-2"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                // Enter sends; Shift+Enter inserts a newline, as people expect.
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send(input);
                }
              }}
              rows={1}
              placeholder="Ask a question…"
              aria-label="Your question"
              className="flex-1 resize-none max-h-32 px-3 py-2 rounded-lg bg-surface-raised
                         border border-border text-[13px] text-text placeholder:text-text-subtle
                         focus:border-accent outline-none transition-colors"
            />
            {streaming ? (
              <button
                type="button"
                onClick={stop}
                aria-label="Stop generating"
                className="p-2 rounded-lg bg-surface-raised border border-border text-text-muted
                           hover:text-danger transition-colors"
              >
                <Square className="w-4 h-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                aria-label="Send"
                className="p-2 rounded-lg bg-accent text-text-inverse hover:bg-accent-hover
                           disabled:opacity-40 transition-colors"
              >
                <ArrowUp className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </form>
        </footer>
      </aside>
    </>
  );
};

/**
 * Renders an assistant message, turning fenced code blocks and $math$ into
 * real elements rather than leaving the markup visible.
 */
const AssistantMessage: React.FC<{ content: string }> = ({ content }) => {
  if (!content) {
    return (
      <p className="text-[13px] text-text-subtle" aria-live="polite">
        <span className="inline-block w-1.5 h-3.5 bg-accent animate-pulse align-middle" />
      </p>
    );
  }

  const segments = content.split(/```(\w*)\n?([\s\S]*?)```/g);

  return (
    <div className="text-[13px] leading-6 text-text-muted space-y-2">
      {segments.map((segment, index) => {
        // The split yields [text, language, code, text, language, code, …].
        if (index % 3 === 2) {
          return (
            <pre key={index} className="p-3 rounded-lg bg-surface-sunken border border-border
                                        overflow-x-auto text-[11px] font-mono leading-5 text-text">
              {segment}
            </pre>
          );
        }
        if (index % 3 === 1) return null;
        return segment ? <Paragraphs key={index} text={segment} /> : null;
      })}
    </div>
  );
};

const Paragraphs: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text
      .split(/\n{2,}/)
      .filter(Boolean)
      .map((paragraph, index) => {
        // A markdown horizontal rule on its own line, e.g. "---" or "***".
        if (/^(-{3,}|\*{3,})$/.test(paragraph.trim())) {
          return <hr key={index} className="border-border my-2" />;
        }
        return <p key={index}>{renderInline(paragraph)}</p>;
      })}
  </>
);

/**
 * Handles $math$/$$math$$, the \(...\)/\[...\] LaTeX delimiters the model
 * uses just as often despite the system prompt asking for $-delimited math,
 * plus **bold** and `code` inside assistant prose. \boxed{...} needs no
 * special case — KaTeX renders it natively as long as it's inside a math
 * span, which all four delimiter styles now produce.
 */
function renderInline(text: string): React.ReactNode[] {
  const pattern =
    /(\$\$[\s\S]+?\$\$)|(\\\[[\s\S]+?\\\])|(\$[^$\n]+\$)|(\\\([\s\S]+?\\\))|(\*\*[^*]+\*\*)|(`[^`]+`)/g;
  const nodes: React.ReactNode[] = [];
  let last = 0;

  for (const match of text.matchAll(pattern)) {
    const at = match.index ?? 0;
    if (at > last) nodes.push(text.slice(last, at));

    const token = match[0];
    if (token.startsWith("$$")) {
      nodes.push(<Tex key={at} latex={token.slice(2, -2)} display />);
    } else if (token.startsWith("\\[")) {
      nodes.push(<Tex key={at} latex={token.slice(2, -2)} display />);
    } else if (token.startsWith("$")) {
      nodes.push(<Tex key={at} latex={token.slice(1, -1)} />);
    } else if (token.startsWith("\\(")) {
      nodes.push(<Tex key={at} latex={token.slice(2, -2)} />);
    } else if (token.startsWith("**")) {
      nodes.push(
        <strong key={at} className="font-semibold text-text">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      nodes.push(
        <code
          key={at}
          className="font-mono text-[0.9em] px-1 py-0.5 rounded bg-surface-raised border border-border text-text"
        >
          {token.slice(1, -1)}
        </code>,
      );
    }
    last = at + token.length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}
