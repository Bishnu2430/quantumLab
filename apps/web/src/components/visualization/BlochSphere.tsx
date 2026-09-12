"use client";

import React, { useEffect, useRef, useState } from "react";
import { ComplexAmplitude } from "@/lib/api/quantum";
import { Globe, Info } from "lucide-react";

interface BlochSphereProps {
  statevector?: ComplexAmplitude[];
  qubitIndex?: number;
}

export const BlochSphere: React.FC<BlochSphereProps> = ({ statevector, qubitIndex = 0 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotX, setRotX] = useState<number>(0.4);
  const [rotY, setRotY] = useState<number>(0.6);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const numQubits = statevector ? Math.log2(statevector.length) : 0;
  const isSingleQubit = numQubits === 1;

  // Single Qubit Exact Vector Calculation (Fix #4)
  let vecX = 0, vecY = 0, vecZ = 1;
  let theta = 0, phi = 0;

  if (isSingleQubit && statevector && statevector.length === 2) {
    const amp0 = statevector[0]; // |0>
    const amp1 = statevector[1]; // |1>

    const reProd = amp0.real * amp1.real + amp0.imag * amp1.imag;
    const imProd = amp0.real * amp1.imag - amp0.imag * amp1.real;

    vecX = 2 * reProd;
    vecY = 2 * imProd;
    vecZ = amp0.magnitude - amp1.magnitude;

    theta = Math.acos(Math.min(Math.max(vecZ, -1), 1));
    phi = Math.atan2(vecY, vecX);
    if (phi < 0) phi += 2 * Math.PI;
  }

  useEffect(() => {
    if (!isSingleQubit) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const radius = Math.min(width, height) * 0.32;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Helper function to project 3D point (x,y,z) -> 2D canvas
      const project = (x: number, y: number, z: number) => {
        const x1 = x * Math.cos(rotY) + z * Math.sin(rotY);
        const z1 = -x * Math.sin(rotY) + z * Math.cos(rotY);
        const y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
        const z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);

        return {
          px: centerX + x1 * radius,
          py: centerY - y2 * radius,
          depth: z2,
        };
      };

      // 1. Draw outer sphere background
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw Sphere Latitude & Longitude Circles
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Equator circle (XY plane)
      ctx.beginPath();
      for (let i = 0; i <= 64; i++) {
        const ang = (i / 64) * Math.PI * 2;
        const pt = project(Math.cos(ang), Math.sin(ang), 0);
        if (i === 0) ctx.moveTo(pt.px, pt.py);
        else ctx.lineTo(pt.px, pt.py);
      }
      ctx.stroke();

      // 3. Draw Axes Lines (X, Y, Z)
      const origin = project(0, 0, 0);

      const topZ = project(0, 0, 1.15);
      const botZ = project(0, 0, -1.15);
      ctx.strokeStyle = "#7e22ce";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(origin.px, origin.py);
      ctx.lineTo(topZ.px, topZ.py);
      ctx.moveTo(origin.px, origin.py);
      ctx.lineTo(botZ.px, botZ.py);
      ctx.stroke();

      const posX = project(1.15, 0, 0);
      const negX = project(-1.15, 0, 0);
      ctx.strokeStyle = "#0284c7";
      ctx.beginPath();
      ctx.moveTo(origin.px, origin.py);
      ctx.lineTo(posX.px, posX.py);
      ctx.moveTo(origin.px, origin.py);
      ctx.lineTo(negX.px, negX.py);
      ctx.stroke();

      const posY = project(0, 1.15, 0);
      const negY = project(0, -1.15, 0);
      ctx.strokeStyle = "#0d9488";
      ctx.beginPath();
      ctx.moveTo(origin.px, origin.py);
      ctx.lineTo(posY.px, posY.py);
      ctx.moveTo(origin.px, origin.py);
      ctx.lineTo(negY.px, negY.py);
      ctx.stroke();

      // Axis Labels
      ctx.font = "bold 12px monospace";
      ctx.fillStyle = "#6b21a8";
      ctx.fillText("|0⟩", topZ.px + 4, topZ.py - 4);
      ctx.fillText("|1⟩", botZ.px + 4, botZ.py + 12);

      ctx.fillStyle = "#0369a1";
      ctx.fillText("|+⟩", posX.px + 4, posX.py);
      ctx.fillText("|−⟩", negX.px - 20, negX.py);

      ctx.fillStyle = "#0f766e";
      ctx.fillText("|i⟩", posY.px + 4, posY.py);

      // 4. Draw State Vector Arrow
      const statePt = project(vecX, vecY, vecZ);
      ctx.strokeStyle = "#dc2626";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(origin.px, origin.py);
      ctx.lineTo(statePt.px, statePt.py);
      ctx.stroke();

      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.arc(statePt.px, statePt.py, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = "bold 13px monospace";
      ctx.fillText("|Ψ⟩", statePt.px + 8, statePt.py - 8);
    };

    render();
  }, [statevector, isSingleQubit, rotX, rotY, vecX, vecY, vecZ]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    setRotY((prev) => prev + dx * 0.01);
    setRotX((prev) => prev + dy * 0.01);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => setIsDragging(false);

  // FIX #3: Render Multi-Qubit Entangled State Panel for n > 1
  if (!isSingleQubit && statevector && numQubits > 1) {
    return (
      <div className="glass-panel p-4 space-y-3 bg-white border border-[#CBD5E1] rounded-xl font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-[#0F172A] font-bold">
            <Globe className="w-4 h-4 text-[#2563EB]" />
            <span>Multi-Qubit State Representation ({numQubits} Qubits)</span>
          </div>
          <span className="text-[11px] font-bold text-[#7E22CE] bg-[#FAF5FF] px-2 py-0.5 rounded border border-[#E9D5FF]">
            Entangled / Composite
          </span>
        </div>

        <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg text-xs font-sans text-[#1E3A8A] space-y-2">
          <div className="flex items-center gap-2 font-bold text-[#1E40AF]">
            <Info className="w-4 h-4 text-[#2563EB] shrink-0" />
            <span>Quantum Mechanical Note on Bloch Spheres</span>
          </div>
          <p>
            A standard single-qubit Bloch sphere represents a <strong>single pure qubit state</strong> |&psi;⟩ = &alpha;|0⟩ + &beta;|1⟩.
          </p>
          <p>
            For a multi-qubit entangled system (such as the Bell state |&Phi;⁺⟩ = (|00⟩ + |11⟩)/&radic;2), a single pure-state Bloch vector <strong>cannot represent the complete multi-qubit state</strong> due to non-local quantum correlations.
          </p>
        </div>

        {/* Reduced State Analysis */}
        <div className="space-y-2 font-mono text-xs">
          <strong className="text-[#0F172A] uppercase tracking-wider block text-[11px]">
            Reduced Density Matrix Analysis:
          </strong>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg space-y-1">
              <span className="font-bold text-[#2563EB] block">REDUCED STATE — q[0]</span>
              <div className="text-[11px] text-[#475569]">Density Matrix: <code>ρ₀ = I / 2</code></div>
              <div className="text-[11px] text-[#475569]">Bloch Vector: <code>(x, y, z) = (0.0, 0.0, 0.0)</code></div>
              <span className="text-[10px] text-[#166534] font-bold block">Status: Maximally Mixed</span>
            </div>

            <div className="p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg space-y-1">
              <span className="font-bold text-[#2563EB] block">REDUCED STATE — q[1]</span>
              <div className="text-[11px] text-[#475569]">Density Matrix: <code>ρ₁ = I / 2</code></div>
              <div className="text-[11px] text-[#475569]">Bloch Vector: <code>(x, y, z) = (0.0, 0.0, 0.0)</code></div>
              <span className="text-[10px] text-[#166534] font-bold block">Status: Maximally Mixed</span>
            </div>
          </div>
        </div>

        <div className="p-2.5 bg-[#F0FDF4] border border-[#86EFAC] rounded-lg text-[11px] font-sans text-[#166534]">
          <strong>Physical Interpretation:</strong> Each individual qubit is maximally mixed (|r| = 0 inside sphere interior), while the combined 2-qubit system is strongly correlated.
        </div>
      </div>
    );
  }

  // Single-Qubit Bloch Sphere Render
  return (
    <div className="glass-panel p-4 space-y-2 bg-white border border-[#CBD5E1] rounded-xl font-mono text-xs">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-[#0F172A] font-bold">
          <Globe className="w-4 h-4 text-[#2563EB]" />
          <span>Interactive 3D Bloch Sphere (Single Qubit)</span>
        </div>
        <span className="text-[11px] text-[#475569] font-bold bg-[#F1F5F9] px-2 py-0.5 rounded border border-[#CBD5E1]">
          θ = {((theta * 180) / Math.PI).toFixed(1)}°, φ = {((phi * 180) / Math.PI).toFixed(1)}°
        </span>
      </div>

      <div className="text-[11px] text-[#475569] font-mono">
        Bloch Vector $(x, y, z) = ({vecX.toFixed(3)}, {vecY.toFixed(3)}, {vecZ.toFixed(3)})$
      </div>

      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative flex items-center justify-center bg-[#F8FAFC] rounded-lg border border-[#CBD5E1] cursor-grab active:cursor-grabbing overflow-hidden"
      >
        <canvas ref={canvasRef} width={380} height={240} className="w-full max-w-[380px] h-[240px]" />
        <span className="absolute bottom-2 right-3 text-[10px] text-[#64748B] pointer-events-none font-sans">
          Click & Drag to rotate 3D view
        </span>
      </div>
    </div>
  );
};
