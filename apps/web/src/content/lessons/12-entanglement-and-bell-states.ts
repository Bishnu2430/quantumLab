import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "entanglement-and-bell-states",
  slug: "entanglement-and-bell-states",
  order: 12,
  title: "Entanglement and the Bell States",
  subtitle: "Correlations with no local explanation",
  summary:
    "The four Bell states, why they cannot be factored, what a reduced density matrix reveals, and why perfect correlation still carries no signal.",
  difficulty: "intermediate",
  estimatedMinutes: 26,
  prerequisites: ["cnot-and-two-qubit-gates"],
  objectives: [
    "Prepare all four Bell states and tell them apart",
    "Prove that a Bell state cannot be written as a product",
    "Compute a reduced density matrix and read off what it means",
    "Explain why entanglement cannot transmit information",
  ],
  sections: [
    {
      id: "bell-states",
      title: "Four maximally entangled states",
      blocks: [
        {
          kind: "prose",
          text: "Take H on the first qubit followed by a CNOT. Which of the four basis states you start from decides which Bell state you get, and the four together form an orthonormal basis for the two-qubit space.",
        },
        {
          kind: "equation",
          latex: "|\\Phi^{\\pm}\\rangle = \\frac{|00\\rangle \\pm |11\\rangle}{\\sqrt{2}}, \\qquad |\\Psi^{\\pm}\\rangle = \\frac{|01\\rangle \\pm |10\\rangle}{\\sqrt{2}}",
          caption:
            "The Bell basis. Φ states agree on both qubits, Ψ states disagree, and the sign is a relative phase.",
        },
        {
          kind: "comparison",
          title: "Preparing each one",
          columns: ["Input to H · CNOT", "Result"],
          rows: [
            { aspect: "|00⟩", left: "no preparation", right: "|Φ⁺⟩ — always agree" },
            { aspect: "|01⟩", left: "X on the target first", right: "|Ψ⁺⟩ — always disagree" },
            { aspect: "|10⟩", left: "X on the control first", right: "|Φ⁻⟩ — agree, with a relative minus" },
            { aspect: "|11⟩", left: "X on both first", right: "|Ψ⁻⟩ — disagree, with a relative minus; the singlet" },
          ],
        },
        {
          kind: "callout",
          tone: "insight",
          title: "The sign is not cosmetic",
          text: "|Φ⁺⟩ and |Φ⁻⟩ give identical statistics in the computational basis — 50% agree, every time. Measure both qubits in the X basis instead and they separate completely. Teleportation and superdense coding both rely on the four being perfectly distinguishable.",
        },
      ],
    },
    {
      id: "not-a-product",
      title: "It genuinely does not factor",
      blocks: [
        {
          kind: "derivation",
          title: "|Φ⁺⟩ cannot be written as a product",
          premise:
            "Suppose it could: |Φ⁺⟩ = (a|0⟩ + b|1⟩) ⊗ (c|0⟩ + d|1⟩) for some complex a, b, c, d.",
          steps: [
            {
              title: "Expand the assumed product",
              latex: "= ac|00\\rangle + ad|01\\rangle + bc|10\\rangle + bd|11\\rangle",
              explanation: "Four amplitudes, each a product of one factor from each qubit.",
            },
            {
              title: "Match against the target",
              latex: "ac = \\tfrac{1}{\\sqrt{2}}, \\quad ad = 0, \\quad bc = 0, \\quad bd = \\tfrac{1}{\\sqrt{2}}",
              explanation: "The |01⟩ and |10⟩ amplitudes of |Φ⁺⟩ are zero, so those products must vanish.",
            },
            {
              title: "Follow the consequences",
              latex: "ad = 0 \\Rightarrow a = 0 \\text{ or } d = 0",
              explanation:
                "If a = 0 then ac = 0, contradicting ac = 1/√2. If d = 0 then bd = 0, contradicting bd = 1/√2. Either branch is impossible.",
            },
          ],
          conclusion:
            "No four complex numbers satisfy all four equations, so |Φ⁺⟩ is not a product state. The two qubits have no individual states — only the pair has a state.",
        },
      ],
    },
    {
      id: "reduced",
      title: "What one half looks like on its own",
      blocks: [
        {
          kind: "prose",
          text: "If the pair has a state but neither qubit does, what does an experimenter holding only one of them see? The answer comes from tracing the other qubit out of the density matrix.",
        },
        {
          kind: "equation",
          latex: "\\rho_A = \\mathrm{Tr}_B\\left(|\\Phi^+\\rangle\\langle\\Phi^+|\\right) = \\frac{1}{2}\\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix} = \\frac{I}{2}",
          caption:
            "The reduced state of one half of a Bell pair is maximally mixed — no information at all.",
        },
        {
          kind: "prose",
          text: "That is a striking result. The joint state is pure and completely specified, yet each half on its own is as uninformative as a state can possibly be. The information is not stored in either qubit; it lives entirely in the correlation between them.",
        },
        {
          kind: "comparison",
          title: "Purity as a test",
          columns: ["Tr(ρ²) = 1", "Tr(ρ²) < 1"],
          rows: [
            { aspect: "Meaning", left: "Pure state", right: "Mixed state" },
            { aspect: "One qubit of a product state", left: "Yes — pure", right: "—" },
            { aspect: "One qubit of a Bell pair", left: "—", right: "Tr(ρ²) = ½, maximally mixed" },
            { aspect: "Bloch vector length", left: "1, on the sphere's surface", right: "0, at the centre" },
          ],
        },
      ],
    },
    {
      id: "no-signalling",
      title: "Why no message gets through",
      blocks: [
        {
          kind: "prose",
          text: "Measure your half of a Bell pair and the distant half is instantly determined. It is tempting to read that as faster-than-light communication, and it is worth seeing exactly where the argument fails.",
        },
        {
          kind: "prose",
          text: "Before you measure, the far qubit's reduced state is I/2. After you measure, it is |0⟩ or |1⟩ — but which one is random and outside your control, and averaged over the outcomes you cannot influence, the far reduced state is *still* I/2. Nothing the distant party can measure changes at all.",
        },
        {
          kind: "misconception",
          claim: "Since measuring one qubit instantly fixes the other, entanglement sends information faster than light.",
          correction:
            "The receiver's statistics are identical whether or not you measured, and identical regardless of what you chose to measure — this is the no-communication theorem, provable in a few lines. The correlation is only visible once both parties compare results over an ordinary classical channel, which travels no faster than light. Entanglement is a shared resource, not a wire.",
        },
      ],
    },
  ],
  visual: {
    renderer: "entanglement-studio",
    title: "Entanglement studio",
    caption:
      "Measure one qubit and watch the other resolve. Each individual outcome stays random no matter what you do — the pattern only appears once both columns are compared side by side.",
  },
  circuit: {
    title: "Preparing |Φ⁺⟩",
    description:
      "Two gates produce maximal entanglement. The outcomes are always equal, never mixed — |01⟩ and |10⟩ have exactly zero amplitude, not merely small ones.",
    numQubits: 2,
    numClbits: 2,
    operations: [
      { id: "op-h", gate: "h", targets: [0], note: "Puts qubit 0 into |+⟩, so the CNOT sees a superposed control." },
      {
        id: "op-cx",
        gate: "cx",
        targets: [1],
        controls: [0],
        note: "Fires on the |1⟩ branch only, correlating the two qubits and destroying any separate description of either.",
      },
    ],
    expected: { "00": 0.5, "01": 0.0, "10": 0.0, "11": 0.5 },
  },
  code: {
    title: "Reduced states and the Bell basis",
    description:
      "Builds all four Bell states, confirms they are orthonormal, and traces out one qubit to show that each half is maximally mixed.",
    language: "python",
    code: `import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, partial_trace, purity

def bell(first_x: bool, second_x: bool) -> Statevector:
    qc = QuantumCircuit(2)
    if first_x:
        qc.x(0)
    if second_x:
        qc.x(1)
    qc.h(0)
    qc.cx(0, 1)
    return Statevector.from_instruction(qc)

states = {
    "Phi+": bell(False, False),
    "Psi+": bell(False, True),
    "Phi-": bell(True, False),
    "Psi-": bell(True, True),
}

for name, state in states.items():
    amps = np.round(state.data.real, 4)
    print(f"{name}: {amps}")

print()
print("Pairwise overlaps (0 means orthogonal):")
names = list(states)
for i in range(len(names)):
    for j in range(i + 1, len(names)):
        overlap = abs(np.vdot(states[names[i]].data, states[names[j]].data))
        print(f"  <{names[i]}|{names[j]}> = {overlap:.6f}")

phi_plus = states["Phi+"]
reduced = partial_trace(phi_plus, [1])
print()
print("Reduced state of qubit 0:")
print(np.round(reduced.data.real, 4))
print(f"purity of the pair  : {purity(phi_plus).real:.4f}  (1 = pure)")
print(f"purity of one half  : {purity(reduced).real:.4f}  (0.5 = maximally mixed)")
print()
print("The pair is in a perfectly definite state while each half carries")
print("no information at all. The content lives in the correlation.")`,
    expectedOutput: ["purity of one half  : 0.5000", "purity of the pair  : 1.0000"],
  },
  keyTakeaways: [
    "The four Bell states form an orthonormal basis and are all maximally entangled",
    "|Φ⁺⟩ provably has no factorisation — the two qubits have no individual states",
    "Tracing out one qubit of a Bell pair leaves I/2: a pure pair whose halves are maximally mixed",
    "Purity Tr(ρ²) distinguishes pure from mixed, and equals ½ for half of a Bell pair",
    "The far qubit's statistics are unchanged by your measurement, so no information is transmitted",
  ],
  references: [
    { source: "Nielsen & Chuang, Quantum Computation and Quantum Information", locator: "§1.3.6, §2.4–2.5" },
    { source: "Einstein, Podolsky & Rosen", locator: "Phys. Rev. 47, 777 (1935)" },
    { source: "Peres, Quantum Theory: Concepts and Methods", locator: "Chapter 6" },
  ],
};
