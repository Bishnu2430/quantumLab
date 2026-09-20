"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Loader2, Play, ShieldAlert, ShieldCheck, Terminal } from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import {
  type ExecutionResult,
  ExecutionError,
  type RunnerStatus,
  getRunnerStatus,
  runCode,
  runLessonCode,
} from "@/lib/api/execution";

interface Props {
  /** Starting source. Editable only when `editable` is true. */
  code: string;
  /** When set, the server runs its own copy of this lesson's code. */
  lessonSlug?: string;
  /** Researchers may edit and submit; learners run the shipped snippet. */
  editable?: boolean;
}

/**
 * Editor and output panel for sandboxed Python.
 *
 * Two execution paths, matching the role model: with `lessonSlug` the client
 * sends only that slug and the server supplies the code, so nothing a learner
 * types can reach the interpreter. With `editable`, the source is submitted
 * and the API enforces the researcher role.
 */
export const CodeRunner: React.FC<Props> = ({ code, lessonSlug, editable = false }) => {
  const [source, setSource] = useState(code);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [runner, setRunner] = useState<RunnerStatus | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<{ message: string; requiredRole?: string } | null>(null);

  const { user, loading: authLoading } = useAuth();

  useEffect(() => setSource(code), [code]);

  // Only ask about the sandbox once there is a session. Querying it while
  // signed out produced a guaranteed 401 on every lesson page with code.
  useEffect(() => {
    if (!user) {
      setRunner(null);
      return;
    }
    void getRunnerStatus().then(setRunner);
  }, [user]);

  const run = useCallback(async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const response =
        lessonSlug && !editable ? await runLessonCode(lessonSlug) : await runCode(source);
      setResult(response);
    } catch (caught) {
      if (caught instanceof ExecutionError) {
        setError({ message: caught.message, requiredRole: caught.requiredRole });
      } else {
        setError({
          message:
            "Could not reach the execution service. Start the API with ./scripts/qlab.sh dev.",
        });
      }
    } finally {
      setRunning(false);
    }
  }, [editable, lessonSlug, source]);

  const lineCount = source.split("\n").length;

  return (
    <div className="panel overflow-hidden">
      <header className="flex items-center justify-between gap-2 px-3 py-2 bg-surface-raised border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <Terminal className="w-3.5 h-3.5 text-text-subtle shrink-0" aria-hidden="true" />
          <span className="text-[11px] font-mono text-text-subtle">
            Python · Qiskit {editable ? "· editable" : "· read-only"}
          </span>
        </div>

        {/* Whether the code is genuinely sandboxed is stated, never implied. */}
        {runner && (
          <span
            title={runner.message}
            className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${
              runner.isolated
                ? "bg-success-soft text-success border-success-border"
                : "bg-warning-soft text-warning border-warning-border"
            }`}
          >
            {runner.isolated ? (
              <ShieldCheck className="w-3 h-3" aria-hidden="true" />
            ) : (
              <ShieldAlert className="w-3 h-3" aria-hidden="true" />
            )}
            {runner.isolated ? "Sandboxed" : "Not sandboxed"}
          </span>
        )}
      </header>

      {editable ? (
        <textarea
          value={source}
          onChange={(event) => setSource(event.target.value)}
          spellCheck={false}
          rows={Math.min(Math.max(lineCount + 1, 8), 28)}
          aria-label="Python source"
          className="w-full px-4 py-3 bg-surface font-mono text-[12px] leading-6 text-text-muted
                     resize-y focus:outline-none focus:ring-0 border-0"
        />
      ) : (
        <pre className="px-4 py-3 overflow-x-auto text-[12px] font-mono leading-6 text-text-muted">
          {source}
        </pre>
      )}

      <div className="flex items-center gap-2 px-3 py-2 border-t border-border bg-surface-raised">
        {!user && !authLoading ? (
          <a
            href={`/signin?next=${encodeURIComponent(typeof window === "undefined" ? "/" : window.location.pathname)}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border
                       bg-surface text-xs font-semibold text-text hover:border-accent-border transition-colors"
          >
            Sign in to run this
          </a>
        ) : (
        <button
          type="button"
          onClick={() => void run()}
          disabled={running || authLoading || runner?.available === false}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent
                     text-text-inverse text-xs font-semibold hover:bg-accent-hover
                     disabled:opacity-60 transition-colors"
        >
          {running ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Play className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          {running ? "Running" : "Run"}
        </button>
        )}

        {!user && !authLoading && (
          <span className="text-[11px] text-text-subtle">
            Reading is open to everyone; running code needs an account.
          </span>
        )}

        {result && (
          <span className="text-[11px] font-mono text-text-subtle">
            {result.status} · {result.durationMs} ms · {result.runner}
          </span>
        )}
        {runner?.available === false && (
          <span className="text-[11px] text-warning">{runner.message}</span>
        )}
      </div>

      {error && (
        <div className="px-3 py-2.5 bg-danger-soft border-t border-danger-border">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 text-danger shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[12px] text-text-muted">{error.message}</p>
              {error.requiredRole && (
                <p className="text-[11px] text-text-subtle mt-1">
                  An administrator can grant the {error.requiredRole} role.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="border-t border-border">
          {result.warnings.map((warning) => (
            <p key={warning} className="px-3 py-2 text-[11px] text-warning bg-warning-soft border-b border-warning-border">
              {warning}
            </p>
          ))}

          {result.stdout && (
            <div className="px-4 py-3">
              <p className="text-[10px] uppercase tracking-wide text-text-subtle mb-1.5">Output</p>
              <pre className="overflow-x-auto text-[12px] font-mono leading-6 text-text whitespace-pre-wrap">
                {result.stdout}
              </pre>
            </div>
          )}

          {result.stderr && (
            <div className="px-4 py-3 border-t border-border">
              <p className="text-[10px] uppercase tracking-wide text-danger mb-1.5">
                {result.status === "timeout" ? "Stopped" : "Error"}
              </p>
              <pre className="overflow-x-auto text-[12px] font-mono leading-6 text-danger whitespace-pre-wrap">
                {result.stderr}
              </pre>
            </div>
          )}

          {!result.stdout && !result.stderr && (
            <p className="px-4 py-3 text-[12px] text-text-subtle">
              Ran successfully with no output.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
