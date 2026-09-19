"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type ThemePreference = "light" | "dark" | "system";

interface ThemeContextValue {
  /** What the user chose, which may be "system". */
  preference: ThemePreference;
  /** What is actually rendered right now — never "system". */
  resolved: "light" | "dark";
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const THEME_STORAGE_KEY = "pbq-theme";

/**
 * Runs before first paint to apply the stored theme.
 *
 * Without this the page renders light, then corrects itself once React
 * hydrates — a visible flash for anyone using dark mode. Injected as a raw
 * script tag in the document head so it executes synchronously.
 */
export const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.setAttribute('data-theme', stored);
    }
  } catch (e) {
    /* Private browsing or blocked storage: fall back to the system preference,
       which the CSS handles on its own. */
  }
})();
`.trim();

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  // Read the stored preference after mount. Server-rendered markup cannot know
  // it, so reading during render would cause a hydration mismatch.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      stored = null;
    }
    const initial: ThemePreference =
      stored === "light" || stored === "dark" ? stored : "system";
    setPreferenceState(initial);
    setResolved(initial === "system" ? (systemPrefersDark() ? "dark" : "light") : initial);
  }, []);

  // Follow the OS while the preference is "system".
  useEffect(() => {
    if (preference !== "system") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolved(query.matches ? "dark" : "light");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);

    const root = document.documentElement;
    if (next === "system") {
      root.removeAttribute("data-theme");
      setResolved(systemPrefersDark() ? "dark" : "light");
    } else {
      root.setAttribute("data-theme", next);
      setResolved(next);
    }

    try {
      if (next === "system") localStorage.removeItem(THEME_STORAGE_KEY);
      else localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage unavailable: the choice still applies for this session.
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ preference, resolved, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error("useTheme must be used inside a ThemeProvider.");
  }
  return context;
}
