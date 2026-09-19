import type { Config } from "tailwindcss";

/**
 * Colours resolve to CSS variables defined in globals.css, so every utility
 * follows the active theme automatically. The `<alpha-value>` placeholder is
 * what keeps opacity modifiers (`bg-surface/60`) working.
 */
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/content/**/*.{js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: token("color-canvas"),
        surface: {
          DEFAULT: token("color-surface"),
          raised: token("color-surface-raised"),
          sunken: token("color-surface-sunken"),
        },
        border: {
          DEFAULT: token("color-border"),
          strong: token("color-border-strong"),
        },
        text: {
          DEFAULT: token("color-text"),
          muted: token("color-text-muted"),
          subtle: token("color-text-subtle"),
          inverse: token("color-text-inverse"),
        },
        accent: {
          DEFAULT: token("color-accent"),
          hover: token("color-accent-hover"),
          soft: token("color-accent-soft"),
          border: token("color-accent-border"),
          text: token("color-accent-text"),
        },
        success: {
          DEFAULT: token("color-success"),
          soft: token("color-success-soft"),
          border: token("color-success-border"),
        },
        warning: {
          DEFAULT: token("color-warning"),
          soft: token("color-warning-soft"),
          border: token("color-warning-border"),
        },
        danger: {
          DEFAULT: token("color-danger"),
          soft: token("color-danger-soft"),
          border: token("color-danger-border"),
        },
        info: {
          DEFAULT: token("color-info"),
          soft: token("color-info-soft"),
          border: token("color-info-border"),
        },
        viz: {
          primary: token("viz-primary"),
          secondary: token("viz-secondary"),
          tertiary: token("viz-tertiary"),
          quaternary: token("viz-quaternary"),
          positive: token("viz-positive"),
          negative: token("viz-negative"),
          axis: token("viz-axis"),
          grid: token("viz-grid"),
          label: token("viz-label"),
        },
      },
      boxShadow: {
        card: "var(--shadow-card)",
        raised: "var(--shadow-raised)",
      },
      maxWidth: {
        prose: "68ch",
      },
    },
  },
  plugins: [],
};

export default config;
