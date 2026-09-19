import "./globals.css";
import React from "react";
import type { Metadata } from "next";

import { AppShell } from "@/components/layout/AppShell";
import { ThemeProvider, themeInitScript } from "@/components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "PBQuantum Labs — Interactive Quantum Computing Laboratory",
  description:
    "Learn quantum computing through derivations, interactive visuals, and circuits executed on IBM Qiskit Aer.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Applies the stored theme before first paint. Without it, dark-mode
            users see a flash of the light theme on every navigation. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
