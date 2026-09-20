import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "double-slit",
  slug: "double-slit",
  order: 2,
  title: "The Double Slit and Quantum Interference",
  subtitle: "The experiment that forces amplitudes on you",
  summary:
    "Why single particles build an interference pattern one hit at a time, why watching which path destroys it, and how the same effect appears in a two-gate quantum circuit.",
  difficulty: "beginner",
  estimatedMinutes: 20,
  prerequisites: ["what-is-quantum-computing"],
  objectives: [
    "Explain why the double-slit pattern cannot come from particles taking one slit or the other",
    "State what changes when which-path information becomes available",
    "Map the two slits onto the two branches of a quantum circuit",
    "Predict how the output changes as a relative phase is varied",
  ],
  sections: [
    {
      id: "experiment",
      title: "One particle at a time",
      blocks: [
        {
          kind: "prose",
          text: "Fire electrons at a barrier with two slits and record where each one lands. Every electron arrives as a single localised dot — there is no smearing, no half-electron. Yet as the dots accumulate, they build up bands: some positions collect many hits, others almost none.",
        },
        {
          kind: "prose",
          text: "The striking part is the positions that receive *nothing*. Open only the left slit and electrons land there. Open only the right slit and electrons land there too. Open **both** and that position goes dark. Adding a second way to arrive made arrival less likely.",
        },
        {
          kind: "callout",
          tone: "insight",
          title: "This is the argument for amplitudes in one sentence",
          text: "Classical probabilities are non-negative, so P(left) + P(right) can never be smaller than either term. A position that is reachable through either slit alone but unreachable through both cannot be described by adding probabilities. It can be described by adding amplitudes, which carry a sign.",
        },
        {
          kind: "equation",
          latex: "P = |\\psi_L + \\psi_R|^2 = |\\psi_L|^2 + |\\psi_R|^2 + 2\\,\\mathrm{Re}(\\overline{\\psi_L}\\psi_R)",
          caption:
            "Amplitudes add, then get squared. The final cross term is the interference, and it is the only term that can be negative.",
          where: [
            { symbol: "\\psi_L, \\psi_R", meaning: "amplitudes for arriving via the left and right slit" },
            { symbol: "2\\,\\mathrm{Re}(\\overline{\\psi_L}\\psi_R)", meaning: "interference term; negative where the pattern goes dark" },
          ],
        },
      ],
    },
    {
      id: "which-path",
      title: "Watching destroys the pattern",
      blocks: [
        {
          kind: "prose",
          text: "Place a detector at the slits to record which one each electron passes through, and the bands vanish. What remains is the simple sum of two single-slit patterns — exactly the classical prediction.",
        },
        {
          kind: "prose",
          text: "The usual gloss is that observation *disturbs* the electron. The sharper statement is that interference requires the two paths to be **indistinguishable**. Once anything in the universe records which path was taken, the amplitudes attach to different states of that recording device and no longer add.",
        },
        {
          kind: "misconception",
          claim: "The electron somehow knows it is being watched and changes its behaviour.",
          correction:
            "Nothing is aware of anything. Interference needs the two branches to end in the same final state so their amplitudes can combine. A which-path record makes the branches end in different states — detector-saw-left versus detector-saw-right — and amplitudes for different final states never interfere. You can even erase the record afterwards and recover the pattern, which rules out any 'disturbance' story.",
        },
      ],
    },
    {
      id: "circuit",
      title: "The same experiment with gates",
      blocks: [
        {
          kind: "prose",
          text: "A single qubit reproduces this exactly. The first Hadamard splits the state into two branches, like the two slits. A phase gate delays one branch relative to the other, like moving the detection screen. The second Hadamard recombines them, and the measured probabilities trace out fringes.",
        },
        {
          kind: "derivation",
          title: "Fringes from H · Rz(φ) · H",
          premise: "Start from |0⟩ and apply H, then Rz(φ), then H.",
          steps: [
            {
              title: "Split into two branches",
              latex: "H|0\\rangle = \\tfrac{1}{\\sqrt{2}}(|0\\rangle + |1\\rangle)",
              explanation: "Equal amplitude down each path, exactly as an electron reaches both slits.",
            },
            {
              title: "Delay one branch",
              latex: "R_z(\\varphi) \\to \\tfrac{1}{\\sqrt{2}}\\left(e^{-i\\varphi/2}|0\\rangle + e^{i\\varphi/2}|1\\rangle\\right)",
              explanation:
                "Rz applies opposite phases to the two components. This is the path-length difference that decides where you sit in the fringe pattern.",
            },
            {
              title: "Recombine",
              latex: "H \\to \\cos\\tfrac{\\varphi}{2}|0\\rangle - i\\sin\\tfrac{\\varphi}{2}|1\\rangle",
              explanation:
                "The second Hadamard brings the branches back together so their amplitudes add, with the accumulated phase deciding whether that addition reinforces or cancels.",
            },
          ],
          conclusion:
            "P(0) = cos²(φ/2). At φ = 0 the recombination is fully constructive and you always measure 0; at φ = π it is fully destructive and you never do. Sweeping φ sweeps you across the fringes.",
        },
      ],
    },
  ],
  visual: {
    renderer: "wave-interference",
    title: "Wave mechanics laboratory",
    caption:
      "Send particles through one slit at a time and watch the pattern build. Switch the which-path detector on and the bands collapse into two plain blobs.",
  },
  circuit: {
    title: "Interference fringes in a circuit",
    description:
      "The quantum analogue of the double slit. Change the Rz angle and the output probabilities move along the fringe curve P(0) = cos²(φ/2).",
    numQubits: 1,
    numClbits: 1,
    operations: [
      { id: "op-h1", gate: "h", targets: [0], note: "Splits the state into two equal branches — the two slits." },
      {
        id: "op-rz",
        gate: "rz",
        targets: [0],
        params: [Math.PI / 3],
        note: "Delays one branch relative to the other by φ = π/3, the path-length difference.",
      },
      { id: "op-h2", gate: "h", targets: [0], note: "Recombines the branches so their amplitudes interfere." },
    ],
    // cos²(π/6) = 3/4 exactly.
    expected: { "0": 0.75, "1": 0.25 },
  },
  code: {
    title: "Sweeping the phase to trace the fringes",
    description:
      "Runs the circuit across a range of phases and prints P(0) at each, reproducing the interference curve numerically.",
    language: "python",
    code: `import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

print("  phi      P(0)     cos^2(phi/2)   fringe")
for phi in np.linspace(0, 2 * np.pi, 9):
    qc = QuantumCircuit(1)
    qc.h(0)
    qc.rz(phi, 0)
    qc.h(0)

    p0 = abs(Statevector.from_instruction(qc).data[0]) ** 2
    theory = np.cos(phi / 2) ** 2
    bar = "#" * int(round(p0 * 30))
    print(f"{phi:6.3f}   {p0:.4f}   {theory:.4f}        {bar}")

print()
print("P(0) tracks cos^2(phi/2) exactly: the phase decides where on the")
print("fringe pattern you land. At phi = pi the two branches cancel.")`,
    expectedOutput: ["P(0) tracks cos^2(phi/2) exactly"],
  },
  keyTakeaways: [
    "A position reachable through either slit alone but dark when both are open cannot be explained by adding probabilities",
    "Amplitudes add and then get squared, producing a cross term that can be negative",
    "Interference requires the paths to be indistinguishable — a which-path record removes it, and erasing the record restores it",
    "H · Rz(φ) · H is the same experiment in circuit form, with P(0) = cos²(φ/2)",
  ],
  references: [
    { source: "Feynman, The Feynman Lectures on Physics, Volume III", locator: "Chapter 1" },
    { source: "Nielsen & Chuang, Quantum Computation and Quantum Information", locator: "§1.1" },
    { source: "Bach et al., Controlled double-slit electron diffraction", locator: "New J. Phys. 15, 033018 (2013)" },
  ],
};
