"use client";

import React, { useState } from "react";
import { QuantumIR, SimulationResult, generateQiskitPythonCode } from "@/lib/api/quantum";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Cpu, Layers, Code, Server, Zap, PieChart, Activity, Info } from "lucide-react";

interface ExecutionPipelineStepperProps {
  circuit: QuantumIR;
  result: SimulationResult | null;
  isLoading: boolean;
  shots: number;
}

const STAGES = [
  { id: 1, name: "Stage 1. Visual Circuit", icon: Layers, desc: "Reading visual circuit wires & gate sequence" },
  { id: 2, name: "Stage 2. Quantum IR", icon: Code, desc: "Serializing to Quantum IR v1 JSON payload" },
  { id: 3, name: "Stage 3. Qiskit Code", icon: Code, desc: "Transpiling to Qiskit Python QuantumCircuit" },
  { id: 4, name: "Stage 4. FastAPI Backend", icon: Server, desc: "Sending HTTP POST request to FastAPI engine" },
  { id: 5, name: "Stage 5. Qiskit Aer", icon: Cpu, desc: "Simulating on IBM Qiskit Aer C++ engine" },
  { id: 6, name: "Stage 6. Quantum State", icon: Zap, desc: "Computing exact Hilbert space statevector" },
  { id: 7, name: "Stage 7. Measurement", icon: Activity, desc: "Sampling projective measurement outcomes" },
  { id: 8, name: "Stage 8. Visual Results", icon: PieChart, desc: "Updating live probability & Bloch sphere charts" },
];

export const ExecutionPipelineStepper: React.FC<ExecutionPipelineStepperProps> = ({
  circuit,
  result,
  isLoading,
  shots,
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const activeStage = STAGES[currentStageIndex];

  // Auto-play timer handler
  React.useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStageIndex((prev) => {
          if (prev >= STAGES.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying]);

  const qiskitCode = generateQiskitPythonCode(circuit, shots);

  // FIX #10: Detailed unambiguous operation metrics breakdown
  const totalOps = circuit.operations ? circuit.operations.length : 0;
  const numGates = circuit.operations ? circuit.operations.filter((op) => op.gate !== "measure" && op.gate !== "barrier").length : 0;
  const numMeasures = circuit.operations ? circuit.operations.filter((op) => op.gate === "measure").length : 0;
  const numBarriers = circuit.operations ? circuit.operations.filter((op) => op.gate === "barrier").length : 0;

  const isMultiQubitEntangled = circuit.numQubits > 1;

  return (
    <div className="glass-panel p-6 bg-white border border-[#CBD5E1] rounded-xl space-y-5">
      {/* Header & Stepper Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div>
          <h3 className="font-bold text-base text-[#0F172A] flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#2563EB]" />
            End-to-End Quantum Execution Pipeline Visualizer
          </h3>
          <p className="text-xs text-[#334155] font-medium mt-0.5 font-sans">
            Follow how your visual circuit moves from Quantum IR to FastAPI, Qiskit Aer, and Quantum Statevector.
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setCurrentStageIndex(Math.max(0, currentStageIndex - 1))}
            disabled={currentStageIndex === 0}
            className="px-2.5 py-1 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] border border-[#CBD5E1] rounded font-bold disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4 inline" /> Prev
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1 px-3 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded font-bold shadow-xs"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            <span>{isPlaying ? "Pause" : "Play Process"}</span>
          </button>

          <button
            onClick={() => setCurrentStageIndex(Math.min(STAGES.length - 1, currentStageIndex + 1))}
            disabled={currentStageIndex === STAGES.length - 1}
            className="px-2.5 py-1 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] border border-[#CBD5E1] rounded font-bold disabled:opacity-40"
          >
            Next <ChevronRight className="w-4 h-4 inline" />
          </button>

          <button
            onClick={() => {
              setCurrentStageIndex(0);
              setIsPlaying(false);
            }}
            className="p-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] border border-[#CBD5E1] rounded"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 8-Stage Progress Tracker (FIX #1: Clean "Stage 1" Labels) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs font-mono">
        {STAGES.map((stage, idx) => {
          const isSelected = idx === currentStageIndex;
          const isCompleted = idx < currentStageIndex;
          const Icon = stage.icon;

          return (
            <button
              key={stage.id}
              onClick={() => {
                setCurrentStageIndex(idx);
                setIsPlaying(false);
              }}
              className={`p-2.5 rounded-lg border text-left flex flex-col justify-between space-y-1.5 transition-all ${
                isSelected
                  ? "bg-[#2563EB] text-white border-[#1D4ED8] shadow-xs font-bold ring-2 ring-[#2563EB] ring-offset-1 scale-105"
                  : isCompleted
                  ? "bg-[#F0FDF4] text-[#166534] border-[#86EFAC]"
                  : "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:border-[#CBD5E1]"
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-bold">Stage {stage.id}</span>
              </div>
              <span className="text-[11px] font-bold leading-tight truncate">{stage.name.split(". ")[1]}</span>
            </button>
          );
        })}
      </div>

      {/* Active Stage Detail Panel */}
      <div className="p-5 bg-[#F8FAFC] rounded-lg border border-[#CBD5E1] space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
          <span className="font-bold text-[#0F172A] text-sm flex items-center gap-2">
            <span className="bg-[#2563EB] text-white px-2 py-0.5 rounded text-xs">Stage {activeStage.id}</span>
            {activeStage.name}
          </span>
          <span className="text-[#64748B] text-[11px] font-medium">{activeStage.desc}</span>
        </div>

        {/* Stage Content */}
        {currentStageIndex === 0 && (
          <div className="space-y-2">
            <strong className="block text-[#0F172A]">Visual Circuit Wire Configuration:</strong>
            <div className="p-3 bg-white rounded border border-[#CBD5E1] space-y-1 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-bold text-[#0F172A]">
                <div>Qubits: <span className="text-[#2563EB]">{circuit.numQubits}</span></div>
                <div>Classical Bits: <span className="text-[#2563EB]">{circuit.numClbits}</span></div>
                <div>Quantum Gates: <span className="text-[#166534]">{numGates}</span></div>
                <div>Measurements: <span className="text-[#7E22CE]">{numMeasures}</span></div>
              </div>
              <div className="text-[11px] text-[#475569] pt-1">
                Total Operations: <strong>{totalOps}</strong> {numBarriers > 0 && `(including ${numBarriers} barriers)`} | Quantum Gate Depth: <strong>{result?.circuitDepth ?? "Evaluating..."}</strong>
              </div>
            </div>
            <p className="font-sans text-[#334155]">
              The user constructs a visual circuit on the canvas. The engine reads each gate placed on the qubit wires.
            </p>
          </div>
        )}

        {currentStageIndex === 1 && (
          <div className="space-y-2">
            <strong className="block text-[#0F172A]">Serialized Quantum IR v1 JSON Payload:</strong>
            <pre className="p-3 bg-white rounded border border-[#CBD5E1] font-bold text-[#0F172A] overflow-x-auto max-h-40">
              {JSON.stringify(circuit, null, 2)}
            </pre>
            <p className="font-sans text-[#334155]">
              Quantum IR v1 is the framework-neutral JSON circuit specification passed over HTTP POST to the backend API.
            </p>
          </div>
        )}

        {currentStageIndex === 2 && (
          <div className="space-y-2">
            <strong className="block text-[#0F172A]">Equivalent Qiskit Representation (Backend Qiskit QuantumCircuit constructed from Quantum IR):</strong>
            <pre className="p-3 bg-white rounded border border-[#CBD5E1] font-bold text-[#7E22CE] overflow-x-auto max-h-40">
              {qiskitCode}
            </pre>
            <div className="p-2.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded text-[11px] font-sans text-[#1E3A8A] flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
              <span>
                <strong>Technical Note:</strong> The backend programmatically constructs a native Qiskit <code>QuantumCircuit</code> instance directly from the Quantum IR specification.
              </span>
            </div>
          </div>
        )}

        {currentStageIndex === 3 && (
          <div className="space-y-2">
            <strong className="block text-[#0F172A]">FastAPI Backend Endpoint Execution:</strong>
            <div className="p-3 bg-white rounded border border-[#CBD5E1] space-y-1">
              <div><strong className="text-[#1E40AF]">Endpoint:</strong> POST http://localhost:8000/api/v1/simulations/run</div>
              <div><strong className="text-[#1E40AF]">CORS Configuration:</strong> Access-Control-Allow-Origin: Explicit Configured Origin</div>
              <div><strong className="text-[#166534]">Validation Status:</strong> IR Schema Validated (0 errors)</div>
            </div>
            <p className="font-sans text-[#334155]">
              FastAPI validates circuit bounds, checks qubit indices, and dispatches the payload to Qiskit Aer.
            </p>
          </div>
        )}

        {/* FIX #5: Stage 5 Scientific Dual Execution Path Description */}
        {currentStageIndex === 4 && (
          <div className="space-y-2">
            <strong className="block text-[#0F172A]">IBM Qiskit Aer C++ Execution Engine Architecture:</strong>
            <div className="p-3 bg-white rounded border border-[#CBD5E1] space-y-2">
              <div><strong className="text-[#2563EB]">Backend Engine:</strong> {result?.backend || "qiskit-aer"}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="p-2 bg-[#FAF5FF] border border-[#E9D5FF] rounded">
                  <strong className="text-[#7E22CE] block">Statevector Analysis Path:</strong>
                  <span>Exact <code>Statevector.from_instruction()</code> calculation for amplitudes $\alpha_i = a+bi$.</span>
                </div>
                <div className="p-2 bg-[#F0FDF4] border border-[#86EFAC] rounded">
                  <strong className="text-[#166534] block">Measurement Sampling Path:</strong>
                  <span>C++ <code>AerSimulator().run()</code> for {shots} Monte Carlo shots.</span>
                </div>
              </div>
              <div className="text-[#166534] pt-1">
                <strong>Actual Execution Duration:</strong> {result ? `${result.durationMs} ms` : isLoading ? "Simulating..." : "Ready"} | Gate Depth: <strong>{result?.circuitDepth ?? "N/A"}</strong>
              </div>
            </div>
          </div>
        )}

        {currentStageIndex === 5 && (
          <div className="space-y-2">
            <strong className="block text-[#0F172A]">Exact Quantum Hilbert Space Statevector:</strong>
            {result?.statevector ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {result.statevector.map((sv) => (
                  <div key={sv.state} className="p-2 bg-white rounded border border-[#CBD5E1] text-center">
                    <strong className="block text-[#2563EB]">|{sv.state}⟩</strong>
                    <span className="text-[11px] text-[#0F172A]">Magnitude: {sv.magnitude}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-white rounded border border-[#CBD5E1] text-[#64748B]">Statevector ready after simulation</div>
            )}
            <p className="font-sans text-[#334155]">
              Each computational basis state has a complex amplitude $\alpha_i = a + bi$. Probabilities are given by squared magnitudes $|\alpha_i|^2$.
            </p>
          </div>
        )}

        {currentStageIndex === 6 && (
          <div className="space-y-2">
            <strong className="block text-[#0F172A]">Projective Measurement Shot Sampling ({shots} Shots):</strong>
            {result?.counts ? (
              <div className="p-3 bg-white rounded border border-[#CBD5E1] space-y-1">
                {Object.entries(result.counts).map(([state, count]) => (
                  <div key={state} className="flex justify-between font-bold">
                    <span>State |{state}⟩:</span>
                    <span className="text-[#2563EB]">{count} shots ({((count / shots) * 100).toFixed(1)}%)</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-white rounded border border-[#CBD5E1] text-[#64748B]">Measurement counts ready after simulation</div>
            )}
            <p className="font-sans text-[#334155]">
              Projective Z-basis measurement collapses quantum superposition states into discrete classical bit outcomes.
            </p>
          </div>
        )}

        {/* FIX #6: Stage 8 Dynamic State-Aware Visualization Label */}
        {currentStageIndex === 7 && (
          <div className="space-y-2">
            <strong className="block text-[#0F172A]">Synchronized Visualizer Panels Updated:</strong>
            <div className="p-3 bg-white rounded border border-[#CBD5E1] font-bold text-[#166534]">
              {isMultiQubitEntangled ? (
                <span>✓ Probability Distribution | ✓ Complex Statevector | ✓ Reduced-State Density Analysis</span>
              ) : (
                <span>✓ Probability Distribution | ✓ Complex Statevector | ✓ 3D Bloch Sphere Vector</span>
              )}
            </div>
            <p className="font-sans text-[#334155]">
              All frontend visualization components render synchronized representation of the underlying quantum simulation response.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
