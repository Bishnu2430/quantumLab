export interface QuantumOperation {
  id: string;
  gate: "h" | "x" | "y" | "z" | "s" | "t" | "rx" | "ry" | "rz" | "cx" | "cz" | "swap" | "ccx" | "toffoli" | "measure" | "barrier";
  targets: number[];
  controls?: number[];
  clbits?: number[];
  params?: number[];
  moment?: number;
}

export interface QuantumIR {
  numQubits: number;
  numClbits: number;
  operations: QuantumOperation[];
}

export interface SimulationOptions {
  shots?: number;
  mode?: "statevector" | "shots" | "both";
  seed?: number;
}

export interface SimulationRequest {
  circuit: QuantumIR;
  options?: SimulationOptions;
}

export interface ComplexAmplitude {
  state: string;
  real: number;
  imag: number;
  magnitude: number;
  phase: number;
}

export interface SimulationResult {
  backend: string;
  numQubits: number;
  shots: number;
  counts?: Record<string, number>;
  probabilities: Record<string, number>;
  statevector?: ComplexAmplitude[];
  durationMs: number;
  circuitDepth: number;
}

export type ExecutionState =
  | "IDLE"
  | "VALIDATING"
  | "SUBMITTING"
  | "SIMULATING"
  | "PROCESSING_RESULT"
  | "COMPLETE"
  | "ERROR";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Validates simulation result consistency against physical quantum rules.
 */
export function validateSimulationResult(result: SimulationResult): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check 1: Counts sum to shots
  if (result.counts) {
    const totalCounts = Object.values(result.counts).reduce((acc, c) => acc + c, 0);
    if (Math.abs(totalCounts - result.shots) > 0) {
      errors.push(`Shot count sum mismatch: ${totalCounts} counts observed, expected ${result.shots} shots.`);
    }
  }

  // Check 2: Probabilities sum to 1.0 within tolerance
  if (result.probabilities) {
    const probSum = Object.values(result.probabilities).reduce((acc, p) => acc + p, 0);
    if (Math.abs(probSum - 1.0) > 0.05) {
      errors.push(`Probability normalization error: sum = ${probSum.toFixed(4)}, expected 1.0.`);
    }
  }

  // Check 3: Statevector dimension equals 2^n
  if (result.statevector) {
    const expectedDim = 1 << result.numQubits;
    if (result.statevector.length !== expectedDim) {
      errors.push(`Statevector dimension mismatch: ${result.statevector.length} states, expected 2^${result.numQubits} = ${expectedDim}.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export async function runQuantumSimulation(req: SimulationRequest): Promise<SimulationResult> {
  const response = await fetch(`${API_BASE_URL}/api/v1/simulations/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Simulation request failed" }));
    throw new Error(errorData.detail?.message || errorData.detail || "Simulation execution failed");
  }

  const result: SimulationResult = await response.json();
  const consistency = validateSimulationResult(result);
  if (!consistency.isValid) {
    throw new Error(`Result validation failed: ${consistency.errors.join(" ")}`);
  }

  return result;
}

/**
 * Generates equivalent Python Qiskit script from QuantumIR circuit payload.
 */
export function generateQiskitPythonCode(circuit: QuantumIR, shots: number = 1024): string {
  const lines: string[] = [
    "from qiskit import QuantumCircuit",
    "from qiskit_aer import AerSimulator",
    "",
    `# Initialize ${circuit.numQubits}-qubit quantum circuit with ${circuit.numClbits} classical bits`,
    `qc = QuantumCircuit(${circuit.numQubits}, ${circuit.numClbits})`,
    "",
    "# Apply Quantum Operations:",
  ];

  if (!circuit.operations || circuit.operations.length === 0) {
    lines.push("# (Empty circuit: qubits remain in initial |0...0⟩ state)");
  } else {
    circuit.operations.forEach((op) => {
      const g = op.gate.toLowerCase();
      if (g === "h") lines.push(`qc.h(${op.targets[0]})`);
      else if (g === "x") lines.push(`qc.x(${op.targets[0]})`);
      else if (g === "y") lines.push(`qc.y(${op.targets[0]})`);
      else if (g === "z") lines.push(`qc.z(${op.targets[0]})`);
      else if (g === "s") lines.push(`qc.s(${op.targets[0]})`);
      else if (g === "t") lines.push(`qc.t(${op.targets[0]})`);
      else if (g === "rx") lines.push(`qc.rx(${op.params ? op.params[0] : "3.14159"}, ${op.targets[0]})`);
      else if (g === "ry") lines.push(`qc.ry(${op.params ? op.params[0] : "3.14159"}, ${op.targets[0]})`);
      else if (g === "rz") lines.push(`qc.rz(${op.params ? op.params[0] : "3.14159"}, ${op.targets[0]})`);
      else if (g === "cx") {
        const c = op.controls ? op.controls[0] : op.targets[0];
        const t = op.controls ? op.targets[0] : op.targets[1];
        lines.push(`qc.cx(${c}, ${t})`);
      } else if (g === "cz") {
        const c = op.controls ? op.controls[0] : op.targets[0];
        const t = op.controls ? op.targets[0] : op.targets[1];
        lines.push(`qc.cz(${c}, ${t})`);
      } else if (g === "swap") lines.push(`qc.swap(${op.targets[0]}, ${op.targets[1]})`);
      else if (g === "ccx" || g === "toffoli") {
        const c1 = op.controls ? op.controls[0] : 0;
        const c2 = op.controls ? op.controls[1] : 1;
        const t = op.targets[0];
        lines.push(`qc.ccx(${c1}, ${c2}, ${t})`);
      } else if (g === "measure") {
        const targetQ = op.targets[0];
        const targetC = op.clbits ? op.clbits[0] : 0;
        lines.push(`qc.measure(${targetQ}, ${targetC})`);
      } else if (g === "barrier") lines.push(`qc.barrier(${JSON.stringify(op.targets)})`);
    });
  }

  lines.push(
    "",
    "# Execute simulation using IBM Qiskit Aer",
    "simulator = AerSimulator()",
    `result = simulator.run(qc, shots=${shots}).result()`,
    "counts = result.get_counts()",
    "",
    'print("Measurement Counts:", counts)'
  );

  return lines.join("\n");
}
