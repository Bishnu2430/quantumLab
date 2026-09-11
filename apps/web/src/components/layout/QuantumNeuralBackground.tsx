"use client";

import React, { useEffect, useRef } from "react";

interface QubitNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  rotSpeed: number;
  vectorAngle: number;
  side: "left" | "right";
}

export const QuantumNeuralBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -2000,
    y: -2000,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Compute dynamic gutter boundaries based on the central <main> content position
    const getGutterBounds = (w: number) => {
      const mainEl = document.querySelector("main");
      if (mainEl) {
        const rect = mainEl.getBoundingClientRect();
        // Keep nodes strictly outside the main content card boundaries
        const leftMax = Math.max(40, rect.left - 18);
        const rightMin = Math.min(w - 40, rect.right + 18);
        return {
          leftMin: 18,
          leftMax,
          rightMin,
          rightMax: w - 18,
          hasGutters: leftMax >= 45 && rightMin <= w - 45,
        };
      }

      // Default fallback if <main> is still mounting
      const contentWidth = Math.min(1120, Math.max(600, w * 0.72));
      const gutter = (w - contentWidth) / 2;
      return {
        leftMin: 18,
        leftMax: Math.max(30, gutter - 18),
        rightMin: Math.min(w - 30, w - gutter + 18),
        rightMax: w - 18,
        hasGutters: gutter >= 45,
      };
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    // Create Left & Right Side Nodes
    const countPerSide = Math.max(6, Math.min(11, Math.floor(height / 95)));
    const nodes: QubitNode[] = [];
    const initialBounds = getGutterBounds(width);

    // 1. Left Gutter Nodes
    for (let i = 0; i < countPerSide; i++) {
      const xRange = Math.max(20, initialBounds.leftMax - initialBounds.leftMin);
      nodes.push({
        x: initialBounds.leftMin + Math.random() * xRange,
        y: 60 + Math.random() * (height - 120),
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: 14 + Math.random() * 4, // 14px - 18px mini Bloch sphere
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.016,
        vectorAngle: Math.random() * Math.PI * 2,
        side: "left",
      });
    }

    // 2. Right Gutter Nodes
    for (let i = 0; i < countPerSide; i++) {
      const xRange = Math.max(20, initialBounds.rightMax - initialBounds.rightMin);
      nodes.push({
        x: initialBounds.rightMin + Math.random() * xRange,
        y: 60 + Math.random() * (height - 120),
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: 14 + Math.random() * 4,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.016,
        vectorAngle: Math.random() * Math.PI * 2,
        side: "right",
      });
    }

    // Helper: Draw single Mini Bloch Sphere Icon (matching user's uploaded logo)
    const drawBlochSphereIcon = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      r: number,
      rotation: number,
      vecAngle: number,
      isHovered: boolean
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      // Color scheme:
      // Idle: Deep solid slate/black (#0F172A) representing quantum on white background
      // Hovered: Glowing Royal Quantum Blue (#2563EB)
      const strokeColor = isHovered ? "#2563EB" : "#0F172A";
      const badgeFill = isHovered ? "#2563EB" : "#0F172A";
      const ellipseColor = isHovered ? "#3B82F6" : "#334155";

      // 1. Outer Sphere Circle
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.7;
      ctx.stroke();

      // 2. Dashed Equatorial Ellipse
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.94, r * 0.38, 0, 0, Math.PI * 2);
      ctx.setLineDash([2.5, 2.5]);
      ctx.strokeStyle = ellipseColor;
      ctx.lineWidth = 1.15;
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Coordinate Axes
      // Z-Axis (Vertical through poles with subtle extensions)
      ctx.beginPath();
      ctx.moveTo(0, r + 4);
      ctx.lineTo(0, -r - 4);
      // X-Axis (Horizontal)
      ctx.moveTo(-r * 0.8, 0);
      ctx.lineTo(r + 4, 0);
      // Y-Axis (Diagonal perspective)
      ctx.moveTo(-r * 0.55, r * 0.55);
      ctx.lineTo(r * 0.5, -r * 0.5);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.25;
      ctx.stroke();

      // 4. Polar circular badges: "0" at top North pole, "1" at bottom South pole
      const badgeR = r * 0.28;

      // North Pole |0>
      ctx.beginPath();
      ctx.arc(0, -r, badgeR, 0, Math.PI * 2);
      ctx.fillStyle = badgeFill;
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `bold ${Math.round(r * 0.34)}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("0", 0, -r);

      // South Pole |1>
      ctx.beginPath();
      ctx.arc(0, r, badgeR, 0, Math.PI * 2);
      ctx.fillStyle = badgeFill;
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText("1", 0, r);

      // 5. State Vector Arrow (pointing from center at vecAngle)
      const tipX = Math.cos(vecAngle) * (r * 0.72);
      const tipY = Math.sin(vecAngle) * (r * 0.72);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(tipX, tipY);
      ctx.strokeStyle = isHovered ? "#EF4444" : "#2563EB";
      ctx.lineWidth = 1.85;
      ctx.stroke();

      // State Vector Arrow Tip
      ctx.beginPath();
      ctx.arc(tipX, tipY, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? "#EF4444" : "#2563EB";
      ctx.fill();

      // Subtle Outer Halo Glow on Hover
      if (isHovered) {
        ctx.beginPath();
        ctx.arc(0, 0, r + 5, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(37, 99, 235, 0.4)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.restore();
    };

    // Render loop
    let frame = 0;
    const connectDist = 155; // Distance for inter-qubit neural connections
    const mouseHoverDist = 180; // Distance for mouse hover neural connections

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      const bounds = getGutterBounds(width);

      // If screen is too narrow to have side margins (e.g. mobile < 640px), keep canvas clear so reading is pristine
      if (!bounds.hasGutters) {
        animId = requestAnimationFrame(render);
        return;
      }

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mouseActive = mouseRef.current.active;

      // Check if mouse is in the left or right gutter zones
      const mouseInLeftGutter = mouseActive && mx < bounds.leftMax + 30;
      const mouseInRightGutter = mouseActive && mx > bounds.rightMin - 30;

      // 1. Update Positions and Rotation - STRICTLY WITHIN SIDE GUTTERS
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        // Vertical boundary rebound
        if (node.y < 35) {
          node.y = 35;
          node.vy = Math.abs(node.vy);
        } else if (node.y > height - 35) {
          node.y = height - 35;
          node.vy = -Math.abs(node.vy);
        }

        // Horizontal boundary rebound: NEVER enter the central reading area!
        if (node.side === "left") {
          if (node.x < bounds.leftMin) {
            node.x = bounds.leftMin;
            node.vx = Math.abs(node.vx);
          } else if (node.x > bounds.leftMax) {
            // Deflect back towards left screen edge
            node.x = bounds.leftMax;
            node.vx = -Math.abs(node.vx);
          }
        } else {
          if (node.x < bounds.rightMin) {
            // Deflect back towards right screen edge
            node.x = bounds.rightMin;
            node.vx = Math.abs(node.vx);
          } else if (node.x > bounds.rightMax) {
            node.x = bounds.rightMax;
            node.vx = -Math.abs(node.vx);
          }
        }

        // Idle rotation
        node.rotation += node.rotSpeed;

        // Interactive mouse gravity & speedup when cursor is in the same side gutter
        const isNearMouse =
          (node.side === "left" && mouseInLeftGutter) ||
          (node.side === "right" && mouseInRightGutter);

        if (isNearMouse) {
          const dx = mx - node.x;
          const dy = my - node.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouseHoverDist) {
            node.rotation += node.rotSpeed * 2.8;
            node.x += (dx / dist) * 0.24;
            node.y += (dy / dist) * 0.24;
          }
        }
      }

      // 2. Render Qubit Neural Connections (SAME SIDE ONLY - NEVER CROSSES CONTENT)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];

          // STRICT CHECK: Only connect nodes on the same side!
          if (n1.side !== n2.side) continue;

          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.hypot(dx, dy);

          if (dist < connectDist) {
            const distFactor = 1 - dist / connectDist;
            const lineAlpha = distFactor * 0.45;

            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = `rgba(15, 23, 42, ${lineAlpha})`;
            ctx.lineWidth = 1.15;
            ctx.stroke();

            // Quantum Energy Pulses traveling along neural links
            const pulsePhase = (frame * 0.022 + i * 1.6 + j * 0.9) % 1;
            if (distFactor > 0.3) {
              const px = n1.x + dx * pulsePhase;
              const py = n1.y + dy * pulsePhase;

              ctx.beginPath();
              ctx.arc(px, py, 1.9, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(37, 99, 235, ${lineAlpha * 1.9})`;
              ctx.fill();
            }
          }
        }
      }

      // 3. Render Active Mouse Neural Connections (Cursor Hover Entanglement in Gutter)
      if (mouseInLeftGutter || mouseInRightGutter) {
        const activeSide = mouseInLeftGutter ? "left" : "right";

        for (const node of nodes) {
          if (node.side !== activeSide) continue;

          const dx = mx - node.x;
          const dy = my - node.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouseHoverDist) {
            const distFactor = 1 - dist / mouseHoverDist;
            const lineAlpha = distFactor * 0.85;

            // Royal Blue Glowing Neural Connection to Cursor
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(mx, my);
            ctx.strokeStyle = `rgba(37, 99, 235, ${lineAlpha})`;
            ctx.lineWidth = 1.75;
            ctx.stroke();

            // Animated Quantum Energy Pulse traveling to cursor
            const pulseSpeed = 0.055;
            const pulsePos = (frame * pulseSpeed + dist * 0.02) % 1;
            const px = node.x + dx * pulsePos;
            const py = node.y + dy * pulsePos;

            ctx.beginPath();
            ctx.arc(px, py, 2.6, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(37, 99, 235, ${Math.min(1, lineAlpha + 0.35)})`;
            ctx.fill();
          }
        }

        // Quantum cursor focal dot in the gutter
        ctx.beginPath();
        ctx.arc(mx, my, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(37, 99, 235, 0.75)";
        ctx.fill();
      }

      // 4. Render Mini Bloch Sphere Qubit Nodes (In Sides Only)
      for (const node of nodes) {
        const isHovered =
          ((node.side === "left" && mouseInLeftGutter) ||
            (node.side === "right" && mouseInRightGutter)) &&
          Math.hypot(mx - node.x, my - node.y) < mouseHoverDist;

        drawBlochSphereIcon(
          ctx,
          node.x,
          node.y,
          node.radius,
          node.rotation,
          node.vectorAngle,
          isHovered
        );
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-20"
      style={{
        background: "transparent",
        width: "100vw",
        height: "100vh",
      }}
    />
  );
};
