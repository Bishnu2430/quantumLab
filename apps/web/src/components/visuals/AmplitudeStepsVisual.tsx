"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Step {
  label: string;
  amplitudes: Record<string, number>;
}

interface Props {
  steps: Step[];
  signed?: boolean;
  annotate?: Record<string, string>;
}

/**
 * Signed amplitudes at each stage of a circuit.
 *
 * Plots amplitude rather than probability on purpose: squaring would hide the
 * sign, and the sign is the entire mechanism behind interference. Bars extend
 * above or below a zero line so cancellation is visible as two bars of
 * opposite direction rather than inferred from a number.
 */
export const AmplitudeStepsVisual: React.FC<Props> = ({ steps, signed = true, annotate }) => {
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const basisStates = Object.keys(step.amplitudes);

  const maxMagnitude = Math.max(
    1,
    ...steps.flatMap((s) => Object.values(s.amplitudes).map(Math.abs)),
  );

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-text">{step.label}</p>
          <p className="text-[11px] text-text-subtle">
            Step {index + 1} of {steps.length}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <StepButton
            direction="previous"
            disabled={index === 0}
            onClick={() => setIndex((i) => globalThis.Math.max(0, i - 1))}
          />
          <StepButton
            direction="next"
            disabled={index === steps.length - 1}
            onClick={() => setIndex((i) => globalThis.Math.min(steps.length - 1, i + 1))}
          />
        </div>
      </div>

      <div className="space-y-3">
        {basisStates.map((basis) => {
          const amplitude = step.amplitudes[basis];
          const magnitude = globalThis.Math.abs(amplitude) / maxMagnitude;
          const negative = amplitude < 0;

          return (
            <div key={basis}>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-text-muted w-10 shrink-0">|{basis}⟩</span>

                {/* Zero line at the centre; bars grow left for negative
                    amplitudes and right for positive ones. */}
                <div className="flex-1 relative h-7 bg-surface-sunken rounded overflow-hidden">
                  <div className="absolute inset-y-0 left-1/2 w-px bg-viz-axis" aria-hidden="true" />
                  {magnitude > 0.001 && (
                    <div
                      className={`absolute inset-y-1 rounded transition-all duration-300 ${
                        negative ? "bg-viz-negative" : "bg-viz-primary"
                      }`}
                      style={{
                        width: `${(magnitude * 50).toFixed(2)}%`,
                        left: negative ? `${(50 - magnitude * 50).toFixed(2)}%` : "50%",
                      }}
                    />
                  )}
                </div>

                <span
                  className={`text-xs font-mono w-16 text-right shrink-0 ${
                    magnitude < 0.001 ? "text-text-subtle" : negative ? "text-viz-negative" : "text-text"
                  }`}
                >
                  {signed && amplitude >= 0 ? "+" : ""}
                  {amplitude.toFixed(4)}
                </span>
              </div>

              {annotate?.[basis] && index === steps.length - 1 && (
                <p className="text-[11px] text-text-subtle mt-1 ml-[52px]">{annotate[basis]}</p>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-4 pt-3 border-t border-border text-[11px] text-text-subtle">
        Amplitudes, not probabilities — squaring these would discard the sign, which is
        what makes cancellation possible.
      </p>
    </div>
  );
};

const StepButton: React.FC<{
  direction: "previous" | "next";
  disabled: boolean;
  onClick: () => void;
}> = ({ direction, disabled, onClick }) => {
  const Icon = direction === "previous" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`${direction} step`}
      className="p-1.5 rounded-md border border-border bg-surface text-text-muted
                 hover:bg-surface-raised hover:text-text disabled:opacity-40
                 disabled:cursor-not-allowed transition-colors"
    >
      <Icon className="w-4 h-4" aria-hidden="true" />
    </button>
  );
};
