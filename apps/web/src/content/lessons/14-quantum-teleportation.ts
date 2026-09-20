import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "quantum-teleportation",
  slug: "quantum-teleportation",
  order: 14,
  title: "Quantum Teleportation",
  subtitle: "Moving a state without moving a qubit",
  summary:
    "How an unknown state crosses a room using one entangled pair and two classical bits, why no-cloning forces the original to be destroyed, and why it is not faster-than-light.",
  difficulty: "advanced",
  estimatedMinutes: 28,
  prerequisites: ["entanglement-and-bell-states"],
  objectives: [
    "Trace an unknown state through the teleportation circuit",
    "Say why two classical bits are required and cannot be avoided",
    "Explain how no-cloning is respected",
    "Identify what is and is not transmitted",
  ],
  sections: [
    {
      id: "problem",
      title: "The problem",
      blocks: [
        {
          kind: "prose",
          text: "Alice holds a qubit in an unknown state α|0⟩ + β|1⟩ and wants Bob to end up holding it. She cannot measure it — measurement would collapse it and reveal only one bit. She cannot copy it either, because the no-cloning theorem forbids that. And she cannot simply describe it, since she does not know α and β.",
        },
        {
          kind: "callout",
          tone: "insight",
          title: "Why no-cloning follows from linearity alone",
          text: "Suppose some unitary U copied any state: U|ψ⟩|0⟩ = |ψ⟩|ψ⟩. Apply it to |0⟩ and |1⟩, then to (|0⟩+|1⟩)/√2. Linearity forces the output to be (|00⟩+|11⟩)/√2, but copying demands (|0⟩+|1⟩)(|0⟩+|1⟩)/2. Those differ, so no such U exists. Cloning is incompatible with linear evolution — nothing more exotic is needed.",
        },
        {
          kind: "prose",
          text: "Teleportation threads this needle: Bob ends up with the exact state, Alice's copy is destroyed in the process, and no one ever learns what α and β were.",
        },
      ],
    },
    {
      id: "protocol",
      title: "The protocol",
      blocks: [
        {
          kind: "prose",
          text: "The ingredients are one shared Bell pair, prepared in advance, and a two-bit classical message. Three qubits are involved: Alice's unknown state on q0, and the halves of the entangled pair on q1 (hers) and q2 (Bob's).",
        },
        {
          kind: "derivation",
          title: "Following the state through",
          premise:
            "Alice holds |ψ⟩ = α|0⟩ + β|1⟩ on q0, and shares |Φ⁺⟩ across q1 and q2 with Bob.",
          steps: [
            {
              title: "Write the full three-qubit state",
              latex: "|\\psi\\rangle \\otimes \\tfrac{1}{\\sqrt{2}}(|00\\rangle + |11\\rangle)",
              explanation: "Alice's qubit is uncorrelated with the pair at this point — it is a simple product.",
            },
            {
              title: "Alice entangles her two qubits",
              latex: "\\text{CNOT}(q_0 \\to q_1), \\text{ then } H \\text{ on } q_0",
              explanation:
                "This rotates Alice's pair into the Bell basis, so the measurement that follows asks which Bell state her two qubits are in — deliberately a question whose answer reveals nothing about α or β.",
            },
            {
              title: "Re-express in terms of Alice's outcomes",
              latex: "\\tfrac{1}{2}\\Big[|00\\rangle(\\alpha|0\\rangle + \\beta|1\\rangle) + |01\\rangle(\\alpha|1\\rangle + \\beta|0\\rangle) + |10\\rangle(\\alpha|0\\rangle - \\beta|1\\rangle) + |11\\rangle(\\alpha|1\\rangle - \\beta|0\\rangle)\\Big]",
              explanation:
                "Purely algebraic regrouping — no physics has happened yet. But notice that Bob's qubit now appears in one of four versions of |ψ⟩, each a known Pauli away from the original.",
            },
            {
              title: "Alice measures and sends two bits",
              latex: "00 \\to I, \\quad 01 \\to X, \\quad 10 \\to Z, \\quad 11 \\to ZX",
              explanation:
                "Her outcome is uniformly random and tells her nothing about the state. It tells Bob exactly which correction to apply.",
            },
          ],
          conclusion:
            "Bob applies the named correction and holds α|0⟩ + β|1⟩ exactly. Alice's original is gone — her measurement destroyed it — so only one copy ever exists.",
        },
      ],
    },
    {
      id: "what-moved",
      title: "What actually travelled",
      blocks: [
        {
          kind: "comparison",
          title: "Accounting",
          columns: ["Moved", "Did not move"],
          rows: [
            { aspect: "The quantum state", left: "Yes, from q0 to q2", right: "—" },
            { aspect: "Any physical qubit", left: "—", right: "Nothing crossed the room during the protocol" },
            { aspect: "Classical bits", left: "Exactly 2, at light speed or slower", right: "—" },
            { aspect: "The entangled pair", left: "Distributed beforehand", right: "Consumed; a fresh pair is needed each time" },
            { aspect: "Knowledge of α, β", left: "—", right: "Nobody learns them, including Alice" },
          ],
        },
        {
          kind: "prose",
          text: "Before the classical message arrives, Bob's qubit is maximally mixed — indistinguishable from noise, carrying nothing. Those two bits are not a formality; they are the entire content of the transfer as far as relativity is concerned, and they cannot outrun light.",
        },
        {
          kind: "misconception",
          claim: "Teleportation transmits the state instantly, so information moves faster than light.",
          correction:
            "Without the two classical bits, Bob holds a maximally mixed state and can extract nothing whatsoever. The protocol completes only when that message arrives, which is bounded by the speed of light. Entanglement supplies correlation in advance; the classical channel supplies the timing.",
        },
        {
          kind: "misconception",
          claim: "It is a copy, so no-cloning is violated.",
          correction:
            "Alice's Bell measurement destroys her version. At every instant exactly one copy of the state exists — this is a hand-off, not a duplication. Teleportation and no-cloning are consistent precisely because the original must be destroyed.",
        },
      ],
    },
  ],
  visual: {
    renderer: "entanglement-studio",
    title: "The shared resource",
    caption:
      "Teleportation spends one Bell pair per qubit sent. Watch how measuring one half determines the other — the correlation this protocol converts into a state transfer.",
  },
  circuit: {
    title: "Teleportation with deferred corrections",
    description:
      "Alice's state is prepared on q0 with Ry(π/3), giving P(0) = 0.75. After the protocol, qubit 2 carries that state: summing over q0 and q1, q2 reads 0 exactly 75% of the time. The corrections are applied as controlled gates rather than mid-circuit measurements, which is an equivalent circuit by the deferred-measurement principle.",
    numQubits: 3,
    numClbits: 3,
    operations: [
      {
        id: "op-prep",
        gate: "ry",
        targets: [0],
        params: [Math.PI / 3],
        note: "Prepares the unknown state on q0: cos(π/6)|0⟩ + sin(π/6)|1⟩, so P(0) = 0.75.",
      },
      { id: "op-h1", gate: "h", targets: [1], note: "Begins the entangled pair shared between Alice (q1) and Bob (q2)." },
      { id: "op-cx12", gate: "cx", targets: [2], controls: [1], note: "Completes the Bell pair across q1 and q2." },
      { id: "op-cx01", gate: "cx", targets: [1], controls: [0], note: "Alice entangles her unknown state with her half of the pair." },
      { id: "op-h0", gate: "h", targets: [0], note: "Completes the rotation into the Bell basis — Alice's measurement basis." },
      { id: "op-cx-corr", gate: "cx", targets: [2], controls: [1], note: "The X correction, applied coherently instead of after a measurement." },
      { id: "op-cz-corr", gate: "cz", targets: [2], controls: [0], note: "The Z correction. Qubit 2 now holds Alice's original state." },
    ],
    // q0 and q1 are uniform over four combinations; q2 carries the state, so
    // each string with q2 = 0 gets 0.75/4 and each with q2 = 1 gets 0.25/4.
    expected: {
      "000": 0.1875, "001": 0.1875, "010": 0.1875, "011": 0.1875,
      "100": 0.0625, "101": 0.0625, "110": 0.0625, "111": 0.0625,
    },
    tolerance: 1e-5,
  },
  code: {
    title: "Verifying the transfer",
    description:
      "Teleports a randomly chosen state and compares Bob's reduced density matrix against the original, reporting the fidelity.",
    language: "python",
    code: `import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import DensityMatrix, Statevector, partial_trace, state_fidelity

rng = np.random.default_rng(11)
theta = rng.uniform(0, np.pi)
phi = rng.uniform(0, 2 * np.pi)

original = Statevector([np.cos(theta / 2),
                        np.exp(1j * phi) * np.sin(theta / 2)])
print(f"state to teleport: theta={theta:.4f}, phi={phi:.4f}")
print("amplitudes:", np.round(original.data, 4))

qc = QuantumCircuit(3)
qc.ry(theta, 0)
qc.rz(phi, 0)

qc.h(1)
qc.cx(1, 2)          # Bell pair shared by Alice (q1) and Bob (q2)

qc.cx(0, 1)          # Alice entangles her state with her half
qc.h(0)              # ...and rotates into the Bell basis

qc.cx(1, 2)          # corrections, deferred rather than measured
qc.cz(0, 2)

final = Statevector.from_instruction(qc)
bob = partial_trace(final, [0, 1])

fidelity = state_fidelity(DensityMatrix(original), bob)
print()
print("Bob's reduced state:")
print(np.round(bob.data, 4))
print(f"fidelity with the original: {fidelity:.10f}")
print(f"teleportation exact: {abs(fidelity - 1) < 1e-9}")

alice = partial_trace(final, [1, 2])
print()
print("Alice's qubit afterwards (should carry no trace of the state):")
print(np.round(alice.data.real, 4))`,
    expectedOutput: ["teleportation exact: True"],
  },
  keyTakeaways: [
    "Teleportation moves a state using one Bell pair and two classical bits",
    "No-cloning follows from linearity alone, and is respected because Alice's copy is destroyed",
    "Alice's measurement outcome is uniformly random and reveals nothing about the state",
    "Bob's qubit is maximally mixed until the classical bits arrive, so nothing outruns light",
    "The entangled pair is consumed; each transfer needs a fresh one",
  ],
  references: [
    { source: "Bennett et al., Teleporting an unknown quantum state", locator: "Phys. Rev. Lett. 70, 1895 (1993)" },
    { source: "Wootters & Zurek, A single quantum cannot be cloned", locator: "Nature 299, 802 (1982)" },
    { source: "Nielsen & Chuang, Quantum Computation and Quantum Information", locator: "§1.3.7, §12.1" },
  ],
};
