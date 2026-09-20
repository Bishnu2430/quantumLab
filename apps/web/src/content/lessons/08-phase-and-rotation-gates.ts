import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "phase-and-rotation-gates",
  slug: "phase-and-rotation-gates",
  order: 8,
  title: "Phase and Rotation Gates",
  subtitle: "Continuous control, and why T is the expensive one",
  summary:
    "S and T as fractional turns about z, the Rx/Ry/Rz family as continuous rotations, and why T costs so much more than every other gate on a real machine.",
  difficulty: "intermediate",
  estimatedMinutes: 24,
  prerequisites: ["pauli-gates"],
  objectives: [
    "Relate S and T to Z as successive halvings of the same rotation",
    "Write an arbitrary single-qubit state using only Ry and Rz applied to |0⟩",
    "Explain why a global phase convention makes Rz differ from the phase gate P",
    "Say why T is the costly gate in a fault-tolerant setting",
  ],
  sections: [
    {
      id: "fractions-of-z",
      title: "Halving the Z rotation",
      blocks: [
        {
          kind: "prose",
          text: "Z is a half-turn about the z-axis: it multiplies the |1⟩ amplitude by −1 = e^{iπ}. Nothing stops us taking a smaller turn. S applies e^{iπ/2} = i, and T applies e^{iπ/4}. Each is the square root of the one before.",
        },
        {
          kind: "equation",
          latex: "Z = \\begin{bmatrix} 1 & 0 \\\\ 0 & e^{i\\pi} \\end{bmatrix}, \\quad S = \\begin{bmatrix} 1 & 0 \\\\ 0 & e^{i\\pi/2} \\end{bmatrix}, \\quad T = \\begin{bmatrix} 1 & 0 \\\\ 0 & e^{i\\pi/4} \\end{bmatrix}",
          caption:
            "The same gate at three angles. S² = Z and T² = S, so T⁴ = Z.",
        },
        {
          kind: "prose",
          text: "All three are diagonal, so none of them changes a computational-basis measurement. They act purely on **relative phase** — which is exactly the quantity interference depends on, so they are far from idle.",
        },
      ],
    },
    {
      id: "continuous",
      title: "Continuous rotations",
      blocks: [
        {
          kind: "prose",
          text: "The Pauli gates and their fractions are fixed angles. The rotation gates take the angle as a parameter, which is what lets a circuit be tuned rather than merely assembled.",
        },
        {
          kind: "equation",
          latex: "R_{\\hat{n}}(\\theta) = \\exp\\!\\left(-i\\frac{\\theta}{2}\\,\\hat{n}\\cdot\\vec{\\sigma}\\right) = \\cos\\frac{\\theta}{2}\\,I - i\\sin\\frac{\\theta}{2}\\,(\\hat{n}\\cdot\\vec{\\sigma})",
          caption:
            "A rotation by θ about the axis n̂. Setting n̂ to x, y or z gives Rx, Ry and Rz.",
          where: [
            { symbol: "\\vec{\\sigma}", meaning: "the vector of Pauli matrices (X, Y, Z)" },
            { symbol: "\\theta/2", meaning: "the half-angle, for the same reason the Bloch sphere uses θ/2" },
          ],
        },
        {
          kind: "prose",
          text: "Two rotations suffice to reach any single-qubit state from |0⟩: Ry sets how far the state tips away from the pole, which fixes the measurement probabilities, and Rz then spins it around the equator, which fixes the relative phase.",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Rz and the phase gate P are not the same matrix",
          text: "Rz(θ) = diag(e^{−iθ/2}, e^{+iθ/2}) is symmetric about the identity, while P(θ) = diag(1, e^{iθ}) puts the whole phase on |1⟩. They differ by the global factor e^{−iθ/2}, which is unobservable on its own — but becomes very observable once the gate is used as the target of a controlled operation, where the 'global' phase is only global to one branch. Qiskit's `rz` is the first convention.",
        },
      ],
    },
    {
      id: "t-gate",
      title: "Why T is the expensive gate",
      blocks: [
        {
          kind: "prose",
          text: "On paper T is unremarkable — a small diagonal phase. On fault-tolerant hardware it dominates the cost of the entire computation, and understanding why explains a great deal about how quantum computers are actually built.",
        },
        {
          kind: "prose",
          text: "The Clifford gates — H, S, CNOT and the Paulis — have a special property: a quantum circuit built only from them can be simulated efficiently on a classical computer. That is the **Gottesman–Knill theorem**, and it means Cliffords alone cannot deliver any quantum advantage. Adding T to the Clifford set makes it universal.",
        },
        {
          kind: "comparison",
          title: "Clifford versus non-Clifford",
          columns: ["Clifford gates (H, S, CNOT, Paulis)", "T gate"],
          rows: [
            { aspect: "Classical simulation", left: "Efficient — Gottesman–Knill", right: "Believed intractable" },
            { aspect: "Error correction", left: "Applied directly to encoded qubits, cheaply", right: "Needs magic-state distillation" },
            { aspect: "Typical cost", left: "Roughly one unit", right: "Orders of magnitude more" },
            { aspect: "Computational power", left: "No advantage on its own", right: "Completes a universal set" },
          ],
        },
        {
          kind: "callout",
          tone: "insight",
          title: "Algorithms are costed in T",
          text: "Because Cliffords are nearly free once encoded and T gates are not, resource estimates for fault-tolerant algorithms are quoted as a T-count. Shaving T gates out of a circuit matters far more than shaving Hadamards.",
        },
        {
          kind: "misconception",
          claim: "Rotation gates let you reach any state, so any angle is equally available on hardware.",
          correction:
            "On a physical device today, yes — a calibrated pulse produces an arbitrary angle. On a fault-tolerant device it is not: encoded qubits only admit a discrete gate set, and arbitrary angles must be approximated by sequences of Clifford and T gates. The Solovay–Kitaev theorem guarantees the approximation exists and converges quickly, but every digit of precision costs more T gates.",
        },
      ],
    },
  ],
  visual: {
    renderer: "bloch-sphere",
    title: "Rotations on the Bloch sphere",
    caption:
      "θ tips the state away from the pole and sets the measurement probabilities. φ spins it around the equator and changes nothing you can measure in the Z basis — until a later gate turns that phase back into an amplitude.",
    props: {
      controls: ["theta", "phi"],
      initial: { theta: 1.047, phi: 0.785 },
      readouts: ["amplitudes", "probabilities"],
    },
  },
  circuit: {
    title: "Four T gates make a Z",
    description:
      "T is an eighth-turn, so four of them compose into the half-turn Z. Wrapped in Hadamards that becomes a bit flip, so every shot reads 1 — a visible check on an otherwise invisible phase.",
    numQubits: 1,
    numClbits: 1,
    operations: [
      { id: "op-h1", gate: "h", targets: [0], note: "Into the X basis, so the accumulated phase becomes measurable." },
      { id: "op-t1", gate: "t", targets: [0], note: "First eighth-turn: e^(iπ/4) on the |1⟩ amplitude." },
      { id: "op-t2", gate: "t", targets: [0], note: "Two T gates now equal one S." },
      { id: "op-t3", gate: "t", targets: [0], note: "Three-quarters of the way to a Z." },
      { id: "op-t4", gate: "t", targets: [0], note: "Four T gates complete the half-turn: T⁴ = Z." },
      { id: "op-h2", gate: "h", targets: [0], note: "Back to the computational basis, where H·Z·H = X shows up as a certain 1." },
    ],
    expected: { "0": 0.0, "1": 1.0 },
  },
  code: {
    title: "Composing and decomposing rotations",
    description:
      "Confirms S² = Z and T⁴ = Z, shows that Rz and the phase gate differ only by a global phase, and reaches an arbitrary state with Ry followed by Rz.",
    language: "python",
    code: `import numpy as np

Z = np.array([[1, 0], [0, -1]], dtype=complex)
S = np.array([[1, 0], [0, 1j]], dtype=complex)
T = np.array([[1, 0], [0, np.exp(1j * np.pi / 4)]], dtype=complex)

print(f"S^2 == Z : {np.allclose(S @ S, Z)}")
print(f"T^2 == S : {np.allclose(T @ T, S)}")
print(f"T^4 == Z : {np.allclose(np.linalg.matrix_power(T, 4), Z)}")

def rz(theta):
    return np.array([[np.exp(-1j * theta / 2), 0],
                     [0, np.exp(1j * theta / 2)]], dtype=complex)

def phase(theta):
    return np.array([[1, 0], [0, np.exp(1j * theta)]], dtype=complex)

theta = np.pi / 3
ratio = phase(theta) @ np.linalg.inv(rz(theta))
print()
print("P(theta) * Rz(theta)^-1 =")
print(np.round(ratio, 6))
print("a multiple of the identity, i.e. the two differ by a global phase only")

def ry(theta):
    c, s = np.cos(theta / 2), np.sin(theta / 2)
    return np.array([[c, -s], [s, c]], dtype=complex)

target_theta, target_phi = np.pi / 3, np.pi / 2
state = rz(target_phi) @ ry(target_theta) @ np.array([1, 0], dtype=complex)
print()
print("Ry then Rz applied to |0>:", np.round(state, 4))
print(f"P(0) = {abs(state[0])**2:.4f}  (expected {np.cos(target_theta/2)**2:.4f})")`,
    expectedOutput: ["T^4 == Z : True", "S^2 == Z : True"],
  },
  keyTakeaways: [
    "S and T are successive halvings of the Z rotation: S² = Z, T² = S, T⁴ = Z",
    "Diagonal gates never change computational-basis probabilities; they act on relative phase",
    "Ry then Rz reaches any single-qubit state from |0⟩ — one angle per degree of freedom",
    "Rz and the phase gate P differ by a global phase, which stops being harmless once the gate is controlled",
    "Clifford-only circuits are classically simulable, so T is what supplies the quantum advantage — and the cost",
  ],
  references: [
    { source: "Nielsen & Chuang, Quantum Computation and Quantum Information", locator: "§4.2, §10.6" },
    { source: "Gottesman, The Heisenberg Representation of Quantum Computers", locator: "arXiv:quant-ph/9807006" },
    { source: "Bravyi & Kitaev, Universal quantum computation with ideal Clifford gates and noisy ancillas", locator: "Phys. Rev. A 71, 022316 (2005)" },
  ],
};
