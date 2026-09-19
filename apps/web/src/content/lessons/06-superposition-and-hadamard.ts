import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "superposition-and-hadamard",
  slug: "superposition-and-hadamard",
  order: 6,
  title: "Superposition and the Hadamard Gate",
  subtitle: "Creating superposition, and undoing it with interference",
  summary:
    "The Hadamard gate builds an equal superposition — and applying it twice returns the original state exactly. That second fact, not the first, is where quantum computing gets its power.",
  difficulty: "beginner",
  estimatedMinutes: 25,
  prerequisites: ["the-qubit"],
  objectives: [
    "Compute H|0⟩ and H|1⟩ by matrix multiplication",
    "Explain why H|0⟩ and H|1⟩ are indistinguishable under a Z-basis measurement",
    "Show that H² = I and identify which amplitudes cancel",
    "Distinguish a quantum superposition from a classical random bit by experiment",
  ],
  sections: [
    {
      id: "the-gate",
      title: "The Hadamard gate",
      blocks: [
        {
          kind: "prose",
          text: "Every quantum gate on one qubit is a 2×2 **unitary** matrix: $U^\\dagger U = I$. Unitarity is what guarantees that a normalised state stays normalised, and it is why every quantum gate is reversible. The Hadamard gate is the standard way to move between the computational basis and an equal superposition.",
        },
        {
          kind: "equation",
          latex: "H = \\frac{1}{\\sqrt{2}}\\begin{bmatrix} 1 & 1 \\\\ 1 & -1 \\end{bmatrix}",
          caption: "The Hadamard matrix. Note the single minus sign — everything below turns on it.",
        },
        {
          kind: "derivation",
          title: "Applying H to each basis state",
          premise: "Write |0⟩ and |1⟩ as column vectors and multiply.",
          steps: [
            {
              title: "H acting on |0⟩",
              latex: "H|0\\rangle = \\frac{1}{\\sqrt{2}}\\begin{bmatrix} 1 & 1 \\\\ 1 & -1 \\end{bmatrix}\\begin{bmatrix} 1 \\\\ 0 \\end{bmatrix} = \\frac{1}{\\sqrt{2}}\\begin{bmatrix} 1 \\\\ 1 \\end{bmatrix} = |+\\rangle",
              explanation:
                "Multiplying by (1,0)ᵀ selects the first column. Both entries are positive, giving equal amplitudes with the same sign.",
            },
            {
              title: "H acting on |1⟩",
              latex: "H|1\\rangle = \\frac{1}{\\sqrt{2}}\\begin{bmatrix} 1 & 1 \\\\ 1 & -1 \\end{bmatrix}\\begin{bmatrix} 0 \\\\ 1 \\end{bmatrix} = \\frac{1}{\\sqrt{2}}\\begin{bmatrix} 1 \\\\ -1 \\end{bmatrix} = |-\\rangle",
              explanation:
                "Now the second column is selected, and its lower entry carries the minus sign. The magnitudes are identical to the previous case; only the relative phase differs.",
            },
            {
              title: "Check the probabilities",
              latex: "\\left|\\tfrac{1}{\\sqrt{2}}\\right|^2 = \\tfrac{1}{2} \\quad \\text{for every component of both results}",
              explanation:
                "Both |+⟩ and |−⟩ give 50/50 in the computational basis. A Z-basis measurement cannot distinguish them at all.",
            },
          ],
          conclusion:
            "H maps the poles of the Bloch sphere to opposite points on the equator. |+⟩ and |−⟩ look identical when measured in the Z basis, yet they are orthogonal states — the difference lives entirely in the relative phase.",
        },
      ],
    },
    {
      id: "interference",
      title: "H twice: interference in its simplest form",
      blocks: [
        {
          kind: "prose",
          text: "If the Hadamard gate merely *randomised* the qubit, applying it twice would leave you with a random bit. Instead it returns the original state, with certainty. Working through why is the most economical demonstration of interference available.",
        },
        {
          kind: "derivation",
          title: "H(H|0⟩) = |0⟩",
          premise: "We established H|0⟩ = (|0⟩ + |1⟩)/√2. Apply H once more, using linearity.",
          steps: [
            {
              title: "Distribute H over the superposition",
              latex: "H\\left(\\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}\\right) = \\frac{1}{\\sqrt{2}}\\left(H|0\\rangle + H|1\\rangle\\right)",
              explanation:
                "Gates are linear operators, so H acts on each component independently. This is the step that makes interference possible: both branches evolve, then recombine.",
            },
            {
              title: "Substitute the two results from before",
              latex: "= \\frac{1}{\\sqrt{2}}\\left(\\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}} + \\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}}\\right) = \\frac{1}{2}\\Big[(|0\\rangle + |1\\rangle) + (|0\\rangle - |1\\rangle)\\Big]",
              explanation: "Each branch is itself a superposition. Now collect terms in |0⟩ and |1⟩.",
            },
            {
              title: "Collect the amplitude of |0⟩",
              latex: "\\tfrac{1}{2}\\left(+1\\right) + \\tfrac{1}{2}\\left(+1\\right) = 1",
              explanation:
                "Both contributions carry the same sign, so they reinforce. This is constructive interference.",
            },
            {
              title: "Collect the amplitude of |1⟩",
              latex: "\\tfrac{1}{2}\\left(+1\\right) + \\tfrac{1}{2}\\left(-1\\right) = 0",
              explanation:
                "The contributions carry opposite signs and cancel exactly. This is destructive interference — and it is impossible for classical probabilities, which are non-negative and can never cancel.",
            },
          ],
          conclusion:
            "H²|0⟩ = |0⟩ with probability 1. The |1⟩ outcome is not merely unlikely; its amplitude is exactly zero. H is its own inverse: H² = I.",
        },
        {
          kind: "callout",
          tone: "insight",
          title: "This is the whole trick, in miniature",
          text: "Grover's algorithm and Shor's algorithm are elaborate versions of the cancellation you just performed. Spread amplitude across many states, arrange for the unwanted ones to acquire opposite signs, let them cancel, and measure what survives. Everything else is engineering.",
        },
        {
          kind: "misconception",
          claim: "A qubit in superposition is secretly either 0 or 1, and we just don't know which.",
          correction:
            "If |+⟩ were secretly 0 or 1 with equal probability, applying H again would give 50/50 — because H|0⟩ and H|1⟩ each give 50/50. Experiment says otherwise: you get 0 every time. A hidden definite value cannot produce that. The qubit is in a definite state, |+⟩; what is indefinite is the outcome of a Z measurement, which is a different thing.",
        },
      ],
    },
    {
      id: "test",
      title: "Telling superposition apart from randomness",
      blocks: [
        {
          kind: "prose",
          text: "The comparison below is a genuine experimental test, not an analogy. The two columns make different predictions for the same procedure, and the circuit you can run on this page settles it.",
        },
        {
          kind: "comparison",
          title: "Two competing accounts of H|0⟩",
          columns: ["Classical coin flip", "Quantum superposition"],
          rows: [
            {
              aspect: "State after one H",
              left: "Definitely 0 or definitely 1, unknown to us",
              right: "|+⟩ = (|0⟩+|1⟩)/√2, a definite state",
            },
            { aspect: "Measure now", left: "50/50", right: "50/50 — indistinguishable so far" },
            {
              aspect: "Apply a second H, then measure",
              left: "Still 50/50: a second flip of an already-random bit stays random",
              right: "0 with certainty: the |1⟩ amplitudes cancel",
            },
            { aspect: "What the simulator gives", left: "—", right: "1024 out of 1024 shots read 0" },
          ],
        },
      ],
    },
  ],
  visual: {
    renderer: "quantum-data-plot",
    title: "Amplitudes through the circuit",
    caption:
      "Signed amplitudes, not probabilities — the point is the minus sign. Step through and watch the |1⟩ contributions arrive with opposite signs and annihilate at the final step.",
    props: {
      mode: "amplitude-steps",
      signed: true,
      steps: [
        { label: "|0⟩", amplitudes: { "0": 1, "1": 0 } },
        { label: "after H", amplitudes: { "0": 0.7071, "1": 0.7071 } },
        { label: "after H·H", amplitudes: { "0": 1, "1": 0 } },
      ],
      annotate: { "1": "amplitudes cancel: +½ + (−½) = 0" },
    },
  },
  circuit: {
    title: "Two Hadamards",
    description:
      "Run it and look at the counts: every shot returns 0. Delete the second H and it becomes 50/50 — the difference between the two is interference.",
    numQubits: 1,
    numClbits: 1,
    operations: [
      { id: "op-h1", gate: "h", targets: [0], note: "Creates |+⟩ — equal amplitudes, both positive." },
      {
        id: "op-h2",
        gate: "h",
        targets: [0],
        note: "Recombines the branches. The |1⟩ amplitudes have opposite signs and cancel exactly.",
      },
      { id: "op-m", gate: "measure", targets: [0], clbits: [0], note: "Always reads 0." },
    ],
    expected: { "0": 1.0, "1": 0.0 },
  },
  code: {
    title: "Interference, step by step",
    description:
      "Prints the signed amplitudes after each gate, so you can watch the |1⟩ component go to exactly zero rather than merely becoming unlikely.",
    language: "python",
    code: `import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

def show(label, qc):
    amps = Statevector.from_instruction(qc).data
    parts = "   ".join(f"{basis}: {amp.real:+.4f}" for basis, amp in zip("01", amps))
    print(f"{label:<12} {parts}")

qc = QuantumCircuit(1)
show("initial", qc)

qc.h(0)
show("after H", qc)

qc.h(0)
show("after H.H", qc)

final = Statevector.from_instruction(qc).data
print()
print(f"P(0) = {abs(final[0])**2:.6f}")
print(f"P(1) = {abs(final[1])**2:.6f}   <- exactly zero, not just small")

# The same conclusion, stated as an identity on the matrix.
H = np.array([[1, 1], [1, -1]]) / np.sqrt(2)
print()
print("H @ H =")
print(np.round(H @ H, 10))
print(f"H is its own inverse: {np.allclose(H @ H, np.eye(2))}")`,
    expectedOutput: ["P(1) = 0.000000", "H is its own inverse: True"],
  },
  keyTakeaways: [
    "H maps |0⟩ to |+⟩ and |1⟩ to |−⟩ — equal probabilities, differing only in relative phase",
    "|+⟩ and |−⟩ are indistinguishable in the Z basis yet orthogonal, so some other measurement separates them perfectly",
    "H² = I: applying H twice restores the original state exactly",
    "The |1⟩ amplitude cancels to exactly zero, which classical probabilities can never do",
    "Superposition is not ignorance about a hidden value — the two-Hadamard experiment rules that out",
  ],
  references: [
    { source: "Nielsen & Chuang, Quantum Computation and Quantum Information", locator: "§1.3.1, §4.2" },
    { source: "IBM Quantum Learning, Basics of Quantum Information", url: "https://learning.quantum.ibm.com/" },
  ],
};
