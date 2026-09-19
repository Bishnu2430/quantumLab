import type { Lesson } from "../types";

/**
 * Formalism lesson. No circuit — operators and projectors are the subject, and
 * no arrangement of gates would illuminate them better than the algebra does.
 */
export const lesson: Lesson = {
  id: "dirac-notation",
  slug: "dirac-notation",
  order: 4,
  title: "Dirac Notation and Operators",
  subtitle: "Bras, kets, projectors, and what makes an operator physical",
  summary:
    "The notation the whole field is written in, the operators that act on states, and the two special classes — unitary and Hermitian — that correspond to evolution and to measurement.",
  difficulty: "beginner",
  estimatedMinutes: 22,
  prerequisites: ["complex-amplitudes"],
  objectives: [
    "Translate between column-vector notation and bra-ket notation",
    "Distinguish the inner product ⟨ψ|φ⟩ from the outer product |ψ⟩⟨φ|",
    "Build the projector onto a state and verify that P² = P",
    "Explain why evolution operators are unitary and observables are Hermitian",
  ],
  sections: [
    {
      id: "notation",
      title: "Kets, bras and why the notation pays for itself",
      blocks: [
        {
          kind: "prose",
          text: "Dirac notation looks like decoration at first and turns out to be a small, well-designed type system. A **ket** $|\\psi\\rangle$ is a column vector — a state. A **bra** $\\langle\\psi|$ is its conjugate transpose, a row vector. Writing them adjacently produces different objects depending on the order, and the notation makes which one you have unmistakable.",
        },
        {
          kind: "equation",
          latex: "|\\psi\\rangle = \\begin{bmatrix} \\alpha \\\\ \\beta \\end{bmatrix}, \\qquad \\langle\\psi| = \\begin{bmatrix} \\overline{\\alpha} & \\overline{\\beta} \\end{bmatrix}",
          caption: "A bra is the conjugate transpose of its ket — transposed and conjugated.",
        },
        {
          kind: "comparison",
          title: "Inner versus outer product",
          columns: ["⟨ψ|φ⟩ — inner", "|ψ⟩⟨φ| — outer"],
          rows: [
            { aspect: "Shape", left: "(1×2)(2×1) = 1×1", right: "(2×1)(1×2) = 2×2" },
            { aspect: "Result", left: "A complex number", right: "An operator (a matrix)" },
            { aspect: "Meaning", left: "Overlap between two states", right: "A map that sends states to states" },
            { aspect: "Typical use", left: "Probability amplitudes", right: "Projectors, observables, density matrices" },
          ],
        },
        {
          kind: "callout",
          tone: "insight",
          title: "Order is everything",
          text: "⟨ψ|φ⟩ and |φ⟩⟨ψ| differ by more than arrangement — one is a scalar and the other a matrix. The notation makes the distinction visible at a glance, which is precisely why it survived.",
        },
      ],
    },
    {
      id: "projectors",
      title: "Projectors",
      blocks: [
        {
          kind: "prose",
          text: "The outer product of a normalised state with itself is the **projector** onto that state. Projectors are the operators that describe measurement outcomes: each possible result of a measurement has one, and applying it extracts the component of a state along that result.",
        },
        {
          kind: "equation",
          latex: "P_\\psi = |\\psi\\rangle\\langle\\psi|, \\qquad P_\\psi|\\varphi\\rangle = |\\psi\\rangle\\underbrace{\\langle\\psi|\\varphi\\rangle}_{\\text{a scalar}}",
          caption:
            "Applying a projector keeps only the part of |φ⟩ lying along |ψ⟩, scaled by their overlap.",
        },
        {
          kind: "derivation",
          title: "Projectors are idempotent",
          premise: "Let |ψ⟩ be normalised, so ⟨ψ|ψ⟩ = 1, and let P = |ψ⟩⟨ψ|.",
          steps: [
            {
              title: "Multiply P by itself",
              latex: "P^2 = |\\psi\\rangle\\langle\\psi|\\psi\\rangle\\langle\\psi|",
              explanation: "Associativity lets the inner pair ⟨ψ|ψ⟩ be evaluated on its own.",
            },
            {
              title: "Evaluate the inner product",
              latex: "= |\\psi\\rangle (1) \\langle\\psi| = |\\psi\\rangle\\langle\\psi| = P",
              explanation: "Normalisation collapses the middle factor to 1.",
            },
          ],
          conclusion:
            "P² = P. Projecting twice achieves nothing beyond projecting once, which is exactly the behaviour measurement should have: re-measuring an already-collapsed state returns the same outcome with certainty.",
        },
        {
          kind: "equation",
          latex: "P_0 + P_1 = |0\\rangle\\langle 0| + |1\\rangle\\langle 1| = I",
          caption:
            "The projectors for a complete set of outcomes sum to the identity — the statement that some outcome must occur.",
        },
      ],
    },
    {
      id: "operator-classes",
      title: "Unitary and Hermitian operators",
      blocks: [
        {
          kind: "prose",
          text: "Two classes of operator carry physical meaning, and they answer different questions. **Unitary** operators describe how a closed system evolves. **Hermitian** operators describe what can be measured.",
        },
        {
          kind: "comparison",
          title: "The two classes",
          columns: ["Unitary U", "Hermitian A"],
          rows: [
            { aspect: "Defining condition", left: "U†U = I", right: "A† = A" },
            { aspect: "Represents", left: "Evolution — every quantum gate", right: "An observable — something measurable" },
            { aspect: "Preserves", left: "Inner products, hence normalisation", right: "— (eigenvalues are real)" },
            { aspect: "Eigenvalues", left: "On the unit circle, e^{iθ}", right: "Real — as any measurement result must be" },
            { aspect: "Reversible", left: "Always: U⁻¹ = U†", right: "Not applicable" },
          ],
        },
        {
          kind: "derivation",
          title: "Unitarity is exactly what keeps probability at 1",
          premise: "Let |ψ⟩ be normalised and let U be unitary. Consider the evolved state U|ψ⟩.",
          steps: [
            {
              title: "Take the norm of the evolved state",
              latex: "\\langle U\\psi | U\\psi \\rangle = \\langle \\psi | U^\\dagger U | \\psi \\rangle",
              explanation: "Taking the adjoint of the ket U|ψ⟩ gives the bra ⟨ψ|U†.",
            },
            {
              title: "Apply the defining condition",
              latex: "= \\langle\\psi|I|\\psi\\rangle = \\langle\\psi|\\psi\\rangle = 1",
              explanation: "U†U = I collapses the middle, leaving the original norm untouched.",
            },
          ],
          conclusion:
            "Unitary evolution preserves total probability. This is why every quantum gate is unitary — and, since U† undoes U, why every quantum gate is reversible. Measurement is the sole non-unitary operation in the theory.",
        },
        {
          kind: "misconception",
          claim: "Since gates are reversible, quantum computers can undo any computation, including measurement.",
          correction:
            "Gates are reversible; measurement is not. Projection discards the component of the state orthogonal to the observed outcome, and that information is gone. Every quantum algorithm is a reversible unitary circuit terminated by an irreversible measurement — which is why the design problem is to make the answer overwhelmingly likely *before* that final, lossy step.",
        },
      ],
    },
  ],
  visual: {
    renderer: "linear-algebra",
    title: "Operators as matrices",
    caption:
      "Pick an operator and watch it act on a state. Check U†U for the unitary ones and confirm you get the identity; check P² for the projectors and confirm you get P back.",
    props: {
      operators: ["I", "X", "Y", "Z", "H", "S", "T", "P0", "P1"],
      showAdjoint: true,
      checks: ["unitarity", "hermiticity", "idempotence"],
      applyTo: ["|0>", "|1>", "|+>", "|->"],
    },
  },
  code: {
    title: "Verifying the operator properties",
    description:
      "Checks idempotence and completeness for projectors, unitarity for the gates, and confirms that the Pauli operators are Hermitian with real eigenvalues.",
    language: "python",
    code: `import numpy as np

ket_0 = np.array([[1], [0]], dtype=complex)
ket_1 = np.array([[0], [1]], dtype=complex)

def bra(ket):
    """The conjugate transpose of a ket."""
    return ket.conj().T

# Outer products give operators; inner products give numbers.
P0 = ket_0 @ bra(ket_0)
P1 = ket_1 @ bra(ket_1)

print("P0 =\\n", P0.real)
print(f"\\nP0 squared equals P0: {np.allclose(P0 @ P0, P0)}")
print(f"P0 + P1 equals I:     {np.allclose(P0 + P1, np.eye(2))}")

X = np.array([[0, 1], [1, 0]], dtype=complex)
Y = np.array([[0, -1j], [1j, 0]], dtype=complex)
Z = np.array([[1, 0], [0, -1]], dtype=complex)
H = np.array([[1, 1], [1, -1]], dtype=complex) / np.sqrt(2)
S = np.array([[1, 0], [0, 1j]], dtype=complex)

print("\\nGate      unitary   Hermitian   eigenvalues")
for name, U in (("X", X), ("Y", Y), ("Z", Z), ("H", H), ("S", S)):
    unitary = np.allclose(U.conj().T @ U, np.eye(2))
    hermitian = np.allclose(U.conj().T, U)
    eigs = np.linalg.eigvals(U)
    formatted = ", ".join(f"{e:.2f}" for e in eigs)
    print(f"{name:<9} {str(unitary):<9} {str(hermitian):<11} {formatted}")

# S is unitary but not Hermitian: it evolves states, it is not an observable.
print("\\nS is unitary but not Hermitian, so it is a gate and not a measurable quantity.")

# Hermitian operators have real eigenvalues -- required of any measurement outcome.
print(f"Z eigenvalues are real: {np.allclose(np.linalg.eigvals(Z).imag, 0)}")`,
    expectedOutput: ["P0 squared equals P0: True", "P0 + P1 equals I:     True"],
  },
  keyTakeaways: [
    "A ket is a column vector, a bra its conjugate transpose; ⟨ψ|φ⟩ is a number and |ψ⟩⟨φ| an operator",
    "Projectors satisfy P² = P, matching the fact that re-measuring changes nothing",
    "The projectors of a complete measurement sum to the identity",
    "Unitary operators preserve normalisation and are reversible — every gate is one",
    "Hermitian operators have real eigenvalues and represent observables",
    "Measurement is the only non-unitary, irreversible step in quantum mechanics",
  ],
  references: [
    { source: "Nielsen & Chuang, Quantum Computation and Quantum Information", locator: "§2.1.5–2.2.5" },
    { source: "Griffiths & Schroeter, Introduction to Quantum Mechanics", locator: "Chapter 3 (formalism)" },
  ],
};
