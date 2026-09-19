"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Node {
  id: string;
  label: string;
  lesson?: string;
  emphasis?: boolean;
  terminal?: boolean;
}

interface Edge {
  from: string;
  to: string;
  label?: string;
}

interface Props {
  nodes: Node[];
  edges: Edge[];
}

/**
 * Concept graph with a deterministic radial layout.
 *
 * Positions are computed from the node count rather than randomised or
 * force-directed, so the same lesson always renders the same diagram and edge
 * labels can be placed at midpoints without colliding. Hovering a node dims
 * everything it does not touch, which is what makes a dense graph readable.
 */
export const ConceptMapVisual: React.FC<Props> = ({ nodes, edges }) => {
  const [hovered, setHovered] = useState<string | null>(null);

  const positions = layout(nodes);
  const connected = (id: string) =>
    hovered === null ||
    hovered === id ||
    edges.some((e) => (e.from === hovered && e.to === id) || (e.to === hovered && e.from === id));

  return (
    <div className="panel p-4">
      <svg viewBox="0 0 420 300" className="w-full h-auto" role="img"
           aria-label="Concept map linking the core ideas of quantum computing">
        {edges.map((edge) => {
          const from = positions[edge.from];
          const to = positions[edge.to];
          if (!from || !to) return null;

          const active = hovered === null || hovered === edge.from || hovered === edge.to;
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;

          return (
            <g key={`${edge.from}-${edge.to}`} opacity={active ? 1 : 0.15}>
              <line
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                className="stroke-viz-axis" strokeWidth={hovered === edge.from || hovered === edge.to ? 2 : 1}
                markerEnd="url(#concept-arrow)"
              />
              {edge.label && (
                // Label sits on the edge midpoint with a filled backing rect so
                // it stays readable where lines cross beneath it.
                <g>
                  <rect x={midX - edge.label.length * 2.6} y={midY - 6}
                        width={edge.label.length * 5.2} height={12} rx={3}
                        className="fill-canvas" />
                  <text x={midX} y={midY + 3} textAnchor="middle"
                        className="fill-viz-label text-[8px] font-mono">
                    {edge.label}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        <defs>
          <marker id="concept-arrow" viewBox="0 0 10 10" refX="26" refY="5"
                  markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-viz-axis" />
          </marker>
        </defs>

        {nodes.map((node) => {
          const position = positions[node.id];
          if (!position) return null;
          const dim = !connected(node.id);

          const circle = (
            <g
              opacity={dim ? 0.25 : 1}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
              className={node.lesson ? "cursor-pointer" : ""}
            >
              <circle
                cx={position.x} cy={position.y} r="24"
                className={
                  node.emphasis
                    ? "fill-accent-soft stroke-accent"
                    : node.terminal
                      ? "fill-danger-soft stroke-danger-border"
                      : "fill-surface-raised stroke-border-strong"
                }
                strokeWidth={node.emphasis ? 2 : 1}
              />
              <text x={position.x} y={position.y + 3} textAnchor="middle"
                    className={`text-[8px] font-semibold ${
                      node.emphasis ? "fill-accent-text" : "fill-text"
                    }`}>
                {truncate(node.label)}
              </text>
            </g>
          );

          return node.lesson ? (
            <Link key={node.id} href={`/learn/${node.lesson}`} aria-label={`Go to ${node.label}`}>
              {circle}
            </Link>
          ) : (
            <React.Fragment key={node.id}>{circle}</React.Fragment>
          );
        })}
      </svg>

      <p className="mt-3 pt-3 border-t border-border text-[11px] text-text-subtle">
        Hover a concept to isolate its connections. Circled concepts link to the lesson
        that develops them.
      </p>
    </div>
  );
};

/** Radial layout: the emphasised node anchors the centre, the rest ring it. */
function layout(nodes: Node[]): Record<string, { x: number; y: number }> {
  const centre = nodes.find((n) => n.emphasis) ?? nodes[0];
  const others = nodes.filter((n) => n.id !== centre.id);

  const positions: Record<string, { x: number; y: number }> = {
    [centre.id]: { x: 210, y: 150 },
  };

  others.forEach((node, index) => {
    const angle = (index / others.length) * globalThis.Math.PI * 2 - globalThis.Math.PI / 2;
    positions[node.id] = {
      x: 210 + globalThis.Math.cos(angle) * 140,
      y: 150 + globalThis.Math.sin(angle) * 105,
    };
  });

  return positions;
}

function truncate(label: string): string {
  return label.length > 13 ? `${label.slice(0, 12)}…` : label;
}
