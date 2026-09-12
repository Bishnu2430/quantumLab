"use client";

import React, { useState } from "react";
import { QuantumIR, QuantumOperation } from "@/lib/api/quantum";
import { GateInfo, PALETTE_GATES } from "./GatePalette";
import { Trash2, RotateCcw, Plus, Minus, Play, AlertCircle, Info, X } from "lucide-react";

interface CircuitCanvasProps {
  circuit: QuantumIR;
  onChangeCircuit: (newCircuit: QuantumIR) => void;
  selectedGate: GateInfo | null;
  onRunSimulation: () => void;
  isLoading: boolean;
  selectedOperation?: QuantumOperation | null;
  onSelectOperation?: (op: QuantumOperation | null) => void;
  onSelectGate?: (gate: GateInfo) => void;
}

let opCounter = 100;
function generateOpId() {
  opCounter += 1;
  return `op-${opCounter}`;
}

export const CircuitCanvas: React.FC<CircuitCanvasProps> = ({
  circuit,
  onChangeCircuit,
  selectedGate,
  onRunSimulation,
  isLoading,
  selectedOperation,
  onSelectOperation,
  onSelectGate,
}) => {
  const MAX_MOMENTS = 8;
  const [controlQubit, setControlQubit] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleCellClick = (targetQubit: number, momentIndex: number) => {
    setValidationError(null);

    // Check if there is an existing operation at this slot
    const existingOp = circuit.operations.find(
      (op) => (op.targets.includes(targetQubit) || op.controls?.includes(targetQubit)) && op.moment === momentIndex
    );

    if (existingOp && onSelectOperation && controlQubit === null) {
      onSelectOperation(existingOp);
      return;
    }

    // Default to CX gate if user started in Control notation mode without selecting a gate
    const activeGate = selectedGate || PALETTE_GATES.find((g) => g.id === "cx") || PALETTE_GATES[9];

    if (activeGate.category === "multi" || activeGate.numControls > 0) {
      if (controlQubit === null) {
        setControlQubit(targetQubit);
      } else {
        if (controlQubit === targetQubit) {
          setValidationError(`q[${targetQubit}] cannot control itself. Choose a different target qubit.`);
          return;
        }

        const newOp: QuantumOperation = {
          id: generateOpId(),
          gate: activeGate.id as any,
          targets: [targetQubit],
          controls: [controlQubit],
          moment: momentIndex,
        };

        const filteredOps = circuit.operations.filter(
          (op) => !(op.targets.includes(targetQubit) && op.moment === momentIndex)
        );

        onChangeCircuit({
          ...circuit,
          operations: [...filteredOps, newOp],
        });

        if (onSelectOperation) onSelectOperation(newOp);
        setControlQubit(null);
      }
    } else {
      const newOp: QuantumOperation = {
        id: generateOpId(),
        gate: activeGate.id as any,
        targets: [targetQubit],
        clbits: activeGate.id === "measure" ? [targetQubit] : [],
        moment: momentIndex,
      };

      const filteredOps = circuit.operations.filter(
        (op) => !(op.targets.includes(targetQubit) && op.moment === momentIndex)
      );

      onChangeCircuit({
        ...circuit,
        operations: [...filteredOps, newOp],
      });

      if (onSelectOperation) onSelectOperation(newOp);
    }
  };

  const removeOperation = (qubitIndex: number, momentIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChangeCircuit({
      ...circuit,
      operations: circuit.operations.filter(
        (op) => !(op.targets.includes(qubitIndex) && op.moment === momentIndex)
      ),
    });
    if (onSelectOperation) onSelectOperation(null);
  };

  const clearCircuit = () => {
    onChangeCircuit({
      ...circuit,
      operations: [],
    });
    setControlQubit(null);
    setValidationError(null);
    if (onSelectOperation) onSelectOperation(null);
  };

  const loadPreset = (presetName: "bell" | "ghz" | "superposition" | "custom_test") => {
    if (presetName === "bell") {
      onChangeCircuit({
        numQubits: 2,
        numClbits: 2,
        operations: [
          { id: "op-1", gate: "h", targets: [0], moment: 0 },
          { id: "op-2", gate: "cx", controls: [0], targets: [1], moment: 1 },
          { id: "op-3", gate: "measure", targets: [0], clbits: [0], moment: 2 },
          { id: "op-4", gate: "measure", targets: [1], clbits: [1], moment: 2 },
        ],
      });
    } else if (presetName === "ghz") {
      onChangeCircuit({
        numQubits: 3,
        numClbits: 3,
        operations: [
          { id: "op-1", gate: "h", targets: [0], moment: 0 },
          { id: "op-2", gate: "cx", controls: [0], targets: [1], moment: 1 },
          { id: "op-3", gate: "cx", controls: [1], targets: [2], moment: 2 },
        ],
      });
    } else if (presetName === "superposition") {
      onChangeCircuit({
        numQubits: 4,
        numClbits: 4,
        operations: [
          { id: "op-1", gate: "h", targets: [0], moment: 0 },
          { id: "op-2", gate: "h", targets: [1], moment: 0 },
          { id: "op-3", gate: "h", targets: [2], moment: 0 },
          { id: "op-4", gate: "h", targets: [3], moment: 0 },
        ],
      });
    } else if (presetName === "custom_test") {
      // Test Circuit for Section 21:
      // q[0]: H -> ● -> H -> M
      // q[1]: X -> ⊕ -> ● -> M
      // q[2]: ────────── ⊕ -> M
      onChangeCircuit({
        numQubits: 3,
        numClbits: 3,
        operations: [
          { id: "op-101", gate: "h", targets: [0], moment: 0 },
          { id: "op-102", gate: "x", targets: [1], moment: 0 },
          { id: "op-103", gate: "cx", controls: [0], targets: [1], moment: 1 },
          { id: "op-104", gate: "h", targets: [0], moment: 2 },
          { id: "op-105", gate: "cx", controls: [1], targets: [2], moment: 3 },
          { id: "op-106", gate: "measure", targets: [0], clbits: [0], moment: 4 },
          { id: "op-107", gate: "measure", targets: [1], clbits: [1], moment: 4 },
          { id: "op-108", gate: "measure", targets: [2], clbits: [2], moment: 4 },
        ],
      });
    }
    setControlQubit(null);
    setValidationError(null);
    if (onSelectOperation) onSelectOperation(null);
  };

  const addQubit = () => {
    if (circuit.numQubits < 6) {
      onChangeCircuit({
        ...circuit,
        numQubits: circuit.numQubits + 1,
        numClbits: circuit.numClbits + 1,
      });
    }
  };

  const removeQubit = () => {
    if (circuit.numQubits > 1) {
      const targetCount = circuit.numQubits - 1;
      onChangeCircuit({
        numQubits: targetCount,
        numClbits: targetCount,
        operations: circuit.operations.filter(
          (op) => !op.targets.some((t) => t >= targetCount) && !op.controls?.some((c) => c >= targetCount)
        ),
      });
    }
  };

  return (
    <div className="glass-panel p-5 space-y-4 bg-white border border-[#CBD5E1] rounded-xl font-mono text-xs">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#F1F5F9] px-3 py-1.5 rounded-lg border border-[#CBD5E1] font-bold text-[#0F172A]">
            <span className="text-[#475569] mr-2">Qubits:</span>
            <span className="text-[#2563EB] font-black mr-3">{circuit.numQubits}</span>
            <button
              onClick={removeQubit}
              disabled={circuit.numQubits <= 1}
              className="p-1 hover:bg-[#E2E8F0] rounded disabled:opacity-30 text-[#0F172A] font-bold"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={addQubit}
              disabled={circuit.numQubits >= 6}
              className="p-1 hover:bg-[#E2E8F0] rounded disabled:opacity-30 text-[#0F172A] font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[#475569] font-bold">Presets:</span>
            <button
              onClick={() => loadPreset("bell")}
              className="px-2.5 py-1 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] rounded border border-[#BFDBFE] font-bold transition shadow-xs"
            >
              Bell State (|Φ⁺⟩)
            </button>
            <button
              onClick={() => loadPreset("ghz")}
              className="px-2.5 py-1 bg-[#FAF5FF] hover:bg-[#F3E8FF] text-[#7E22CE] rounded border border-[#E9D5FF] font-bold transition shadow-xs"
            >
              GHZ State (3-Qubit)
            </button>
            <button
              onClick={() => loadPreset("custom_test")}
              className="px-2.5 py-1 bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#166534] rounded border border-[#86EFAC] font-bold transition shadow-xs"
            >
              3-Qubit Multi-Wire Test
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearCircuit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] rounded-lg border border-[#CBD5E1] transition font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#2563EB]" /> Clear
          </button>

          <button
            onClick={onRunSimulation}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-lg shadow-xs transition-all active:scale-95 disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-white text-white" />
            {isLoading ? "Simulating..." : "Run Simulation ▶"}
          </button>
        </div>
      </div>

      {/* Controlled Gate Placement Banner */}
      {controlQubit !== null && (
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E3A8A] font-bold text-xs px-3.5 py-2 rounded-lg flex items-center justify-between font-sans">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#2563EB] shrink-0" />
            <span>
              <strong>{selectedGate?.name || "Controlled-NOT"} Placement:</strong> Control qubit q[{controlQubit}] selected. Click target qubit row on canvas to complete.
            </span>
          </div>
          <button
            onClick={() => setControlQubit(null)}
            className="px-2 py-0.5 bg-white text-[#DC2626] rounded border border-[#FCA5A5] font-bold text-[11px] hover:bg-[#FEF2F2]"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Validation Error Banner */}
      {validationError && (
        <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] font-bold text-xs px-3.5 py-2 rounded-lg flex items-center justify-between font-sans">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span>{validationError}</span>
          </div>
          <button onClick={() => setValidationError(null)} className="p-0.5 text-[#991B1B] hover:text-[#DC2626]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Visual Quantum Wire Grid Canvas */}
      <div className="overflow-x-auto py-2">
        <div className="min-w-[600px] space-y-4">
          {Array.from({ length: circuit.numQubits }).map((_, qIdx) => (
            <div key={qIdx} className="flex items-center gap-3">
              <div className="w-16 shrink-0 flex items-center justify-between px-2.5 py-1.5 bg-[#F1F5F9] rounded border border-[#CBD5E1] font-mono text-xs font-bold text-[#0F172A] shadow-xs">
                <span>q[{qIdx}]</span>
                <span className="text-[10px] text-[#2563EB] font-bold">|0⟩</span>
              </div>

              <div className="relative flex-1 flex items-center h-12 bg-[#F8FAFC] rounded-lg border border-[#CBD5E1] px-2">
                <div className="absolute left-0 right-0 h-0.5 bg-[#CBD5E1] pointer-events-none" />

                <div className="relative z-10 w-full grid grid-cols-8 gap-2">
                  {Array.from({ length: MAX_MOMENTS }).map((_, mIdx) => {
                    const opAtCell = circuit.operations.find(
                      (op) => (op.targets.includes(qIdx) || op.controls?.includes(qIdx)) && op.moment === mIdx
                    );

                    const isControlCell = opAtCell && opAtCell.controls?.includes(qIdx);
                    const isSelectedOp = selectedOperation && opAtCell && selectedOperation.id === opAtCell.id;

                    return (
                      <div
                        key={mIdx}
                        onClick={() => handleCellClick(qIdx, mIdx)}
                        className={`h-9 rounded border flex items-center justify-center cursor-pointer transition-all ${
                          opAtCell
                            ? isSelectedOp
                              ? "bg-[#EFF6FF] border-[#2563EB] ring-2 ring-[#2563EB] shadow-xs font-bold"
                              : "bg-white border-[#CBD5E1] hover:border-[#2563EB] shadow-xs font-bold"
                            : "border-dashed border-[#CBD5E1] hover:border-[#2563EB] hover:bg-[#EFF6FF]"
                        }`}
                      >
                        {opAtCell && (
                          <div className="relative group w-full h-full flex items-center justify-center" title={`Operation ID: ${opAtCell.id}`}>
                            {isControlCell ? (
                              <div className="w-4 h-4 rounded-full bg-[#2563EB] border border-white shadow-xs flex items-center justify-center text-white text-[10px] font-bold">
                                ●
                              </div>
                            ) : opAtCell.gate === "cx" ? (
                              <div className="w-6 h-6 rounded-full bg-[#EFF6FF] border-2 border-[#2563EB] text-[#2563EB] flex items-center justify-center font-bold text-sm shadow-xs">
                                ⊕
                              </div>
                            ) : opAtCell.gate === "cz" ? (
                              <div className="w-6 h-6 rounded bg-[#FAF5FF] border border-[#E9D5FF] text-[#7E22CE] flex items-center justify-center font-bold text-xs shadow-xs">
                                Z
                              </div>
                            ) : opAtCell.gate === "swap" ? (
                              <div className="w-6 h-6 rounded bg-[#F0FDF4] border border-[#86EFAC] text-[#166534] flex items-center justify-center font-bold text-xs shadow-xs">
                                ×
                              </div>
                            ) : opAtCell.gate === "measure" ? (
                              <div className="w-6 h-6 rounded bg-[#F1F5F9] border border-[#CBD5E1] text-[#0F172A] flex items-center justify-center font-bold text-xs shadow-xs">
                                M
                              </div>
                            ) : opAtCell.gate === "barrier" ? (
                              <div className="w-6 h-6 rounded bg-[#F8FAFC] border border-[#CBD5E1] text-[#64748B] flex items-center justify-center font-bold text-xs shadow-xs">
                                ║
                              </div>
                            ) : (
                              <div
                                className={`w-full h-full rounded ${
                                  PALETTE_GATES.find((g) => g.id === opAtCell.gate)?.colorClass || "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]"
                                } flex items-center justify-center font-bold text-xs shadow-xs`}
                              >
                                {opAtCell.gate.toUpperCase()}
                              </div>
                            )}

                            <button
                              onClick={(e) => removeOperation(qIdx, mIdx, e)}
                              className="absolute -top-1.5 -right-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
