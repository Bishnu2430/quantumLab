"use client";

import React, { useState } from "react";
import { Play, CheckCircle2, XCircle } from "lucide-react";
import { SimulationResult } from "@/lib/api/quantum";

interface OptionSpec {
  id: string;
  label: string;
  correct: boolean;
  explanation: string;
}

interface PredictionPanelProps {
  questionTitle: string;
  circuitDescription: string;
  options: OptionSpec[];
  onRunSimulation: () => Promise<SimulationResult>;
}

export const PredictionPanel: React.FC<PredictionPanelProps> = ({
  questionTitle,
  circuitDescription,
  options,
  onRunSimulation,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedOption = options.find((o) => o.id === selectedOptionId);

  const handleSimulate = async () => {
    if (!selectedOptionId) return;
    setIsSimulating(true);
    setErrorMsg(null);
    try {
      const res = await onRunSimulation();
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to execute simulation");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h3 className="font-bold text-base text-slate-900">1. Predict</h3>
          <p className="text-xs text-slate-500 mt-0.5">{questionTitle}</p>
        </div>

        <span className="font-mono text-xs px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded shrink-0 font-medium">
          Circuit: {circuitDescription}
        </span>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-mono text-slate-500 block">Select your prediction:</label>
        <div className="grid grid-cols-1 gap-2">
          {options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  setSelectedOptionId(opt.id);
                  setResult(null);
                }}
                className={`w-full text-left p-3 rounded-lg border text-xs font-medium transition ${
                  isSelected
                    ? "bg-indigo-50 border-indigo-600 text-indigo-950 font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="font-bold mr-2 text-indigo-600">{opt.id}.</span>
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={handleSimulate}
          disabled={!selectedOptionId || isSimulating}
          className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-xs transition disabled:opacity-40 shadow-sm"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          {isSimulating ? "2. Running simulation..." : "2. Run circuit & compare"}
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
          {errorMsg}
        </div>
      )}

      {result && selectedOption && (
        <div
          className={`p-4 rounded-lg border space-y-2 text-xs ${
            selectedOption.correct
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-amber-50 border-amber-300 text-amber-900"
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            {selectedOption.correct ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>3. Correct prediction</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-amber-600" />
                <span>3. Check explanation</span>
              </>
            )}
          </div>

          <p className="leading-relaxed">{selectedOption.explanation}</p>

          <div className="bg-white p-3 rounded border border-slate-200 font-mono text-xs text-slate-800 flex justify-between">
            <span>Measured probabilities:</span>
            <span className="text-indigo-600 font-bold">
              {Object.entries(result.probabilities)
                .map(([k, v]) => `|${k}⟩: ${(v * 100).toFixed(1)}%`)
                .join(" · ")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
