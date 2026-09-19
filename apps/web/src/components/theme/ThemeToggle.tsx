"use client";

import React from "react";
import { Monitor, Moon, Sun } from "lucide-react";

import { type ThemePreference, useTheme } from "./ThemeProvider";

const OPTIONS: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

/**
 * Three-state theme control.
 *
 * "System" is an explicit option rather than an implicit default, so the
 * current behaviour is always visible — a two-state toggle leaves users
 * unable to tell whether they picked light or simply inherited it.
 */
export const ThemeToggle: React.FC = () => {
  const { preference, setPreference } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className="inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-surface-raised border border-border"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = preference === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={`${label} theme`}
            onClick={() => setPreference(value)}
            className={`p-1.5 rounded-md transition-colors ${
              active
                ? "bg-surface text-accent shadow-card"
                : "text-text-subtle hover:text-text hover:bg-surface/60"
            }`}
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
};
