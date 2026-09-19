"use client";

import React, { useState } from "react";

interface VectorSpec {
  id: string;
  label: string;
  re: number;
  im: number;
}

interface Props {
  vectors: VectorSpec[];
  showSum?: boolean;
  showMagnitudeSquared?: boolean;
}

const SCALE = 70;

/**
 * Complex amplitudes as vectors in the plane, with their sum.
 *
 * The phase of each amplitude is adjustable while its magnitude is held fixed,
 * which isolates the point: the individual probabilities never move, but the
 * magnitude of the sum sweeps between full reinforcement and total
 * cancellation. That is interference, with nothing else changing.
 */
export const ComplexPlaneVisual: React.FC<Props> = ({
  vectors: initial,
  showSum = true,
  showMagnitudeSquared = true,
}) => {
  const [phases, setPhases] = useState<number[]>(() => initial.map((v) => globalThis.Math.atan2(v.im, v.re)));

  const magnitudes = initial.map((v) => globalThis.Math.hypot(v.re, v.im));
  const vectors = initial.map((spec, index) => ({
    ...spec,
    re: magnitudes[index] * globalThis.Math.cos(phases[index]),
    im: magnitudes[index] * globalThis.Math.sin(phases[index]),
  }));

  const sum = vectors.reduce((acc, v) => ({ re: acc.re + v.re, im: acc.im + v.im }), { re: 0, im: 0 });
  const sumMagnitude = globalThis.Math.hypot(sum.re, sum.im);

  const colours = ["stroke-viz-primary", "stroke-viz-secondary", "stroke-viz-tertiary"];
  const fills = ["fill-viz-primary", "fill-viz-secondary", "fill-viz-tertiary"];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
      <div className="panel p-3">
        <svg viewBox="-110 -110 220 220" className="w-full h-auto" role="img"
             aria-label="Complex plane showing each amplitude and their sum">
          <circle cx="0" cy="0" r="70" className="fill-none stroke-viz-grid" strokeWidth="1" strokeDasharray="2 3" />
          <line x1="-100" y1="0" x2="100" y2="0" className="stroke-viz-axis" strokeWidth="1" />
          <line x1="0" y1="-100" x2="0" y2="100" className="stroke-viz-axis" strokeWidth="1" />

          {/* Axis labels sit at the ends of their own axis, clear of the vectors. */}
          <text x="103" y="4" className="fill-viz-label text-[9px] font-mono">Re</text>
          <text x="0" y="-103" textAnchor="middle" className="fill-viz-label text-[9px] font-mono">Im</text>

          {vectors.map((vector, index) => (
            <g key={vector.id}>
              <line
                x1="0" y1="0"
                x2={vector.re * SCALE} y2={-vector.im * SCALE}
                className={colours[index % colours.length]}
                strokeWidth="2" strokeLinecap="round"
              />
              <circle cx={vector.re * SCALE} cy={-vector.im * SCALE} r="3.5"
                      className={fills[index % fills.length]} />
              <text
                x={vector.re * SCALE} y={-vector.im * SCALE}
                dx={vector.re >= 0 ? 8 : -8} dy={vector.im >= 0 ? -6 : 12}
                textAnchor={vector.re >= 0 ? "start" : "end"}
                className={`${fills[index % fills.length]} text-[10px] font-mono font-semibold`}
              >
                {vector.label}
              </text>
            </g>
          ))}

          {showSum && (
            <g>
              <line x1="0" y1="0" x2={sum.re * SCALE} y2={-sum.im * SCALE}
                    className="stroke-viz-quaternary" strokeWidth="2.5" strokeDasharray="4 2" />
              {sumMagnitude > 0.02 && (
                <>
                  <circle cx={sum.re * SCALE} cy={-sum.im * SCALE} r="4" className="fill-viz-quaternary" />
                  <text x={sum.re * SCALE} y={-sum.im * SCALE}
                        dx={sum.re >= 0 ? 8 : -8} dy={sum.im >= 0 ? 14 : -8}
                        textAnchor={sum.re >= 0 ? "start" : "end"}
                        className="fill-viz-quaternary text-[10px] font-mono font-semibold">
                    sum
                  </text>
                </>
              )}
            </g>
          )}
        </svg>
      </div>

      <div className="space-y-3">
        {vectors.map((vector, index) => (
          <div key={vector.id} className="panel p-3">
            <div className="flex items-baseline justify-between mb-1.5">
              <label className="text-xs font-medium text-text">
                Phase of <span className="font-mono">{vector.label}</span>
              </label>
              <span className="text-[11px] font-mono text-text-subtle">
                {phases[index].toFixed(2)} rad
              </span>
            </div>
            <input
              type="range" min={-globalThis.Math.PI} max={globalThis.Math.PI} step={0.01}
              value={phases[index]}
              onChange={(event) => {
                const next = [...phases];
                next[index] = Number(event.target.value);
                setPhases(next);
              }}
              className="w-full accent-accent"
              aria-label={`Phase of ${vector.label}`}
            />
            {showMagnitudeSquared && (
              <p className="text-[10px] text-text-subtle mt-1 font-mono">
                |{vector.label}|² = {(magnitudes[index] ** 2).toFixed(3)} — fixed
              </p>
            )}
          </div>
        ))}

        <div className="panel p-3 border-viz-quaternary/40">
          <p className="text-[10px] uppercase tracking-wide text-text-subtle mb-1">Sum</p>
          <p className="text-xs font-mono text-text">
            {sum.re.toFixed(3)} {sum.im >= 0 ? "+" : "−"} {globalThis.Math.abs(sum.im).toFixed(3)}i
          </p>
          <p className="text-xs font-mono text-viz-quaternary mt-1">
            |sum|² = {(sumMagnitude ** 2).toFixed(3)}
          </p>
          <p className="text-[10px] text-text-subtle mt-1.5 leading-4">
            {sumMagnitude < 0.05
              ? "Total cancellation — the outcome has become impossible."
              : sumMagnitude > 1.9
                ? "Full reinforcement — the amplitudes are in phase."
                : "Partial interference."}
          </p>
        </div>
      </div>
    </div>
  );
};
