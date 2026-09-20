"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AlertCircle, Cpu, Info, Loader2, Play } from "lucide-react";

import { CircuitBuilder } from "@/components/lab/CircuitBuilder";
import { CodeRunner } from "@/components/lab/CodeRunner";
import {
  type QuantumIR,
  type SimulationResult,
  generateQiskitPythonCode,
  runQuantumSimulation,
} from "@/lib/api/quantum";

const INITIAL: QuantumIR = {
  numQubits: 2,
  numClbits: 2,
  operations: [
    { id: "op-1", gate: "h", targets: [0] },
    { id: "op-2", gate: "cx", controls: [0], targets: [1] },
  ],
};

type Tab = "results" | "code";

/** Shot counts, each paired with what that number actually buys you. */
const SHOT_OPTIONS = [
  { value: 100, meaning: "100 shots: roughly ±5% on each probability — enough to see the shape, not the detail." },
  { value: 1024, meaning: "1024 shots: roughly ±1.6%. The common default, and a fair balance." },
  { value: 8192, meaning: "8192 shots: roughly ±0.6%. Slower, but the counts track the exact probabilities closely." },
] as const;

/**
 * The lab: build a circuit, simulate it, then run the generated code.
 *
 * Previously this existed twice — /simulator and /playground rendered the same
 * component, and the playground's code tab exported a hardcoded Bell pair
 * rather than whatever the user had built. Here the code is generated from the
 * live circuit, so what you run is what you see.
 */
export default function LabPage() {
  const [circuit, setCircuit] = useState<QuantumIR>(INITIAL);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [shots, setShots] = useState(1024);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("results");
  const [showShotHelp, setShowShotHelp] = useState(false);

  const simulate = useCallback(async () => {
    setRunning(true);
    setError(null);
    try {
      setResult(await runQuantumSimulation({ circuit, options: { shots, mode: "both" } }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Simulation failed.");
      setResult(null);
    } finally {
      setRunning(false);
    }
  }, [circuit, shots]);

  // Re-simulate whenever the circuit changes, so the results panel is never
  // showing output for a circuit that is no longer on screen.
  useEffect(() => {
    void simulate();
  }, [simulate]);

  const generatedCode = generateQiskitPythonCode(circuit, shots);
  const activeShots = SHOT_OPTIONS.find((option) => option.value === shots) ?? SHOT_OPTIONS[1];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <header className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-text">Lab</h1>
        <p className="mt-1.5 text-[14px] text-text-muted max-w-prose">
          Build a circuit, run it on Qiskit Aer, then run the equivalent Python in a
          sandbox. Everything here is computed — nothing is illustrative.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <section aria-label="Circuit editor">
          <CircuitBuilder circuit={circuit} onChange={setCircuit} />
        </section>

        <section aria-label="Results" className="space-y-3">
          <div className="panel p-3">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-1.5">
                <label htmlFor="shots" className="text-xs text-text">Shots</label>
                <select
                  id="shots"
                  value={shots}
                  onChange={(event) => setShots(Number(event.target.value))}
                  className="bg-surface-raised border border-border rounded px-2 py-1 text-[11px] font-mono text-text"
                >
                  {SHOT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.value}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowShotHelp((open) => !open)}
                  aria-expanded={showShotHelp}
                  aria-label="What do shots do?"
                  className={`p-0.5 rounded transition-colors ${
                    showShotHelp ? "text-accent" : "text-text-subtle hover:text-accent"
                  }`}
                >
                  <Info className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => void simulate()}
                disabled={running}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent
                           text-text-inverse text-xs font-semibold hover:bg-accent-hover
                           disabled:opacity-60 transition-colors"
              >
                {running ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Play className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                Simulate
              </button>
            </div>

            <p className="text-[11px] leading-4 text-text-subtle mb-2">
              {activeShots.meaning}
            </p>

            {showShotHelp && (
              <p className="text-[11px] leading-5 text-text-muted mb-3 p-2.5 rounded-lg bg-surface-sunken border border-border">
                A shot is one full run of the circuit followed by one measurement, which
                yields a single outcome. Probabilities are recovered by repeating and
                counting, so the measured counts only approach the exact probabilities as
                the shot count grows. The error shrinks like 1/&radic;N, meaning four times
                the shots halves the error &mdash; which is why the exact probabilities are
                shown alongside: the simulator can compute them directly, while real
                hardware can only ever sample.
              </p>
            )}

            <div className="flex gap-1 mb-3" role="tablist">
              {(["results", "code"] as Tab[]).map((value) => (
                <button
                  key={value}
                  role="tab"
                  aria-selected={tab === value}
                  onClick={() => setTab(value)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-colors ${
                    tab === value
                      ? "bg-accent-soft text-accent-text border border-accent-border"
                      : "text-text-muted hover:bg-surface-raised border border-transparent"
                  }`}
                >
                  {value === "code" ? "Run as code" : "Results"}
                </button>
              ))}
            </div>

            {error && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-danger-soft border border-danger-border mb-3">
                <AlertCircle className="w-4 h-4 mt-0.5 text-danger shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-danger">Simulation failed</p>
                  <p className="text-[11px] text-text-muted mt-0.5 break-words">{error}</p>
                </div>
              </div>
            )}

            {tab === "results" && result && (
              <div className="space-y-3">
                <p className="text-[11px] font-mono text-text-subtle flex items-center gap-1.5">
                  <Cpu className="w-3 h-3" aria-hidden="true" />
                  {result.backend} · depth {result.circuitDepth} · {result.durationMs} ms
                </p>

                <Distribution
                  title="Measured counts"
                  entries={Object.entries(result.counts ?? {}).map(([basis, count]) => ({
                    basis,
                    value: count / result.shots,
                    detail: String(count),
                  }))}
                />
                <Distribution
                  title="Exact probabilities"
                  entries={Object.entries(result.probabilities).map(([basis, probability]) => ({
                    basis,
                    value: probability,
                    detail: `${(probability * 100).toFixed(1)}%`,
                  }))}
                />

                {result.statevector && result.numQubits <= 3 && (
                  <div className="rounded-lg border border-border bg-surface-sunken p-3">
                    <p className="text-[10px] uppercase tracking-wide text-text-subtle mb-2">
                      Statevector amplitudes
                    </p>
                    <div className="space-y-1">
                      {result.statevector.map((amplitude) => (
                        <div key={amplitude.state} className="flex items-center justify-between gap-2 text-[11px] font-mono">
                          <span className="text-text-muted">|{amplitude.state}⟩</span>
                          <span className={amplitude.magnitude < 1e-9 ? "text-text-subtle" : "text-text"}>
                            {amplitude.real >= 0 ? "+" : ""}{amplitude.real.toFixed(4)}
                            {amplitude.imag >= 0 ? " + " : " − "}
                            {Math.abs(amplitude.imag).toFixed(4)}i
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "results" && !result && !error && (
              <p className="text-xs text-text-subtle py-4 text-center">Simulating…</p>
            )}
          </div>

          {tab === "code" && (
            <CodeRunner key={generatedCode} code={generatedCode} editable />
          )}
        </section>
      </div>
    </div>
  );
}

const Distribution: React.FC<{
  title: string;
  entries: { basis: string; value: number; detail: string }[];
}> = ({ title, entries }) => (
  <div className="rounded-lg border border-border bg-surface-sunken p-3">
    <p className="text-[10px] uppercase tracking-wide text-text-subtle mb-2">{title}</p>
    <div className="space-y-1.5">
      {entries.length === 0 && <p className="text-[11px] text-text-subtle">No outcomes.</p>}
      {entries
        .sort((a, b) => a.basis.localeCompare(b.basis))
        .map((entry) => (
          <div key={entry.basis} className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-text-muted w-12 shrink-0">
              |{entry.basis}⟩
            </span>
            <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
              <div className="h-full bg-viz-primary rounded-full transition-[width] duration-200"
                   style={{ width: `${entry.value * 100}%` }} />
            </div>
            <span className="text-[11px] font-mono text-text w-14 text-right shrink-0">
              {entry.detail}
            </span>
          </div>
        ))}
    </div>
  </div>
);
