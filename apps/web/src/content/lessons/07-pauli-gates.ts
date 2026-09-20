import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "pauli-gates",
  slug: "pauli-gates",
  order: 7,
  title: "The Pauli Gates X, Y and Z",
  subtitle: "Three half-turns that generate everything else",
  summary:
    "What each Pauli gate does to a state, why Z looks like it does nothing until you change basis, and why the three of them cannot be measured together.",
  difficulty: "beginner",
  estimatedMinutes: 22,
  prerequisites: ["dirac-notation", "superposition-and-hadamard"],
  objectives: [
    "Write down the three Pauli matrices and their action on the basis states",
    "Explain why Z leaves computational-basis probabilities untouched",
    "Show that H·Z·H = X and read it as a change of basis",
    "State the anticommutation relation and what it implies for measurement",
  ],
  sections: [
    {
      id: "three-gates",
      title: "Three matrices",
      blocks: [
        {
          kind: "prose",
          text: "The Pauli gates are the three non-trivial single-qubit operations that are both unitary and Hermitian. Each is a half-turn about one axis of the Bloch sphere, and each is its own inverse: apply it twice and you are back where you started.",
        },
        {
          kind: "equation",
          latex: "X = \\begin{bmatrix} 0 & 1 \\\\ 1 & 0 \\end{bmatrix}, \\quad Y = \\begin{bmatrix} 0 & -i \\\\ i & 0 \\end{bmatrix}, \\quad Z = \\begin{bmatrix} 1 & 0 \\\\ 0 & -1 \\end{bmatrix}",
          caption: "The three Pauli matrices. Each squares to the identity.",
        },
        {
          kind: "comparison",
          title: "What each one does",
          columns: ["Action on basis states", "On the Bloch sphere"],
          rows: [
            { aspect: "X", left: "|0⟩ ↔ |1⟩ — the quantum NOT", right: "180° about the x-axis" },
            { aspect: "Y", left: "|0⟩ → i|1⟩, |1⟩ → −i|0⟩ — bit and phase together", right: "180° about the y-axis" },
            { aspect: "Z", left: "|0⟩ → |0⟩, |1⟩ → −|1⟩ — negates only |1⟩", right: "180° about the z-axis" },
          ],
        },
      ],
    },
    {
      id: "invisible-z",
      title: "Why Z looks like it does nothing",
      blocks: [
        {
          kind: "prose",
          text: "Apply Z to any state and measure in the computational basis: the probabilities come out identical. Z multiplies the |1⟩ amplitude by −1, and the Born rule squares magnitudes, so the minus sign vanishes.",
        },
        {
          kind: "prose",
          text: "That does not make Z useless. It makes Z **invisible to that particular measurement**. Change what you measure and Z becomes every bit as consequential as X.",
        },
        {
          kind: "derivation",
          title: "H · Z · H = X",
          premise: "Sandwich Z between two Hadamards and follow where |0⟩ goes.",
          steps: [
            {
              title: "Move into the X basis",
              latex: "H|0\\rangle = |{+}\\rangle",
              explanation:
                "The Hadamard maps the computational basis onto the X basis, so whatever comes next acts on |+⟩ and |−⟩.",
            },
            {
              title: "Let Z act there",
              latex: "Z|{+}\\rangle = \\tfrac{1}{\\sqrt{2}}(|0\\rangle - |1\\rangle) = |{-}\\rangle",
              explanation:
                "In this basis Z is not invisible at all — it sends |+⟩ to |−⟩, and those two are perfectly distinguishable.",
            },
            {
              title: "Come back",
              latex: "H|{-}\\rangle = |1\\rangle",
              explanation:
                "The second Hadamard returns to the computational basis, where the flip now shows up as a definite 0 becoming 1.",
            },
          ],
          conclusion:
            "H·Z·H = X. The same operator is an unobservable phase in one basis and a bit flip in another. Which one it 'really is' depends entirely on the basis you chose to describe it in.",
        },
        {
          kind: "callout",
          tone: "insight",
          title: "Bit flips and phase flips are the same thing in disguise",
          text: "This identity is why quantum error correction gets away with correcting only X and Z errors. A phase flip is a bit flip viewed in a rotated basis, and Y is both at once, so handling X and Z handles every single-qubit error.",
        },
      ],
    },
    {
      id: "anticommutation",
      title: "They anticommute",
      blocks: [
        {
          kind: "equation",
          latex: "XZ = -ZX, \\qquad XY = -YX, \\qquad YZ = -ZY",
          caption: "Order matters, and swapping it costs a minus sign.",
        },
        {
          kind: "prose",
          text: "Operators that commute can be measured together to arbitrary precision. Anticommuting operators cannot: pin down a qubit's Z value exactly and its X value becomes maximally uncertain. That is the uncertainty principle stated for a single qubit, and it is why a pure state's Bloch vector has length exactly one instead of pointing definitely along all three axes at once.",
        },
        {
          kind: "misconception",
          claim: "Y is redundant, since it is just X and Z applied one after the other.",
          correction:
            "Y = iXZ, so it does equal that product up to a factor of i — and a global phase is unobservable, which makes Y and XZ the same physical operation. Y still earns its own name: it generates rotations about the y-axis, appears directly in hardware pulse sequences, and writing it out keeps the three-fold symmetry of the Pauli algebra visible.",
        },
      ],
    },
  ],
  visual: {
    renderer: "linear-algebra",
    title: "Pauli operator inspector",
    caption:
      "Select a gate and check its properties. All three Paulis come out both unitary and Hermitian, which is unusual — each is simultaneously a valid gate and a measurable observable.",
    props: {
      operators: ["I", "X", "Y", "Z", "H"],
      showAdjoint: true,
      checks: ["unitarity", "hermiticity", "idempotence"],
      applyTo: ["|0>", "|1>", "|+>", "|->"],
    },
  },
  circuit: {
    title: "H · Z · H turns a phase flip into a bit flip",
    description:
      "Z on its own would leave the measurement unchanged. Surrounded by Hadamards it flips the qubit with certainty — every shot reads 1.",
    numQubits: 1,
    numClbits: 1,
    operations: [
      { id: "op-h1", gate: "h", targets: [0], note: "Moves into the X basis, where |0⟩ becomes |+⟩." },
      { id: "op-z", gate: "z", targets: [0], note: "Flips |+⟩ to |−⟩. Invisible in the Z basis, decisive here." },
      { id: "op-h2", gate: "h", targets: [0], note: "Returns to the computational basis, where the flip reads as 1." },
    ],
    expected: { "0": 0.0, "1": 1.0 },
  },
  code: {
    title: "Checking the Pauli algebra",
    description:
      "Verifies that each Pauli squares to the identity, that they anticommute, that Y = iXZ, and that H·Z·H = X.",
    language: "python",
    code: `import numpy as np

I = np.eye(2, dtype=complex)
X = np.array([[0, 1], [1, 0]], dtype=complex)
Y = np.array([[0, -1j], [1j, 0]], dtype=complex)
Z = np.array([[1, 0], [0, -1]], dtype=complex)
H = np.array([[1, 1], [1, -1]], dtype=complex) / np.sqrt(2)

for name, P in (("X", X), ("Y", Y), ("Z", Z)):
    print(f"{name}^2 == I : {np.allclose(P @ P, I)}")

print()
print(f"XZ == -ZX : {np.allclose(X @ Z, -(Z @ X))}")
print(f"XY == -YX : {np.allclose(X @ Y, -(Y @ X))}")
print(f"YZ == -ZY : {np.allclose(Y @ Z, -(Z @ Y))}")

print()
print(f"Y == i*X*Z : {np.allclose(Y, 1j * X @ Z)}")
print(f"H*Z*H == X : {np.allclose(H @ Z @ H, X)}")
print(f"H*X*H == Z : {np.allclose(H @ X @ H, Z)}")

plus = np.array([1, 1], dtype=complex) / np.sqrt(2)
print()
print("Z applied to |+> gives", np.round(Z @ plus, 4), "which is |->")
print("probabilities before:", np.round(abs(plus) ** 2, 4))
print("probabilities after :", np.round(abs(Z @ plus) ** 2, 4), " <- identical")
overlap = abs(np.vdot(plus, Z @ plus))
print(f"yet <+|-> = {overlap:.10f}, so they are orthogonal and fully distinguishable.")`,
    expectedOutput: ["H*Z*H == X : True", "XZ == -ZX : True"],
  },
  keyTakeaways: [
    "X, Y and Z are half-turns about the three Bloch axes, and each is its own inverse",
    "Z is invisible to a computational-basis measurement because the Born rule discards its minus sign",
    "H·Z·H = X: a phase flip is a bit flip seen in a rotated basis",
    "The Paulis anticommute, which is why a qubit cannot hold definite X and Z values at once",
    "Y = iXZ, so Y and XZ are the same physical operation up to an unobservable global phase",
  ],
  references: [
    { source: "Nielsen & Chuang, Quantum Computation and Quantum Information", locator: "§2.1.3, §4.2" },
    { source: "Griffiths & Schroeter, Introduction to Quantum Mechanics", locator: "Chapter 4 (spin operators)" },
  ],
};
