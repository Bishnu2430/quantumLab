"use client";

import React, { useState, useEffect } from "react";
import { QuantumIR, QuantumOperation, SimulationResult, ExecutionState, runQuantumSimulation, validateSimulationResult } from "@/lib/api/quantum";
import { GatePalette, PALETTE_GATES, GateInfo } from "@/components/quantum/GatePalette";
import { CircuitCanvas } from "@/components/quantum/CircuitCanvas";
import { GateInspector } from "@/components/ui/GateInspector";
import { ProbabilityChart } from "@/components/visualization/ProbabilityChart";
import { StateVectorVisualizer } from "@/components/visualization/StateVectorVisualizer";
import { BlochSphere } from "@/components/visualization/BlochSphere";
import { ExecutionPipelineStepper } from "@/components/playground/ExecutionPipelineStepper";
import { ExecutionExplanationAccordion } from "@/components/playground/ExecutionExplanationAccordion";
import { ShotsExplanationPanel } from "@/components/playground/ShotsExplanationPanel";
import { PredictionPanel } from "@/components/playground/PredictionPanel";
import { AlertCircle, Cpu, CheckCircle2 } from "lucide-react";

export const QuantumWorkspace: React.FC = () => {
  const [selectedGate, setSelectedGate] = useState<GateInfo | null>(PALETTE_GATES[0]);
  const [selectedOp, setSelectedOp] = useState<QuantumOperation | null>(null);
  const [shots, setShots] = useState<number>(1024);
  const [executionState, setExecutionState] = useState<ExecutionState>("IDLE");
  const [circuit, setCircuit] = useState<QuantumIR>({
    numQubits: 2,
    numClbits: 2,
    operations: [
      { id: "op-1", gate: "h", targets: [0], moment: 0 },
      { id: "op-2", gate: "cx", controls: [0], targets: [1], moment: 1 },
      { id: "op-3", gate: "measure", targets: [0], clbits: [0], moment: 2 },
      { id: "op-4", gate: "measure", targets: [1], clbits: [1], moment: 2 },
    ],
  });

  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRunSimulation = async (shotsToUse: number = shots) => {
    setIsLoading(true);
    setExecutionState("VALIDATING");
    setErrorMsg(null);

    try {
      setExecutionState("SUBMITTING");
      setExecutionState("SIMULATING");
      const res = await runQuantumSimulation({
        circuit,
        options: { shots: shotsToUse, mode: "both" },
      });

      setExecutionState("PROCESSING_RESULT");
      setSimulationResult(res);
      setExecutionState("COMPLETE");
    } catch (err: any) {
      setExecutionState("ERROR");
      setErrorMsg(err.message || "Simulation backend unavailable");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleRunSimulation(shots);
  }, [shots]);

  const updateCircuit = (newCircuit: QuantumIR) => {
    setCircuit(newCircuit);
    setExecutionState("IDLE");
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-8">
      {/* Status Bar Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F1F5F9] p-3 px-4 rounded-lg border border-[#CBD5E1] text-xs font-mono">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#2563EB]" />
          <span className="font-bold text-[#0F172A]">Quantum Workspace</span>
          <span className="text-[#CBD5E1]">|</span>
          <span className="text-[#334155] font-bold">Backend: <strong className="text-[#2563EB]">Qiskit Aer</strong></span>
        </div>

        <div className="flex items-center gap-4 text-[#334155] font-bold">
          <span>Execution State: <strong className={`px-2 py-0.5 rounded border text-[11px] ${
            executionState === "COMPLETE"
              ? "bg-[#F0FDF4] text-[#166534] border-[#86EFAC]"
              : executionState === "ERROR"
              ? "bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5]"
              : "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]"
          }`}>{executionState}</strong></span>

          {simulationResult && executionState === "COMPLETE" && (
            <>
              <span>Duration: <strong className="text-[#166534]">{simulationResult.durationMs} ms</strong></span>
              <span>Depth: <strong className="text-[#0F172A]">{simulationResult.circuitDepth}</strong></span>
            </>
          )}
        </div>
      </div>

      {/* Backend Exception / Error Banner */}
      {errorMsg && (
        <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] font-bold rounded-lg text-xs flex items-center justify-between font-sans">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#DC2626]" />
            <span>Simulation Backend Unavailable: {errorMsg}</span>
          </div>
          <button onClick={() => handleRunSimulation(shots)} className="px-2.5 py-1 bg-[#DC2626] text-white rounded font-bold">Retry Execution</button>
        </div>
      )}

      {/* QUANTUM GATE & CIRCUIT ELEMENT PALETTE */}
      <GatePalette
        selectedGate={selectedGate}
        onSelectGate={setSelectedGate}
      />

      {/* PREDICTION PANEL (PREDICT BEFORE RUN) */}
      <PredictionPanel
        result={simulationResult}
        onRunSimulation={() => handleRunSimulation(shots)}
        isLoading={isLoading}
      />

      {/* Main Scientific Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* CENTER COLUMN: Visual Circuit Workspace (Col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          <CircuitCanvas
            circuit={circuit}
            onChangeCircuit={updateCircuit}
            selectedGate={selectedGate}
            onRunSimulation={() => handleRunSimulation(shots)}
            isLoading={isLoading}
            selectedOperation={selectedOp}
            onSelectOperation={setSelectedOp}
          />
        </div>

        {/* RIGHT COLUMN: Results & Visualizers (Col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-4 space-y-4 bg-white border border-[#CBD5E1] rounded-xl font-mono text-xs">
            <div className="text-xs font-mono text-[#2563EB] font-bold uppercase tracking-wider">Simulation Results</div>

            <ProbabilityChart
              probabilities={simulationResult?.probabilities || {}}
              counts={simulationResult?.counts}
              shots={simulationResult?.shots}
            />

            <StateVectorVisualizer statevector={simulationResult?.statevector} />

            <BlochSphere statevector={simulationResult?.statevector} qubitIndex={0} />
          </div>
        </div>
      </div>

      {/* 8-STAGE END-TO-END EXECUTION PIPELINE STEPPER */}
      <ExecutionPipelineStepper
        circuit={circuit}
        result={simulationResult}
        isLoading={isLoading}
        shots={shots}
      />

      {/* SHOTS SAMPLING EXPLANATION PANEL */}
      <ShotsExplanationPanel
        result={simulationResult}
        shots={shots}
        onShotsChange={(newShots) => {
          setShots(newShots);
          handleRunSimulation(newShots);
        }}
      />

      {/* WHAT HAPPENS WHEN I CLICK RUN ACCORDION */}
      <ExecutionExplanationAccordion />

      {/* BOTTOM PANEL: Gate Inspector */}
      <GateInspector operation={selectedOp || (circuit.operations[0] || null)} />
    </div>
  );
};
