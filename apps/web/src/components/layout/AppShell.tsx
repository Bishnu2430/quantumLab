"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Cpu,
  FlaskConical,
  Menu,
  Settings,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";

import { QuantumCopilotDrawer } from "@/components/copilot/QuantumCopilotDrawer";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { QuantumNeuralBackground } from "./QuantumNeuralBackground";

const NAV_ITEMS = [
  { label: "Curriculum", href: "/learn", icon: BookOpen },
  { label: "Visualizations", href: "/visualizations", icon: Sparkles },
  { label: "Simulator", href: "/simulator", icon: Cpu },
  { label: "Playground", href: "/playground", icon: FlaskConical },
  { label: "Challenges", href: "/challenges", icon: Trophy },
  { label: "Progress", href: "/progress", icon: BarChart3 },
];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname() ?? "";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="min-h-screen flex flex-col antialiased bg-canvas text-text relative">
      <QuantumNeuralBackground />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2
                   focus:px-3 focus:py-2 focus:rounded-md focus:bg-surface focus:border focus:border-accent"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-6 min-w-0">
            <Link href="/learn" className="flex items-center gap-2.5 group rounded-md shrink-0">
              <span
                aria-hidden="true"
                className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center
                           text-text-inverse text-xs font-bold font-mono"
              >
                PB
              </span>
              <span className="text-base font-bold tracking-tight text-text group-hover:text-accent transition-colors">
                PBQuantum Labs
              </span>
            </Link>

            <nav aria-label="Primary" className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      active
                        ? "bg-accent-soft text-accent-text border border-accent-border"
                        : "text-text-muted hover:text-text hover:bg-surface-raised border border-transparent"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />

            <button
              type="button"
              onClick={() => setCopilotOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md
                         bg-accent-soft border border-accent-border text-accent-text
                         text-xs font-mono font-semibold hover:bg-accent-border transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              AI Copilot
            </button>

            <Link
              href="/settings"
              title="Settings"
              className="hidden sm:flex p-1.5 rounded-md bg-surface-raised border border-border
                         text-text-muted hover:text-text transition-colors"
            >
              <Settings className="w-4 h-4" aria-hidden="true" />
              <span className="sr-only">Settings</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation"
              className="lg:hidden p-1.5 rounded-md bg-surface-raised border border-border text-text-muted"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav aria-label="Mobile" className="lg:hidden border-t border-border bg-surface px-4 py-2">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors ${
                  isActive(href) ? "text-accent bg-accent-soft" : "text-text-muted hover:bg-surface-raised"
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main id="main" className="flex-1 relative z-10">
        {children}
      </main>

      <footer className="relative z-10 border-t border-border bg-surface mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-text-subtle">
            Simulations run on IBM Qiskit Aer. No measurement shown here is fabricated.
          </p>
          <p className="text-[11px] font-mono text-text-subtle">PBQuantum Labs</p>
        </div>
      </footer>

      <QuantumCopilotDrawer isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
    </div>
  );
};
