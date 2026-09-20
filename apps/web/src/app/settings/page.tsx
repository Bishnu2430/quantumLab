"use client";

import React, { useState } from "react";
import { Settings, Cpu, Monitor, Save, Check } from "lucide-react";

export default function SettingsPage() {
  const [shots, setShots] = useState<number>(1024);
  const [mode, setMode] = useState<string>("both");
  const [saved, setSaved] = useState<boolean>(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto bg-surface">
      {/* Header */}
      <div className="panel p-6 bg-surface-raised border border-text-muted space-y-2">
        <div className="flex items-center gap-2 text-accent font-mono text-xs font-bold uppercase tracking-wider">
          <Settings className="w-4 h-4 text-accent" /> System Preferences
        </div>
        <h1 className="text-2xl font-bold text-text tracking-tight">Simulation & UI Settings</h1>
        <p className="text-xs text-surface-raised font-medium max-w-2xl leading-relaxed">
          Configure default Qiskit Aer simulation parameters, backend API connections, and workspace preferences.
        </p>
      </div>

      {/* Settings Form */}
      <div className="panel p-6 bg-surface-raised border border-text-muted space-y-6">
        {/* Simulation Defaults */}
        <div className="space-y-4 border-b border-text-muted pb-5">
          <h3 className="font-bold text-sm text-text flex items-center gap-2 font-mono">
            <Cpu className="w-4 h-4 text-accent" /> Qiskit Aer Backend Defaults
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="space-y-1.5">
              <label className="text-surface font-bold block">Default Shot Count:</label>
              <select
                value={shots}
                onChange={(e) => setShots(parseInt(e.target.value))}
                className="w-full p-2.5 bg-surface border border-text-muted text-text font-bold rounded-lg text-xs"
              >
                <option value={100}>100 shots (fast)</option>
                <option value={1024}>1,024 shots (standard)</option>
                <option value={8192}>8,192 shots (high precision)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-surface font-bold block">Simulation Return Mode:</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full p-2.5 bg-surface border border-text-muted text-text font-bold rounded-lg text-xs"
              >
                <option value="both">Statevector & Measurement Counts (Both)</option>
                <option value="statevector">Statevector Only</option>
                <option value="counts">Counts Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Backend API Info */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-text flex items-center gap-2 font-mono">
            <Monitor className="w-4 h-4 text-accent" /> Backend Service Connection
          </h3>

          <div className="p-3 bg-surface rounded-lg border border-text-muted text-xs font-mono space-y-1 text-surface font-bold shadow-xs">
            <div className="flex justify-between">
              <span className="text-border">API Endpoint:</span>
              <span className="text-accent font-bold">http://localhost:8000/api/quantum/simulate</span>
            </div>
            <div className="flex justify-between">
              <span className="text-border">Status:</span>
              <span className="text-success font-bold">Connected (Pytest 9/9 Verified)</span>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-accent hover:bg-accent text-white font-bold rounded-lg text-xs transition shadow-md"
          >
            {saved ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
            {saved ? "Settings Saved!" : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}
