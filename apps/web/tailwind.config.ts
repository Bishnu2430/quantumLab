import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        quantum: {
          dark: "#0a0d14",
          card: "#121824",
          border: "#1f293d",
          accent: "#6366f1",
          cyan: "#06b6d4",
          teal: "#14b8a6",
          purple: "#a855f7",
          pink: "#ec4899",
          amber: "#f59e0b"
        }
      },
      backgroundImage: {
        'quantum-gradient': 'linear-gradient(135deg, #0a0d14 0%, #0f172a 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
      }
    },
  },
  plugins: [],
};

export default config;
