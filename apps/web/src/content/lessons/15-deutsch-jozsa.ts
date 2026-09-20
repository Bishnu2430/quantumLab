import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "deutsch-jozsa",
  slug: "deutsch-jozsa",
  order: 15,
  title: "The Deutsch–Jozsa Algorithm",
  subtitle: "One query where classical needs two",
  summary:
    "The first algorithm to beat every classical method, why phase kickback is the mechanism, and what the speedup does and does not prove.",
  difficulty: "advanced",
  estimatedMinutes: 26,
  prerequisites: ["cnot-and-two-qubit-gates", "measurement-and-born-rule"],
  objectives: [
    "State the promise problem the algorithm solves",
    "Explain phase kickback and where the phase ends up",
    "Trace the one-qubit case and predict the measurement",
    "Say honestly what the exponential separation is worth",
  ],
  sections: [
    {
      id: "problem",
      title: "The promise",
      blocks: [
        {
          kind: "prose",
          text: "You are given a black box computing f: {0,1}ⁿ → {0,1}, with a promise: f is either **constant** (the same output for every input) or **balanced** (0 for exactly half the inputs, 1 for the other half). Decide which. You are not asked what f is, only which of the two kinds it belongs to.",
        },
        {
          kind: "comparison",
          title: "Queries required",
          columns: ["Classical", "Quantum"],
          rows: [
            { aspect: "Worst case, n = 1", left: "2", right: "1" },
            { aspect: "Worst case, general n", left: "2ⁿ⁻¹ + 1", right: "1" },
            { aspect: "Why", left: "Half the inputs can all return 0 before one differs", right: "Interference reads a global property in a single pass" },
            { aspect: "Randomised, small error", left: "O(1) — a handful of samples suffices", right: "1, with certainty" },
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "The honest caveat, stated up front",
          text: "The exponential gap is against *exact* classical algorithms. Allow a randomised classical algorithm a small error probability and a few random samples settle it almost always. Deutsch–Jozsa is a landmark because it was the first provable separation, not because the problem matters — and it is a promise problem nobody needs solved.",
        },
      ],
    },
    {
      id: "kickback",
      title: "Phase kickback",
      blocks: [
        {
          kind: "prose",
          text: "The oracle is given as a reversible unitary U_f|x⟩|y⟩ = |x⟩|y ⊕ f(x)⟩, which writes the answer into a second register. The trick is to prepare that second register so the answer comes back as a phase on the *first* one instead.",
        },
        {
          kind: "derivation",
          title: "How the phase moves registers",
          premise: "Put the target qubit in |−⟩ = (|0⟩ − |1⟩)/√2 and apply U_f to |x⟩|−⟩.",
          steps: [
            {
              title: "Apply the oracle term by term",
              latex: "U_f|x\\rangle\\tfrac{1}{\\sqrt{2}}(|0\\rangle - |1\\rangle) = |x\\rangle\\tfrac{1}{\\sqrt{2}}\\left(|f(x)\\rangle - |1 \\oplus f(x)\\rangle\\right)",
              explanation: "The XOR acts on each component of the target separately.",
            },
            {
              title: "Consider f(x) = 0",
              latex: "\\tfrac{1}{\\sqrt{2}}(|0\\rangle - |1\\rangle) = |{-}\\rangle",
              explanation: "Nothing changes: the target is left exactly as it was.",
            },
            {
              title: "Consider f(x) = 1",
              latex: "\\tfrac{1}{\\sqrt{2}}(|1\\rangle - |0\\rangle) = -|{-}\\rangle",
              explanation: "The two components swap, which is the same state multiplied by −1.",
            },
            {
              title: "Collect both cases",
              latex: "U_f|x\\rangle|{-}\\rangle = (-1)^{f(x)}|x\\rangle|{-}\\rangle",
              explanation:
                "The target is unchanged in every case, and the answer has appeared as a sign on the input register. That sign is what later interferes.",
            },
          ],
          conclusion:
            "With the target in |−⟩, the oracle marks inputs with a phase instead of writing a bit. Phase kickback is the workhorse of Deutsch–Jozsa, Grover and phase estimation alike.",
        },
      ],
    },
    {
      id: "algorithm",
      title: "The one-qubit case",
      blocks: [
        {
          kind: "prose",
          text: "For n = 1 the question is whether f(0) = f(1). Classically that needs both values. Quantum mechanically it needs one oracle call, because interference compares the two branches rather than reading them.",
        },
        {
          kind: "derivation",
          title: "Why the answer lands deterministically",
          premise: "Prepare |0⟩|1⟩, apply H to both, call the oracle once, then H the input qubit.",
          steps: [
            {
              title: "Superpose the inputs",
              latex: "H|0\\rangle = \\tfrac{1}{\\sqrt{2}}(|0\\rangle + |1\\rangle)",
              explanation: "Both inputs are now present with equal amplitude, ready to be marked in one pass.",
            },
            {
              title: "Let the oracle mark them",
              latex: "\\to \\tfrac{1}{\\sqrt{2}}\\left((-1)^{f(0)}|0\\rangle + (-1)^{f(1)}|1\\rangle\\right)",
              explanation: "Phase kickback attaches one sign to each branch, in a single query.",
            },
            {
              title: "Interfere with a final Hadamard",
              latex: "f(0) = f(1) \\Rightarrow \\pm|0\\rangle, \\qquad f(0) \\neq f(1) \\Rightarrow \\pm|1\\rangle",
              explanation:
                "Equal signs make the state ±|+⟩, which H maps to |0⟩. Opposite signs make it ±|−⟩, which H maps to |1⟩. The two cases land on orthogonal outcomes.",
            },
          ],
          conclusion:
            "Measure the input qubit: 0 means constant, 1 means balanced, with certainty. The answer depends on the *relationship* between f(0) and f(1), which is precisely what a single classical query cannot see.",
        },
        {
          kind: "misconception",
          claim: "The quantum computer evaluated f on all inputs at once, so it did exponentially more work.",
          correction:
            "It applied the oracle once to a superposition, and got back one number. It never learns f(0) or f(1) individually — measuring would give one random value and destroy the rest. What it extracts is a single global property, and only because interference was arranged so that property survives while everything else cancels. 'Evaluated everything' is the wrong picture; 'asked one carefully chosen question' is the right one.",
        },
      ],
    },
  ],
  visual: {
    renderer: "quantum-data-plot",
    title: "Where the amplitude ends up",
    caption:
      "For a balanced oracle the two branches acquire opposite signs, so the final Hadamard sends every bit of amplitude to |1⟩ and none to |0⟩. Constant oracles do the reverse.",
    props: {
      mode: "amplitude-steps",
      signed: true,
      steps: [
        { label: "after H", amplitudes: { "0": 0.7071, "1": 0.7071 } },
        { label: "after oracle", amplitudes: { "0": 0.7071, "1": -0.7071 } },
        { label: "after final H", amplitudes: { "0": 0, "1": 1 } },
      ],
      annotate: { "0": "cancels exactly — never measured for a balanced oracle" },
    },
  },
  circuit: {
    title: "Deutsch's algorithm with a balanced oracle",
    description:
      "The oracle here is f(x) = x, implemented as a CNOT — balanced. The input qubit (q0) reads 1 with certainty, so both outcome strings end in 1.",
    numQubits: 2,
    numClbits: 2,
    operations: [
      { id: "op-x", gate: "x", targets: [1], note: "Sets the target qubit to |1⟩ so the next Hadamard makes it |−⟩." },
      { id: "op-h0", gate: "h", targets: [0], note: "Superposes both inputs on the query register." },
      { id: "op-h1", gate: "h", targets: [1], note: "Puts the target into |−⟩, arming phase kickback." },
      {
        id: "op-oracle",
        gate: "cx",
        targets: [1],
        controls: [0],
        note: "The oracle for f(x) = x — a balanced function. Its answer returns as a phase on q0, not as a bit on q1.",
      },
      { id: "op-h0b", gate: "h", targets: [0], note: "Interferes the two marked branches. Opposite signs send all amplitude to |1⟩." },
    ],
    // q0 is 1 with certainty; q1 remains in |-> and is uniform.
    expected: { "00": 0.0, "01": 0.5, "10": 0.0, "11": 0.5 },
  },
  code: {
    title: "All four one-bit oracles",
    description:
      "Runs the algorithm against every possible f on one bit — two constant, two balanced — and confirms the measurement identifies the class each time.",
    language: "python",
    code: `import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

def deutsch(kind: str) -> str:
    qc = QuantumCircuit(2)
    qc.x(1)
    qc.h(0)
    qc.h(1)

    if kind == "constant-0":
        pass                      # f(x) = 0: the oracle does nothing
    elif kind == "constant-1":
        qc.x(1)                   # f(x) = 1: flips the target regardless of x
    elif kind == "balanced-id":
        qc.cx(0, 1)               # f(x) = x
    elif kind == "balanced-not":
        qc.cx(0, 1)               # f(x) = NOT x
        qc.x(1)

    qc.h(0)

    probabilities = Statevector.from_instruction(qc).probabilities([0])
    return "constant" if probabilities[0] > 0.5 else "balanced"

print("oracle          truth       measured")
for kind in ("constant-0", "constant-1", "balanced-id", "balanced-not"):
    truth = "constant" if kind.startswith("constant") else "balanced"
    result = deutsch(kind)
    mark = "ok" if truth == result else "MISMATCH"
    print(f"{kind:15} {truth:11} {result:9} {mark}")

print()
print("One oracle call per row. Classically, distinguishing constant from")
print("balanced with certainty needs both f(0) and f(1).")`,
    expectedOutput: ["One oracle call per row"],
  },
  keyTakeaways: [
    "The problem is a promise: decide whether f is constant or balanced, not what f is",
    "Phase kickback puts the oracle's answer on the input register as a sign, leaving the target untouched",
    "Interference converts the relationship between branches into a deterministic measurement",
    "One query suffices where exact classical methods need 2ⁿ⁻¹ + 1",
    "The separation collapses against randomised classical algorithms — the value is historical, not practical",
  ],
  references: [
    { source: "Deutsch & Jozsa, Rapid solution of problems by quantum computation", locator: "Proc. R. Soc. A 439, 553 (1992)" },
    { source: "Nielsen & Chuang, Quantum Computation and Quantum Information", locator: "§1.4.3–1.4.4" },
  ],
};
