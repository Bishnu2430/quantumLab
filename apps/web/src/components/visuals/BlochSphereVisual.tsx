"use client";

import React, { useMemo, useState } from "react";

import { Math } from "@/components/lesson/Math";

interface Props {
  initial?: { theta: number; phi: number };
  markers?: string[];
  readouts?: string[];
}

/**
 * Interactive single-qubit state on the Bloch sphere.
 *
 * Deliberately an orthographic SVG projection rather than a 3D scene: a fixed
 * viewpoint lets every axis and basis-state label be placed deterministically
 * and kept legible, which a freely-rotating camera cannot guarantee. The
 * readouts are computed from the same θ and φ that drive the vector, so the
 * numbers and the picture can never disagree.
 */
export const BlochSphereVisual: React.FC<Props> = ({
  initial = { theta: 0, phi: 0 },
  readouts = ["amplitudes", "probabilities"],
}) => {
  const [theta, setTheta] = useState(initial.theta);
  const [phi, setPhi] = useState(initial.phi);

  const state = useMemo(() => {
    const alpha = Math_cos(theta / 2);
    const betaMag = Math_sin(theta / 2);
    return {
      alpha,
      betaRe: betaMag * Math_cos(phi),
      betaIm: betaMag * Math_sin(phi),
      p0: alpha * alpha,
      p1: betaMag * betaMag,
      // Bloch vector components, which are the Pauli expectation values.
      x: Math_sin(theta) * Math_cos(phi),
      y: Math_sin(theta) * Math_sin(phi),
      z: Math_cos(theta),
    };
  }, [theta, phi]);

  const projected = project(state.x, state.y, state.z);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div className="panel p-3">
        <svg viewBox="-130 -130 260 260" className="w-full h-auto" role="img"
             aria-label={`Bloch sphere with the state vector at theta ${theta.toFixed(2)} and phi ${phi.toFixed(2)} radians`}>
          {/* Sphere outline and the two great circles that give it depth. */}
          <circle cx="0" cy="0" r="100" className="fill-surface-sunken stroke-viz-axis" strokeWidth="1" />
          <ellipse cx="0" cy="0" rx="100" ry="30" className="fill-none stroke-viz-grid" strokeWidth="1" />
          <ellipse cx="0" cy="0" rx="30" ry="100" className="fill-none stroke-viz-grid" strokeWidth="1"
                   strokeDasharray="3 3" />

          {/* Axes. Each label sits just outside the sphere on its own axis, so
              no label can ever overlap the vector or another label. */}
          <AxisLabel x={0} y={-100} dx={0} dy={-10} axis="+z" ket="|0\rangle" anchor="middle" />
          <AxisLabel x={0} y={100} dx={0} dy={20} axis="-z" ket="|1\rangle" anchor="middle" />
          <AxisLabel x={100} y={0} dx={10} dy={4} axis="+x" ket="|{+}\rangle" anchor="start" />
          <AxisLabel x={-100} y={0} dx={-10} dy={4} axis="-x" ket="|{-}\rangle" anchor="end" />
          <AxisLabel {...projectPoint(0, 1, 0)} dx={8} dy={-6} axis="+y" ket="|i\rangle" anchor="start" />
          <AxisLabel {...projectPoint(0, -1, 0)} dx={-8} dy={8} axis="-y" ket="|{-}i\rangle" anchor="end" />

          <line x1="0" y1="-100" x2="0" y2="100" className="stroke-viz-axis" strokeWidth="1" />
          <line x1="-100" y1="0" x2="100" y2="0" className="stroke-viz-axis" strokeWidth="1" />

          {/* Projection of the vector onto the equatorial plane, which makes
              the azimuthal angle φ readable rather than implied. */}
          <line
            x1="0" y1="0" x2={projected.px} y2={projected.py}
            className="stroke-viz-secondary" strokeWidth="1" strokeDasharray="2 3" opacity="0.7"
          />

          {/* The state vector itself. */}
          <line x1="0" y1="0" x2={projected.x} y2={projected.y}
                className="stroke-viz-primary" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx={projected.x} cy={projected.y} r="5" className="fill-viz-primary" />

          <text x={projected.x} y={projected.y} dx={projected.x >= 0 ? 12 : -12} dy={-8}
                textAnchor={projected.x >= 0 ? "start" : "end"}
                className="fill-viz-primary text-[11px] font-mono font-semibold">
            |ψ⟩
          </text>
        </svg>
      </div>

      <div className="space-y-3">
        <Slider label="θ (polar)" value={theta} max={globalThis.Math.PI} onChange={setTheta}
                hint="Sets the measurement probabilities" />
        <Slider label="φ (azimuthal)" value={phi} max={2 * globalThis.Math.PI} onChange={setPhi}
                hint="Relative phase — probabilities do not move" />

        {readouts.includes("amplitudes") && (
          <Readout title="State">
            <Math latex={`\\cos\\frac{\\theta}{2}=${state.alpha.toFixed(3)}`} />
            <span className="text-text-subtle mx-1">,</span>
            <Math latex={`\\beta=${format(state.betaRe)}${state.betaIm >= 0 ? "+" : "-"}${globalThis.Math.abs(state.betaIm).toFixed(3)}i`} />
          </Readout>
        )}

        {readouts.includes("probabilities") && (
          <Readout title="Measurement">
            <ProbabilityBar label="P(0)" value={state.p0} />
            <ProbabilityBar label="P(1)" value={state.p1} />
          </Readout>
        )}

        <Readout title="Bloch vector">
          <code className="text-[11px] font-mono text-text-muted">
            ({format(state.x)}, {format(state.y)}, {format(state.z)})
          </code>
        </Readout>
      </div>
    </div>
  );
};

// --- projection -----------------------------------------------------------

// Fixed viewing angle. Isometric-ish so all three axes stay distinguishable.
const RADIUS = 100;
const TILT = 0.3;

function project(x: number, y: number, z: number) {
  return {
    x: RADIUS * (x + y * 0.5 * TILT * 2),
    y: RADIUS * (-z + y * 0.3),
    // The same point with z zeroed, i.e. dropped onto the equatorial plane.
    px: RADIUS * (x + y * 0.5 * TILT * 2),
    py: RADIUS * (y * 0.3),
  };
}

function projectPoint(x: number, y: number, z: number) {
  const p = project(x, y, z);
  return { x: p.x, y: p.y };
}

// --- pieces ---------------------------------------------------------------

const AxisLabel: React.FC<{
  x: number; y: number; dx: number; dy: number;
  axis: string; ket: string; anchor: "start" | "middle" | "end";
}> = ({ x, y, dx, dy, axis, ket }) => (
  <g>
    <circle cx={x} cy={y} r="2" className="fill-viz-axis" />
    {/* foreignObject lets KaTeX render the ket inside the SVG, so the label is
        typeset mathematics rather than an approximation in plain text. */}
    <foreignObject x={x + dx - 26} y={y + dy - 9} width="52" height="18">
      <div className="flex items-center justify-center gap-1 text-[10px] leading-none">
        <span className="text-viz-label font-mono">{axis}</span>
        <span className="text-text"><Math latex={ket} /></span>
      </div>
    </foreignObject>
  </g>
);

const Slider: React.FC<{
  label: string; value: number; max: number; hint: string;
  onChange: (value: number) => void;
}> = ({ label, value, max, hint, onChange }) => (
  <div className="panel p-3">
    <div className="flex items-baseline justify-between mb-1.5">
      <label className="text-xs font-medium text-text">{label}</label>
      <span className="text-[11px] font-mono text-accent">{value.toFixed(2)} rad</span>
    </div>
    <input
      type="range" min={0} max={max} step={0.01} value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="w-full accent-accent"
      aria-label={label}
    />
    <p className="text-[10px] text-text-subtle mt-1">{hint}</p>
  </div>
);

const Readout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="panel p-3">
    <p className="text-[10px] uppercase tracking-wide text-text-subtle mb-1.5">{title}</p>
    <div className="text-xs text-text">{children}</div>
  </div>
);

const ProbabilityBar: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="flex items-center gap-2 mb-1 last:mb-0">
    <span className="text-[11px] font-mono text-text-muted w-9">{label}</span>
    <div className="flex-1 h-2 rounded-full bg-surface-sunken overflow-hidden">
      <div className="h-full bg-viz-primary rounded-full transition-[width] duration-150"
           style={{ width: `${value * 100}%` }} />
    </div>
    <span className="text-[11px] font-mono text-text w-11 text-right">
      {(value * 100).toFixed(1)}%
    </span>
  </div>
);

// Local aliases keep the trigonometry readable next to the `Math` component,
// whose name would otherwise shadow the global.
const Math_cos = globalThis.Math.cos;
const Math_sin = globalThis.Math.sin;

function format(value: number): string {
  return value.toFixed(3).replace(/^-0\.000$/, "0.000");
}
