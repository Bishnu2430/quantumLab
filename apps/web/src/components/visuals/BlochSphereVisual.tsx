"use client";

import React, { useMemo, useState } from "react";

import { Math as Tex } from "@/components/lesson/Math";
import { ParameterControl } from "./ParameterControl";

interface Props {
  initial?: { theta: number; phi: number };
  markers?: string[];
  readouts?: string[];
  /** Whether to offer the decoherence control. */
  showNoise?: boolean;
}

const PI = globalThis.Math.PI;
const { cos, sin, abs, hypot } = globalThis.Math;

/**
 * Interactive single-qubit state on the Bloch sphere.
 *
 * An orthographic projection from a fixed viewpoint rather than a free 3D
 * camera, so every axis and basis-state label sits in a known place and stays
 * legible. Each control explains what it changes *and* what it leaves alone —
 * the distinction between θ and φ is the whole point of the picture, and a
 * bare pair of sliders does not convey it.
 */
export const BlochSphereVisual: React.FC<Props> = ({
  initial = { theta: 0, phi: 0 },
  readouts = ["amplitudes", "probabilities"],
  showNoise = true,
}) => {
  const [theta, setTheta] = useState(initial.theta);
  const [phi, setPhi] = useState(initial.phi);
  const [purity, setPurity] = useState(1);

  const state = useMemo(() => {
    const alpha = cos(theta / 2);
    const betaMag = sin(theta / 2);
    // Decoherence shrinks the Bloch vector towards the centre without moving
    // its direction; the state stops being pure but the probabilities stay.
    const r = purity;
    return {
      alpha,
      betaRe: betaMag * cos(phi),
      betaIm: betaMag * sin(phi),
      p0: (1 + r * cos(theta)) / 2,
      p1: (1 - r * cos(theta)) / 2,
      x: r * sin(theta) * cos(phi),
      y: r * sin(theta) * sin(phi),
      z: r * cos(theta),
    };
  }, [theta, phi, purity]);

  const point = project(state.x, state.y, state.z);
  const length = hypot(state.x, state.y, state.z);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="panel p-3">
        <svg
          viewBox="-132 -132 264 264"
          className="w-full h-auto"
          role="img"
          aria-label={`Bloch sphere. Polar angle ${theta.toFixed(2)} radians, azimuthal angle ${phi.toFixed(2)} radians, vector length ${length.toFixed(2)}.`}
        >
          <circle cx="0" cy="0" r="100" className="fill-surface-sunken stroke-viz-axis" strokeWidth="1" />
          <ellipse cx="0" cy="0" rx="100" ry="30" className="fill-none stroke-viz-grid" strokeWidth="1" />
          <ellipse cx="0" cy="0" rx="30" ry="100" className="fill-none stroke-viz-grid" strokeWidth="1" strokeDasharray="3 3" />

          <line x1="0" y1="-100" x2="0" y2="100" className="stroke-viz-axis" strokeWidth="1" />
          <line x1="-100" y1="0" x2="100" y2="0" className="stroke-viz-axis" strokeWidth="1" />

          {/* Labels anchor to their own axis outside the sphere, so they can
              never collide with the vector or with each other. */}
          <AxisLabel x={0} y={-100} dx={0} dy={-11} axis="+z" ket="|0\\rangle" />
          <AxisLabel x={0} y={100} dx={0} dy={20} axis="-z" ket="|1\\rangle" />
          <AxisLabel x={100} y={0} dx={26} dy={4} axis="+x" ket="|{+}\\rangle" />
          <AxisLabel x={-100} y={0} dx={-26} dy={4} axis="-x" ket="|{-}\\rangle" />
          <AxisLabel {...flat(0, 1, 0)} dx={22} dy={-8} axis="+y" ket="|i\\rangle" />
          <AxisLabel {...flat(0, -1, 0)} dx={-22} dy={10} axis="-y" ket="|{-}i\\rangle" />

          {/* Equatorial shadow makes φ readable instead of implied. */}
          <line x1="0" y1="0" x2={point.shadowX} y2={point.shadowY}
                className="stroke-viz-secondary" strokeWidth="1" strokeDasharray="2 3" opacity="0.7" />
          <line x1={point.shadowX} y1={point.shadowY} x2={point.x} y2={point.y}
                className="stroke-viz-secondary" strokeWidth="0.75" strokeDasharray="1 3" opacity="0.5" />

          {/* When decoherence shrinks the vector, show where it would have
              reached so the loss is visible rather than inferred. */}
          {purity < 0.99 && (
            <circle cx="0" cy="0" r={100 * purity} className="fill-none stroke-viz-negative"
                    strokeWidth="1" strokeDasharray="2 4" opacity="0.5" />
          )}

          <line x1="0" y1="0" x2={point.x} y2={point.y}
                className="stroke-viz-primary" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx={point.x} cy={point.y} r="5" className="fill-viz-primary" />
          <text x={point.x} y={point.y} dx={point.x >= 0 ? 12 : -12} dy={-8}
                textAnchor={point.x >= 0 ? "start" : "end"}
                className="fill-viz-primary text-[11px] font-mono font-semibold">
            |ψ⟩
          </text>
        </svg>

        <p className="text-[11px] text-text-subtle mt-2 px-1">
          The dashed line is the state&apos;s shadow on the equator — its length shows how
          far the state has tipped, and its direction is the phase φ.
        </p>
      </div>

      <div className="space-y-2.5">
        <ParameterControl
          label="Polar angle"
          symbol="θ"
          value={theta}
          min={0}
          max={PI}
          unit="rad"
          onChange={setTheta}
          summary="Tips the state between |0⟩ and |1⟩."
          detail="θ is the only thing that changes what a measurement in the computational basis will give. At the poles the outcome is certain; at the equator it is a fair coin. Physically this is how far the qubit has been rotated away from its starting axis — an Ry or Rx pulse moves it."
          markers={[
            { value: 0, label: "0", meaning: "At |0⟩. Measuring gives 0 every time." },
            { value: PI / 2, label: "π/2", meaning: "On the equator. Measuring gives 0 or 1 with equal probability." },
            { value: PI, label: "π", meaning: "At |1⟩. Measuring gives 1 every time." },
          ]}
          readout={(value) =>
            `P(0) = ${(((1 + purity * cos(value)) / 2) * 100).toFixed(1)}%, so the outcome is ${
              abs(cos(value)) > 0.9 ? "nearly certain" : abs(cos(value)) < 0.2 ? "close to a fair coin" : "biased but not certain"
            }.`
          }
        />

        <ParameterControl
          label="Azimuthal angle"
          symbol="φ"
          value={phi}
          min={0}
          max={2 * PI}
          unit="rad"
          onChange={setPhi}
          summary="Spins the state around the equator. Measurement probabilities do not move."
          detail="φ is the relative phase between the |0⟩ and |1⟩ amplitudes. Nothing you measure in the computational basis responds to it — watch P(0) stay fixed as you drag. It becomes visible the moment another gate interferes the two components, which is how every quantum algorithm converts phase into an answer. An Rz pulse moves it."
          markers={[
            { value: 0, label: "0", meaning: "Phase 0. On the +x axis when θ = π/2, which is |+⟩." },
            { value: PI / 2, label: "π/2", meaning: "Phase i. On the +y axis when θ = π/2, which is |i⟩." },
            { value: PI, label: "π", meaning: "Phase −1. On the −x axis when θ = π/2, which is |−⟩." },
            { value: 2 * PI, label: "2π", meaning: "A full turn: back where it started." },
          ]}
        />

        {showNoise && (
          <ParameterControl
            label="Coherence"
            value={purity}
            min={0}
            max={1}
            unit=""
            onChange={setPurity}
            summary="How much of the quantum character survives. 1 is a perfect qubit."
            detail="Real qubits leak information to their surroundings, and that decoherence shrinks the Bloch vector towards the centre without changing its direction. A shortened vector is a mixed state: still described by the same θ and φ, but now carrying classical uncertainty on top. At 0 the state is maximally mixed — a fair coin with no phase left, and no interference possible. This is the parameter that decides how deep a circuit can run before results become noise."
            markers={[
              { value: 1, label: "1.0", meaning: "Pure state, on the sphere's surface. Full interference available." },
              { value: 0.5, label: "0.5", meaning: "Half decohered. Interference effects are damped but not gone." },
              { value: 0, label: "0", meaning: "Maximally mixed, at the centre. Indistinguishable from a classical coin." },
            ]}
            readout={(value) =>
              value > 0.99
                ? "Pure state: the vector reaches the surface."
                : `Vector length ${value.toFixed(2)} — a mixed state, ${((1 - value) * 100).toFixed(0)}% decohered.`
            }
          />
        )}

        {readouts.includes("amplitudes") && (
          <Readout title="Amplitudes">
            <div className="space-y-0.5 text-[11px] font-mono text-text-muted">
              <div>α = {state.alpha.toFixed(4)}</div>
              <div>
                β = {state.betaRe.toFixed(4)}
                {state.betaIm >= 0 ? " + " : " − "}
                {abs(state.betaIm).toFixed(4)}i
              </div>
            </div>
          </Readout>
        )}

        {readouts.includes("probabilities") && (
          <Readout title="If you measured now">
            <ProbabilityBar label="P(0)" value={state.p0} />
            <ProbabilityBar label="P(1)" value={state.p1} />
          </Readout>
        )}

        <Readout title="Bloch vector ⟨X⟩, ⟨Y⟩, ⟨Z⟩">
          <code className="text-[11px] font-mono text-text-muted">
            ({fmt(state.x)}, {fmt(state.y)}, {fmt(state.z)})
          </code>
          <p className="text-[10px] text-text-subtle mt-1">
            Length {length.toFixed(3)} — {length > 0.99 ? "pure" : "mixed"}
          </p>
        </Readout>
      </div>
    </div>
  );
};

// --- projection -----------------------------------------------------------

const RADIUS = 100;

/** Fixed isometric-ish viewpoint so all three axes stay distinguishable. */
function project(x: number, y: number, z: number) {
  return {
    x: RADIUS * (x + y * 0.3),
    y: RADIUS * (-z + y * 0.3),
    shadowX: RADIUS * (x + y * 0.3),
    shadowY: RADIUS * (y * 0.3),
  };
}

function flat(x: number, y: number, z: number) {
  const p = project(x, y, z);
  return { x: p.x, y: p.y };
}

// --- pieces ---------------------------------------------------------------

const AxisLabel: React.FC<{
  x: number; y: number; dx: number; dy: number; axis: string; ket: string;
}> = ({ x, y, dx, dy, axis, ket }) => (
  <g>
    <circle cx={x} cy={y} r="2" className="fill-viz-axis" />
    <foreignObject x={x + dx - 28} y={y + dy - 9} width="56" height="18">
      <div className="flex items-center justify-center gap-1 text-[10px] leading-none">
        <span className="text-viz-label font-mono">{axis}</span>
        <span className="text-text"><Tex latex={ket} /></span>
      </div>
    </foreignObject>
  </g>
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
    <span className="text-[11px] font-mono text-text w-11 text-right tabular-nums">
      {(value * 100).toFixed(1)}%
    </span>
  </div>
);

function fmt(value: number): string {
  return value.toFixed(3).replace(/^-0\.000$/, "0.000");
}
