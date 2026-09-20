"use client";

import React, { useId, useState } from "react";
import { Info } from "lucide-react";

export interface ParameterMarker {
  /** Value at which this note applies. */
  value: number;
  /** Short label shown under the track, e.g. "π/2". */
  label: string;
  /** What is physically true at this value. */
  meaning: string;
}

interface Props {
  label: string;
  /** Symbol rendered beside the label, e.g. "θ". */
  symbol?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  /** One line, always visible: what this parameter controls. */
  summary: string;
  /**
   * The longer explanation, revealed on demand: what actually changes in the
   * physics when this is moved, and what it does *not* change.
   */
  detail: string;
  /** Notable values, shown as ticks with their meaning. */
  markers?: ParameterMarker[];
  /** Live description of the current value, recomputed as it moves. */
  readout?: (value: number) => string;
}

/**
 * A slider that explains itself.
 *
 * Every interactive parameter in this project uses this control, because a
 * bare slider labelled "θ" teaches nothing: the learner needs to know what
 * moving it does before moving it is informative. The summary is always
 * visible, the detail is one click away, and marked values name the states
 * that matter.
 */
export const ParameterControl: React.FC<Props> = ({
  label,
  symbol,
  value,
  min,
  max,
  step = 0.01,
  unit,
  onChange,
  summary,
  detail,
  markers,
  readout,
}) => {
  const [showDetail, setShowDetail] = useState(false);
  const id = useId();
  const detailId = `${id}-detail`;

  const percent = ((value - min) / (max - min)) * 100;
  const nearest = markers?.find((marker) => Math.abs(marker.value - value) < (max - min) * 0.02);

  return (
    <div className="panel p-3">
      <div className="flex items-start justify-between gap-2 mb-1">
        <label htmlFor={id} className="text-xs font-medium text-text flex items-center gap-1.5">
          {symbol && <span className="font-mono text-accent">{symbol}</span>}
          {label}
        </label>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-mono text-accent tabular-nums">
            {value.toFixed(2)}
            {unit && <span className="text-text-subtle ml-0.5">{unit}</span>}
          </span>
          <button
            type="button"
            onClick={() => setShowDetail((open) => !open)}
            aria-expanded={showDetail}
            aria-controls={detailId}
            aria-label={`What does ${label} do?`}
            className={`p-0.5 rounded transition-colors ${
              showDetail ? "text-accent" : "text-text-subtle hover:text-accent"
            }`}
          >
            <Info className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <p className="text-[11px] leading-4 text-text-subtle mb-2">{summary}</p>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-accent"
      />

      {markers && markers.length > 0 && (
        <div className="relative h-4 mt-0.5" aria-hidden="true">
          {markers.map((marker) => (
            <button
              key={marker.value}
              type="button"
              onClick={() => onChange(marker.value)}
              title={marker.meaning}
              style={{ left: `${((marker.value - min) / (max - min)) * 100}%` }}
              className="absolute -translate-x-1/2 text-[9px] font-mono text-text-subtle
                         hover:text-accent transition-colors whitespace-nowrap"
            >
              {marker.label}
            </button>
          ))}
        </div>
      )}

      {/* What is true right now, rather than what the number is. */}
      {(nearest || readout) && (
        <p className="text-[11px] leading-4 text-text-muted mt-1.5 pt-1.5 border-t border-border">
          {nearest ? nearest.meaning : readout?.(value)}
        </p>
      )}

      {showDetail && (
        <p
          id={detailId}
          className="text-[11px] leading-5 text-text-muted mt-2 pt-2 border-t border-border"
        >
          {detail}
        </p>
      )}

      <span className="sr-only">
        {label} is at {percent.toFixed(0)} percent of its range.
      </span>
    </div>
  );
};

/**
 * The same idea for a non-numeric choice: a set of options, each carrying an
 * explanation of what selecting it does.
 */
export const ChoiceControl: React.FC<{
  label: string;
  summary: string;
  value: string;
  options: { value: string; label: string; meaning: string }[];
  onChange: (value: string) => void;
}> = ({ label, summary, value, options, onChange }) => {
  const selected = options.find((option) => option.value === value);

  return (
    <div className="panel p-3">
      <p className="text-xs font-medium text-text mb-1">{label}</p>
      <p className="text-[11px] leading-4 text-text-subtle mb-2">{summary}</p>

      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            onClick={() => onChange(option.value)}
            title={option.meaning}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
              value === option.value
                ? "bg-accent-soft border-accent-border text-accent-text"
                : "bg-surface border-border text-text-muted hover:text-text hover:border-accent-border"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {selected && (
        <p className="text-[11px] leading-4 text-text-muted mt-2 pt-2 border-t border-border">
          {selected.meaning}
        </p>
      )}
    </div>
  );
};
