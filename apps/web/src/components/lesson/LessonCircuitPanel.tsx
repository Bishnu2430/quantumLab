"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AlertCircle, Loader2, Play } from "lucide-react";

import type { LessonCircuit } from "@/content/types";
import {
  type SimulationResult,
  generateQiskitPythonCode,
  runQuantumSimulation,
} from "@/lib/api/quantum";

/**
 * The circuit that ships with a lesson: diagram, real simulation, results.
 *
 * Results come from the API rather than from the lesson's `expected` values —
 * those are the CI contract, not display data. Showing them here would mean
 * the panel could look correct while the simulator was broken or unreachable.
 */
export const LessonCircuitPanel: React.FC<{ circuit: LessonCircuit }> = ({ circuit }) => {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setStatus("running");
    setError(null);
    try {
      const response = await runQuantumSimulation({
        circuit: {
          numQubits: circuit.numQubits,
          numClbits: circuit.numClbits,
          operations: circuit.operations.map(({ note: _note, ...op }) => op),
        },
        options: { shots: 1024, mode: "both" },
      });
      setResult(response);
      setStatus("done");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Simulation failed.");
      setStatus("error");
    }
  }, [circuit]);

  useEffect(() => {
    void run();
  }, [run]);

  const selectedOp = circuit.operations.find((op) => op.id === selected);
  const qubits = Array.from({ length: circuit.numQubits }, (_, index) => index);

  return (
    <section className="panel overflow-hidden">
      <header className="px-4 py-3 bg-surface-raised border-b border-border">
        <h3 className="text-sm font-semibold text-text">{circuit.title}</h3>
        <p className="text-[13px] leading-6 text-text-subtle mt-0.5">{circuit.description}</p>
      </header>

      <div className="p-4 space-y-4">
        {/* Wire diagram. Each gate is a button so its explanation is one click
            away rather than crammed onto the wire. */}
        <div className="overflow-x-auto">
          <div className="min-w-max space-y-2">
            {qubits.map((qubit) => (
              <div key={qubit} className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-text-subtle w-7 shrink-0">
                  q{qubit}
                </span>
                <div className="relative flex items-center gap-2 h-9">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-border" aria-hidden="true" />
                  {circuit.operations.map((op) => {
                    const isTarget = op.targets.includes(qubit);
                    const isControl = op.controls?.includes(qubit);
                    if (!isTarget && !isControl) {
                      return <div key={op.id} className="w-9 h-9 shrink-0" aria-hidden="true" />;
                    }
                    return (
                      <button
                        key={op.id}
                        type="button"
                        onClick={() => setSelected(selected === op.id ? null : op.id)}
                        aria-pressed={selected === op.id}
                        title={op.note}
                        className={`relative w-9 h-9 shrink-0 gate-badge text-[11px] ${
                          selected === op.id
                            ? "bg-accent text-text-inverse border-accent"
                            : isControl
                              ? "bg-surface border-border-strong text-text-muted"
                              : "bg-accent-soft border-accent-border text-accent-text hover:bg-accent-border"
                        }`}
                      >
                        {isControl ? "●" : label(op.gate)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedOp && (
          <p className="text-[13px] leading-6 text-text-muted bg-accent-soft border border-accent-border rounded-lg px-3 py-2">
            <span className="font-mono font-semibold text-accent-text uppercase mr-1.5">
              {selectedOp.gate}
            </span>
            {selectedOp.note}
          </p>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void run()}
            disabled={status === "running"}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent text-text-inverse
                       text-xs font-semibold hover:bg-accent-hover disabled:opacity-60 transition-colors"
          >
            {status === "running" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Play className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            {status === "running" ? "Simulating" : "Run on Qiskit Aer"}
          </button>
          {result && (
            <span className="text-[11px] font-mono text-text-subtle">
              {result.shots} shots · depth {result.circuitDepth} · {result.durationMs} ms
            </span>
          )}
        </div>

        {status === "error" && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-danger-soft border border-danger-border">
            <AlertCircle className="w-4 h-4 mt-0.5 text-danger shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-danger">Could not reach the simulator</p>
              <p className="text-[11px] text-text-muted mt-0.5 break-words">{error}</p>
              <p className="text-[11px] text-text-subtle mt-1">
                Start the API with <code className="font-mono">./scripts/qlab.sh dev</code>.
              </p>
            </div>
          </div>
        )}

        {result && (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard title="Measured counts">
              {Object.entries(result.counts ?? {})
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([basis, count]) => (
                  <Bar key={basis} label={`|${basis}⟩`} value={count / result.shots}
                       detail={`${count}`} />
                ))}
            </ResultCard>
            <ResultCard title="Exact probabilities">
              {Object.entries(result.probabilities)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([basis, probability]) => (
                  <Bar key={basis} label={`|${basis}⟩`} value={probability}
                       detail={`${(probability * 100).toFixed(1)}%`} />
                ))}
            </ResultCard>
          </div>
        )}

        <details className="group">
          <summary className="text-xs font-medium text-accent cursor-pointer hover:text-accent-hover list-none">
            Show the equivalent Qiskit code
          </summary>
          <pre className="mt-2 p-3 rounded-lg bg-surface-sunken border border-border overflow-x-auto
                          text-[11px] font-mono leading-5 text-text-muted">
            {generateQiskitPythonCode(
              {
                numQubits: circuit.numQubits,
                numClbits: circuit.numClbits,
                operations: circuit.operations.map(({ note: _note, ...op }) => op),
              },
              1024,
            )}
          </pre>
        </details>
      </div>
    </section>
  );
};

const ResultCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="rounded-lg border border-border bg-surface-sunken p-3">
    <p className="text-[10px] uppercase tracking-wide text-text-subtle mb-2">{title}</p>
    <div className="space-y-1.5">{children}</div>
  </div>
);

const Bar: React.FC<{ label: string; value: number; detail: string }> = ({
  label, value, detail,
}) => (
  <div className="flex items-center gap-2">
    <span className="text-[11px] font-mono text-text-muted w-10 shrink-0">{label}</span>
    <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
      <div className="h-full bg-viz-primary rounded-full" style={{ width: `${value * 100}%` }} />
    </div>
    <span className="text-[11px] font-mono text-text w-12 text-right shrink-0">{detail}</span>
  </div>
);

function label(gate: string): string {
  if (gate === "measure") return "M";
  if (gate === "barrier") return "|";
  if (gate.startsWith("r")) return gate.toUpperCase();
  return gate.toUpperCase();
}
