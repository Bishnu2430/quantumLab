"use client";

import React, { useState } from "react";
import { Check, X } from "lucide-react";

import { Math } from "@/components/lesson/Math";

type Complex = [number, number];
type Matrix = [[Complex, Complex], [Complex, Complex]];

interface Props {
  operators?: string[];
  showAdjoint?: boolean;
  checks?: string[];
  applyTo?: string[];
}

const R = (re: number): Complex => [re, 0];
const I = (im: number): Complex => [0, im];
const S = 1 / globalThis.Math.SQRT2;

const OPERATORS: Record<string, { latex: string; matrix: Matrix; note: string }> = {
  I: { latex: "I", matrix: [[R(1), R(0)], [R(0), R(1)]], note: "Does nothing — the identity." },
  X: { latex: "X", matrix: [[R(0), R(1)], [R(1), R(0)]], note: "Bit flip: swaps |0⟩ and |1⟩." },
  Y: { latex: "Y", matrix: [[R(0), I(-1)], [I(1), R(0)]], note: "Bit and phase flip together." },
  Z: { latex: "Z", matrix: [[R(1), R(0)], [R(0), R(-1)]], note: "Phase flip: negates |1⟩ only." },
  H: { latex: "H", matrix: [[R(S), R(S)], [R(S), R(-S)]], note: "Both unitary and Hermitian — it is its own inverse." },
  S: { latex: "S", matrix: [[R(1), R(0)], [R(0), I(1)]], note: "Quarter turn about z. Unitary but not Hermitian." },
  T: { latex: "T", matrix: [[R(1), R(0)], [R(0), [S, S]]], note: "Eighth turn about z." },
  P0: { latex: "P_0 = |0\\rangle\\langle 0|", matrix: [[R(1), R(0)], [R(0), R(0)]], note: "Projector onto |0⟩. Hermitian and idempotent, not unitary." },
  P1: { latex: "P_1 = |1\\rangle\\langle 1|", matrix: [[R(0), R(0)], [R(0), R(1)]], note: "Projector onto |1⟩." },
};

/**
 * Operator inspector.
 *
 * Shows the matrix alongside the three properties that decide what it can be
 * used for — unitary means it is a legal gate, Hermitian means it is a legal
 * observable, idempotent means it is a projector. The checks are computed from
 * the matrix rather than asserted, so the badges cannot fall out of step.
 */
export const OperatorMatrixVisual: React.FC<Props> = ({
  operators = ["I", "X", "Y", "Z", "H", "S", "P0", "P1"],
  checks = ["unitarity", "hermiticity", "idempotence"],
}) => {
  const available = operators.filter((name) => name in OPERATORS);
  const [selected, setSelected] = useState(available[0] ?? "X");
  const operator = OPERATORS[selected];

  const unitary = isUnitary(operator.matrix);
  const hermitian = isHermitian(operator.matrix);
  const idempotent = isIdempotent(operator.matrix);

  return (
    <div className="panel p-4">
      <div className="flex flex-wrap gap-1.5 mb-4">
        {available.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setSelected(name)}
            aria-pressed={selected === name}
            className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold border transition-colors ${
              selected === name
                ? "bg-accent-soft border-accent-border text-accent-text"
                : "bg-surface border-border text-text-muted hover:bg-surface-raised hover:text-text"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-[auto_1fr] items-start">
        <div className="px-4 py-3 rounded-lg bg-surface-sunken border border-border">
          <Math latex={`${operator.latex} = ${toLatexMatrix(operator.matrix)}`} display />
        </div>

        <div className="space-y-2">
          {checks.includes("unitarity") && (
            <PropertyBadge ok={unitary} label="Unitary"
                           detail={unitary ? "U†U = I — a valid gate, and reversible" : "Not a gate: it would not preserve normalisation"} />
          )}
          {checks.includes("hermiticity") && (
            <PropertyBadge ok={hermitian} label="Hermitian"
                           detail={hermitian ? "A† = A — a valid observable with real eigenvalues" : "Not an observable"} />
          )}
          {checks.includes("idempotence") && (
            <PropertyBadge ok={idempotent} label="Idempotent"
                           detail={idempotent ? "P² = P — projecting twice is projecting once" : "Not a projector"} />
          )}
        </div>
      </div>

      <p className="mt-4 pt-3 border-t border-border text-[13px] leading-6 text-text-muted">
        {operator.note}
      </p>
    </div>
  );
};

const PropertyBadge: React.FC<{ ok: boolean; label: string; detail: string }> = ({
  ok, label, detail,
}) => (
  <div
    className={`flex items-start gap-2 px-3 py-2 rounded-lg border ${
      ok ? "bg-success-soft border-success-border" : "bg-surface-raised border-border"
    }`}
  >
    {ok ? (
      <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-success" aria-hidden="true" />
    ) : (
      <X className="w-3.5 h-3.5 mt-0.5 shrink-0 text-text-subtle" aria-hidden="true" />
    )}
    <div className="min-w-0">
      <p className={`text-xs font-semibold ${ok ? "text-success" : "text-text-subtle"}`}>{label}</p>
      <p className="text-[11px] leading-5 text-text-subtle">{detail}</p>
    </div>
  </div>
);

// --- complex matrix helpers ----------------------------------------------

const EPSILON = 1e-9;

const mul = (a: Complex, b: Complex): Complex => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
];
const conj = (a: Complex): Complex => [a[0], -a[1]];
const near = (a: Complex, b: Complex) =>
  globalThis.Math.abs(a[0] - b[0]) < EPSILON && globalThis.Math.abs(a[1] - b[1]) < EPSILON;

function dagger(m: Matrix): Matrix {
  return [
    [conj(m[0][0]), conj(m[1][0])],
    [conj(m[0][1]), conj(m[1][1])],
  ];
}

function multiply(a: Matrix, b: Matrix): Matrix {
  const cell = (r: number, c: number): Complex => {
    const first = mul(a[r][0], b[0][c]);
    const second = mul(a[r][1], b[1][c]);
    return [first[0] + second[0], first[1] + second[1]];
  };
  return [
    [cell(0, 0), cell(0, 1)],
    [cell(1, 0), cell(1, 1)],
  ];
}

const IDENTITY: Matrix = [[R(1), R(0)], [R(0), R(1)]];

const equal = (a: Matrix, b: Matrix) =>
  near(a[0][0], b[0][0]) && near(a[0][1], b[0][1]) &&
  near(a[1][0], b[1][0]) && near(a[1][1], b[1][1]);

const isUnitary = (m: Matrix) => equal(multiply(dagger(m), m), IDENTITY);
const isHermitian = (m: Matrix) => equal(dagger(m), m);
const isIdempotent = (m: Matrix) => equal(multiply(m, m), m);

function toLatexMatrix(m: Matrix): string {
  const cell = ([re, im]: Complex): string => {
    if (globalThis.Math.abs(im) < EPSILON) return trim(re);
    if (globalThis.Math.abs(re) < EPSILON) return `${im === 1 ? "" : im === -1 ? "-" : trim(im)}i`;
    return `${trim(re)}${im > 0 ? "+" : "-"}${trim(globalThis.Math.abs(im))}i`;
  };
  return `\\begin{bmatrix} ${cell(m[0][0])} & ${cell(m[0][1])} \\\\ ${cell(m[1][0])} & ${cell(m[1][1])} \\end{bmatrix}`;
}

function trim(value: number): string {
  if (globalThis.Math.abs(globalThis.Math.abs(value) - S) < 1e-6) {
    return value > 0 ? "\\tfrac{1}{\\sqrt{2}}" : "-\\tfrac{1}{\\sqrt{2}}";
  }
  return Number(value.toFixed(4)).toString();
}
