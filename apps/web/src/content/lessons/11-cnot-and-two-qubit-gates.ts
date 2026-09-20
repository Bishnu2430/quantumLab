import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "cnot-and-two-qubit-gates",
  slug: "cnot-and-two-qubit-gates",
  order: 11,
  title: "CNOT and the Two-Qubit Gates",
  subtitle: "Conditional logic, and why control is symmetric",
  summary:
    "How CNOT, CZ and SWAP act, why CNOT and CZ are the same gate in different bases, and why no single-qubit gate can ever create entanglement.",
  difficulty: "intermediate",
  estimatedMinutes: 24,
  prerequisites: ["multiple-qubits"],
  objectives: [
    "Write the CNOT matrix and apply it to each basis state",
    "Show that CZ acts symmetrically on its two qubits despite the naming",
    "Convert between CNOT and CZ using Hadamards",
    "Explain why entanglement requires a two-qubit gate",
  ],
  sections: [
    {
      id: "cnot",
      title: "The controlled-NOT",
      blocks: [
        {
          kind: "prose",
          text: "CNOT flips its target qubit exactly when the control is |1⟩. It is the standard two-qubit gate, and together with the single-qubit gates it is enough to build any quantum computation at all.",
        },
        {
          kind: "equation",
          latex: "\\mathrm{CNOT} = \\begin{bmatrix} 1 & 0 & 0 & 0 \\\\ 0 & 1 & 0 & 0 \\\\ 0 & 0 & 0 & 1 \\\\ 0 & 0 & 1 & 0 \\end{bmatrix}",
          caption:
            "Ordered |00⟩, |01⟩, |10⟩, |11⟩. The top-left block is the identity and the bottom-right block is X — nothing happens unless the control is set.",
        },
        {
          kind: "comparison",
          title: "CNOT on each basis state",
          columns: ["Input", "Output"],
          rows: [
            { aspect: "|00⟩", left: "control 0", right: "|00⟩ — unchanged" },
            { aspect: "|01⟩", left: "control 0", right: "|01⟩ — unchanged" },
            { aspect: "|10⟩", left: "control 1", right: "|11⟩ — target flipped" },
            { aspect: "|11⟩", left: "control 1", right: "|10⟩ — target flipped" },
          ],
        },
        {
          kind: "prose",
          text: "On basis states this is just classical conditional logic — it is the reversible XOR. The interesting behaviour appears when the control is itself in superposition, because then the gate acts on every branch at once and the two qubits come out correlated.",
        },
      ],
    },
    {
      id: "cz-symmetry",
      title: "CZ is symmetric, and so is control",
      blocks: [
        {
          kind: "prose",
          text: "The controlled-Z gate applies a phase of −1 only to |11⟩. Written as a matrix it is diag(1, 1, 1, −1), and that expression is completely symmetric under exchanging the two qubits.",
        },
        {
          kind: "callout",
          tone: "insight",
          title: "Neither qubit is really the control",
          text: "Calling one qubit the control and the other the target is a description, not a physical asymmetry — for CZ the roles are interchangeable and the circuit symbol is drawn symmetrically to reflect that. Even for CNOT the asymmetry is basis-dependent: conjugating both qubits by Hadamards swaps which one appears to be in charge.",
        },
        {
          kind: "derivation",
          title: "CNOT from CZ",
          premise: "CNOT flips the target; CZ only adds a phase. Hadamards convert between them.",
          steps: [
            {
              title: "Recall the single-qubit identity",
              latex: "HZH = X",
              explanation: "Established in the Pauli lesson: a phase flip becomes a bit flip in the rotated basis.",
            },
            {
              title: "Apply it to the target only",
              latex: "(I \\otimes H)\\,\\mathrm{CZ}\\,(I \\otimes H) = \\mathrm{CNOT}",
              explanation:
                "The control branch is untouched, while the target's Z becomes an X. Conditioning on the control carries through unchanged.",
            },
          ],
          conclusion:
            "CNOT and CZ are the same gate viewed in different bases. Hardware platforms that natively implement one get the other for the price of two Hadamards, which is why a device's native two-qubit gate need not be the one an algorithm was written with.",
        },
      ],
    },
    {
      id: "entangling",
      title: "Why entanglement needs two qubits",
      blocks: [
        {
          kind: "prose",
          text: "Single-qubit gates, however many you apply, can never entangle. The reason is structural rather than a limit of ingenuity.",
        },
        {
          kind: "derivation",
          title: "Local gates preserve separability",
          premise: "Start from a product state |a⟩ ⊗ |b⟩ and apply any single-qubit gates.",
          steps: [
            {
              title: "A local gate is a tensor product",
              latex: "U_{\\text{local}} = U_A \\otimes U_B",
              explanation: "Acting on only one qubit means the identity acts on the other, which is still a tensor product.",
            },
            {
              title: "Tensor products preserve the factorisation",
              latex: "(U_A \\otimes U_B)(|a\\rangle \\otimes |b\\rangle) = (U_A|a\\rangle) \\otimes (U_B|b\\rangle)",
              explanation:
                "The result is still a product of one state for each qubit. No sequence of such gates can change that.",
            },
          ],
          conclusion:
            "Separability is invariant under local operations. Producing entanglement requires a gate whose matrix does not factor — CNOT, CZ or anything equivalent. This is exactly why two-qubit gates are the hard part to build: they are the part that actually does something quantum.",
        },
        {
          kind: "misconception",
          claim: "SWAP entangles two qubits, since afterwards they have each other's states.",
          correction:
            "SWAP exchanges the two states and leaves a product state a product state — it is three CNOTs whose entangling effects cancel exactly. Useful for routing qubits around hardware that only couples neighbours, but it creates no entanglement at all.",
        },
      ],
    },
  ],
  visual: {
    renderer: "multi-qubit-matrix",
    title: "Two-qubit gate matrices",
    caption:
      "Compare CNOT, CZ and SWAP side by side. Note that CZ's matrix is diagonal and symmetric under exchanging the qubits, which is the formal statement that its 'control' label is arbitrary.",
  },
  circuit: {
    title: "CNOT acting on a definite control",
    description:
      "X sets qubit 0 to |1⟩, so the CNOT fires and flips qubit 1. With Qiskit's ordering the result reads \"11\" — qubit 0 is the rightmost character.",
    numQubits: 2,
    numClbits: 2,
    operations: [
      { id: "op-x", gate: "x", targets: [0], note: "Sets the control qubit to |1⟩, so the CNOT will fire." },
      {
        id: "op-cx",
        gate: "cx",
        targets: [1],
        controls: [0],
        note: "Control is qubit 0, target qubit 1. Because the control is |1⟩, the target flips to |1⟩.",
      },
    ],
    expected: { "00": 0.0, "01": 0.0, "10": 0.0, "11": 1.0 },
  },
  code: {
    title: "Two-qubit gate identities",
    description:
      "Checks the CNOT matrix, confirms CZ is symmetric under qubit exchange, derives CNOT from CZ with Hadamards, and builds SWAP from three CNOTs.",
    language: "python",
    code: `import numpy as np

I = np.eye(2, dtype=complex)
X = np.array([[0, 1], [1, 0]], dtype=complex)
H = np.array([[1, 1], [1, -1]], dtype=complex) / np.sqrt(2)

CNOT = np.array([[1, 0, 0, 0],
                 [0, 1, 0, 0],
                 [0, 0, 0, 1],
                 [0, 0, 1, 0]], dtype=complex)
CZ = np.diag([1, 1, 1, -1]).astype(complex)
SWAP = np.array([[1, 0, 0, 0],
                 [0, 0, 1, 0],
                 [0, 1, 0, 0],
                 [0, 0, 0, 1]], dtype=complex)

print("CNOT on each basis state:")
for i, label in enumerate(["00", "01", "10", "11"]):
    out = CNOT @ np.eye(4, dtype=complex)[i]
    print(f"  |{label}> -> |{['00','01','10','11'][int(np.argmax(abs(out)))]}>")

# CZ is unchanged when the two qubits are exchanged.
print()
print(f"SWAP*CZ*SWAP == CZ : {np.allclose(SWAP @ CZ @ SWAP, CZ)}  <- symmetric")
print(f"SWAP*CNOT*SWAP == CNOT : {np.allclose(SWAP @ CNOT @ SWAP, CNOT)}  <- not symmetric")

# Hadamards on the target convert one into the other.
target_h = np.kron(I, H)
print()
print(f"(I(x)H) CZ (I(x)H) == CNOT : {np.allclose(target_h @ CZ @ target_h, CNOT)}")

# SWAP decomposes into three alternating CNOTs.
CNOT_rev = SWAP @ CNOT @ SWAP
print(f"SWAP == CNOT*CNOT_rev*CNOT : {np.allclose(CNOT @ CNOT_rev @ CNOT, SWAP)}")

# Local gates cannot entangle.
ket_0 = np.array([1, 0], dtype=complex)
product = np.kron(H @ ket_0, H @ ket_0)
rank = np.linalg.matrix_rank(product.reshape(2, 2), tol=1e-9)
entangled = CNOT @ np.kron(H @ ket_0, ket_0)
rank_after = np.linalg.matrix_rank(entangled.reshape(2, 2), tol=1e-9)
print()
print(f"rank after local gates only : {rank}  (1 means separable)")
print(f"rank after a CNOT           : {rank_after}  (2 means entangled)")`,
    expectedOutput: ["(I(x)H) CZ (I(x)H) == CNOT : True", "rank after a CNOT           : 2"],
  },
  keyTakeaways: [
    "CNOT flips the target exactly when the control is |1⟩ — reversible XOR on basis states",
    "CZ is diagonal and symmetric, so its control/target labelling is a description rather than a physical fact",
    "Hadamards on the target convert CZ into CNOT and back",
    "Local gates preserve separability, so entanglement requires a non-factorising two-qubit gate",
    "SWAP is three CNOTs and creates no entanglement; it exists for routing on limited hardware",
  ],
  references: [
    { source: "Nielsen & Chuang, Quantum Computation and Quantum Information", locator: "§1.3.2, §4.3" },
    { source: "Barenco et al., Elementary gates for quantum computation", locator: "Phys. Rev. A 52, 3457 (1995)" },
  ],
};
