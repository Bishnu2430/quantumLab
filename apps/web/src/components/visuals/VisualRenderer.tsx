"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

import type { VisualSpec } from "@/content/types";
import { AmplitudeStepsVisual } from "./AmplitudeStepsVisual";
import { BlochSphereVisual } from "./BlochSphereVisual";
import { ComplexPlaneVisual } from "./ComplexPlaneVisual";
import { ConceptMapVisual } from "./ConceptMapVisual";
import { OperatorMatrixVisual } from "./OperatorMatrixVisual";

/**
 * Maps a lesson's visual spec onto the component that renders it.
 *
 * Props are passed straight through from the lesson, so a visual is always
 * driven by that lesson's data rather than by defaults baked into the
 * component. An unimplemented renderer says so plainly instead of rendering an
 * empty frame that looks like a loading failure.
 */
export const VisualRenderer: React.FC<{ visual: VisualSpec }> = ({ visual }) => {
  // `props` is authored content, so it is typed loosely here and asserted per
  // renderer. The curriculum test suite is what guarantees the shapes match.
  const props = visual.props ?? {};
  const as = <T,>(): T => props as T;

  switch (visual.renderer) {
    case "bloch-sphere":
      return <BlochSphereVisual {...as<React.ComponentProps<typeof BlochSphereVisual>>()} />;
    case "complex-plane":
      return <ComplexPlaneVisual {...as<React.ComponentProps<typeof ComplexPlaneVisual>>()} />;
    case "linear-algebra":
      return <OperatorMatrixVisual {...as<React.ComponentProps<typeof OperatorMatrixVisual>>()} />;
    case "concept-map":
      return <ConceptMapVisual {...as<React.ComponentProps<typeof ConceptMapVisual>>()} />;
    case "quantum-data-plot":
      return <AmplitudeStepsVisual {...as<React.ComponentProps<typeof AmplitudeStepsVisual>>()} />;
    default:
      return <NotImplemented renderer={visual.renderer} />;
  }
};

const NotImplemented: React.FC<{ renderer: string }> = ({ renderer }) => (
  <div className="panel p-6 flex items-start gap-3">
    <AlertTriangle className="w-4 h-4 mt-0.5 text-warning shrink-0" aria-hidden="true" />
    <div>
      <p className="text-sm font-medium text-text">Visual not available</p>
      <p className="text-[13px] text-text-subtle mt-0.5">
        The <code className="font-mono">{renderer}</code> renderer is not built yet. The
        lesson text and any circuit below are unaffected.
      </p>
    </div>
  </div>
);
