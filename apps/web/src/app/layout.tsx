import "./globals.css";
import React from "react";
import { AppShell } from "@/components/layout/AppShell";

export const metadata = {
  title: "PBQuantum Labs — Interactive Quantum Computing Laboratory",
  description: "Learn quantum computing fundamentals step by step through visual circuit construction, mathematical derivations, and Qiskit Aer simulations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
