"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, FlaskConical, LogIn, LogOut, Menu, Settings, Sparkles, Trophy, X } from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { QuantumCopilotDrawer } from "@/components/copilot/QuantumCopilotDrawer";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { BRAND } from "@/lib/brand";
import { QuantumNeuralBackground } from "./QuantumNeuralBackground";

const NAV_ITEMS = [
  { label: "Learn", href: "/learn", icon: BookOpen },
  { label: "Lab", href: "/lab", icon: FlaskConical },
  { label: "Challenges", href: "/challenges", icon: Trophy },
  { label: "Progress", href: "/progress", icon: BarChart3 },
];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname() ?? "";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const { user, loading, signOut } = useAuth();

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
            <Link href="/" className="flex items-center gap-2.5 group rounded-md shrink-0">
              <span
                aria-hidden="true"
                className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center
                           text-text-inverse text-xs font-bold font-mono"
              >
                {BRAND.mark}
              </span>
              <span className="text-base font-bold tracking-tight text-text group-hover:text-accent transition-colors">
                {BRAND.name}
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

            {/* Account. The role is shown because it decides what the Lab
                allows: only researchers may run their own code. */}
            {!loading && (user ? (
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border">
                <div className="text-right leading-tight">
                  <p className="text-[11px] font-medium text-text">{user.display_name}</p>
                  <p className="text-[10px] font-mono text-text-subtle capitalize">{user.role}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="p-1.5 rounded-md bg-surface-raised border border-border text-text-muted hover:text-text transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  <span className="sr-only">Sign out</span>
                </button>
              </div>
            ) : (
              <Link
                href="/signin"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md
                           border border-border bg-surface text-xs font-semibold text-text
                           hover:border-accent-border transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
                Sign in
              </Link>
            ))}

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
          <div className="min-w-0">
            <p className="text-[11px] text-text-subtle">
              Every stated result is verified against the simulator before it ships.
            </p>
            <p className="text-[11px] text-text-subtle mt-0.5">
              Code executes in an isolated sandbox with no network access.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-text-subtle shrink-0">
            <Link href="/learn" className="hover:text-accent transition-colors">Curriculum</Link>
            <Link href="/settings" className="hover:text-accent transition-colors">Settings</Link>
            <span className="font-mono">{BRAND.name}</span>
          </div>
        </div>
      </footer>

      <QuantumCopilotDrawer isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
    </div>
  );
};
