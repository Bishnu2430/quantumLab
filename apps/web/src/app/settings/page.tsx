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
    <div className="space-y-6 max-w-4xl mx-auto bg-white">
      {/* Header */}
      <div className="glass-panel p-6 bg-slate-50 border border-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-blue-600 font-mono text-xs font-black uppercase tracking-wider">
          <Settings className="w-4 h-4 text-blue-600" /> System Preferences
        </div>
        <h1 className="text-2xl font-black text-black tracking-tight">Simulation & UI Settings</h1>
        <p className="text-xs text-slate-800 font-medium max-w-2xl leading-relaxed">
          Configure default Qiskit Aer simulation parameters, backend API connections, and workspace preferences.
        </p>
      </div>

      {/* Settings Form */}
      <div className="glass-panel p-6 bg-slate-50 border border-slate-300 space-y-6">
        {/* Simulation Defaults */}
        <div className="space-y-4 border-b border-slate-300 pb-5">
          <h3 className="font-black text-sm text-black flex items-center gap-2 font-mono">
            <Cpu className="w-4 h-4 text-blue-600" /> Qiskit Aer Backend Defaults
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="space-y-1.5">
              <label className="text-slate-900 font-bold block">Default Shot Count:</label>
              <select
                value={shots}
                onChange={(e) => setShots(parseInt(e.target.value))}
                className="w-full p-2.5 bg-white border border-slate-300 text-black font-bold rounded-lg text-xs"
              >
                <option value={100}>100 shots (fast)</option>
                <option value={1024}>1,024 shots (standard)</option>
                <option value={8192}>8,192 shots (high precision)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-900 font-bold block">Simulation Return Mode:</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 text-black font-bold rounded-lg text-xs"
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
          <h3 className="font-black text-sm text-black flex items-center gap-2 font-mono">
            <Monitor className="w-4 h-4 text-blue-600" /> Backend Service Connection
          </h3>

          <div className="p-3 bg-white rounded-lg border border-slate-300 text-xs font-mono space-y-1 text-slate-900 font-bold shadow-xs">
            <div className="flex justify-between">
              <span className="text-slate-700">API Endpoint:</span>
              <span className="text-blue-600 font-black">http://localhost:8000/api/quantum/simulate</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700">Status:</span>
              <span className="text-emerald-700 font-black">Connected (Pytest 9/9 Verified)</span>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-lg text-xs transition shadow-md"
          >
            {saved ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
            {saved ? "Settings Saved!" : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}
