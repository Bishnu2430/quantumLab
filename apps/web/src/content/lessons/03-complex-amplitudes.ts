import type { Lesson } from "../types";

/**
 * Mathematical foundations. No circuit: nothing here is clarified by applying
 * gates, and a token circuit would be decoration. The numpy snippet earns its
 * place because the inner-product machinery is worth computing by hand once.
 */
export const lesson: Lesson = {
  id: "complex-amplitudes",
  slug: "complex-amplitudes",
  order: 3,
  title: "Complex Amplitudes and Hilbert Space",
  subtitle: "Why quantum mechanics needs complex numbers, not just probabilities",
  summary:
    "Complex amplitudes, the inner product that measures overlap between states, and why the squared magnitude is the only sensible way to extract a probability.",
  difficulty: "beginner",
  estimatedMinutes: 20,
  prerequisites: [],
  objectives: [
    "Write a complex number in both Cartesian and polar form and convert between them",
    "Compute the inner product ⟨ψ|φ⟩ of two state vectors",
    "Explain why probability is |amplitude|² rather than the amplitude itself",
    "Show that orthogonal states are exactly the perfectly distinguishable ones",
  ],
  sections: [
    {
      id: "why-complex",
      title: "Why complex numbers are not optional",
      blocks: [
        {
          kind: "prose",
          text: "Classical probability theory uses non-negative real numbers that sum to one. It is perfectly adequate for describing ignorance — and it cannot describe interference, because non-negative numbers never cancel. Adding two possibilities can only ever make an outcome more likely.",
        },
        {
          kind: "prose",
          text: "Quantum mechanics assigns each outcome a complex **amplitude** instead. Amplitudes add, and because they carry a sign and more generally a phase, they can cancel. Probability is recovered at the end by squaring the magnitude. That extra structure is what buys interference.",
        },
        {
          kind: "equation",
          latex: "z = a + bi = re^{i\\varphi}, \\qquad r = |z| = \\sqrt{a^2 + b^2}, \\qquad \\varphi = \\arg(z)",
          caption:
            "A complex number carries two pieces of information: a magnitude and a phase. Both matter, but they matter in different ways.",
          where: [
            { symbol: "r", meaning: "magnitude — determines how much this outcome contributes to probability" },
            { symbol: "\\varphi", meaning: "phase — invisible on its own, decisive when amplitudes are combined" },
          ],
        },
        {
          kind: "callout",
          tone: "insight",
          title: "The minimal example",
          text: "Take amplitudes +1/√2 and −1/√2. Each has magnitude 1/√2, so each alone would give probability ½. Add them and you get exactly 0 — the outcome becomes impossible. No assignment of classical probabilities to the same two paths can do this, because ½ + ½ is never 0.",
        },
      ],
    },
    {
      id: "hilbert",
      title: "State space",
      blocks: [
        {
          kind: "prose",
          text: "The states of an isolated quantum system live in a **Hilbert space**: a complex vector space equipped with an inner product. For a single qubit that space is $\\mathbb{C}^2$, and for $n$ qubits it is $\\mathbb{C}^{2^n}$ — a dimension that doubles with every qubit added, which is the origin of both the promise and the simulation cost.",
        },
        {
          kind: "equation",
          latex: "\\langle\\psi|\\varphi\\rangle = \\sum_{k} \\overline{\\psi_k}\\,\\varphi_k",
          caption:
            "The inner product: conjugate the first vector's components, then sum the products. It measures the overlap between two states.",
          where: [
            { symbol: "\\overline{\\psi_k}", meaning: "complex conjugate — without it the norm would not be real and non-negative" },
          ],
        },
        {
          kind: "prose",
          text: "The conjugation is not a convention that could have gone the other way. It is what makes $\\langle\\psi|\\psi\\rangle = \\sum_k |\\psi_k|^2$ a sum of non-negative reals, so that it can serve as a squared length — and therefore as a total probability.",
        },
        {
          kind: "comparison",
          title: "What the inner product tells you",
          columns: ["Value of ⟨ψ|φ⟩", "Meaning"],
          rows: [
            { aspect: "0", left: "Orthogonal", right: "Perfectly distinguishable: some measurement separates them with certainty" },
            { aspect: "Magnitude 1", left: "Identical up to global phase", right: "The same physical state; no measurement tells them apart" },
            { aspect: "Between 0 and 1", left: "Partial overlap", right: "|⟨ψ|φ⟩|² is the probability of finding |ψ⟩ when measuring a system prepared in |φ⟩" },
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Cauchy–Schwarz sets the ceiling",
          text: "The inequality |⟨ψ|φ⟩| ≤ ‖ψ‖·‖φ‖ guarantees that for normalised states the overlap never exceeds 1. This is what stops the Born rule from ever producing a probability above 1 — a constraint the mathematics enforces rather than one imposed by hand.",
        },
      ],
    },
    {
      id: "born",
      title: "Why the square",
      blocks: [
        {
          kind: "derivation",
          title: "The squared magnitude is forced, not chosen",
          premise:
            "Suppose probability were some function f of the amplitude, and that a state expressed in any orthonormal basis must yield a total probability of 1.",
          steps: [
            {
              title: "Normalisation must hold in every basis",
              latex: "\\sum_k f(\\psi_k) = 1 \\quad \\text{for every orthonormal basis}",
              explanation:
                "A basis is a bookkeeping choice, not a physical fact. Total probability cannot depend on which one you happen to write the state in.",
            },
            {
              title: "Changing basis is a unitary transformation",
              latex: "\\psi \\mapsto U\\psi, \\qquad U^\\dagger U = I",
              explanation:
                "Unitary maps are exactly the linear maps preserving the inner product, and so the ones relating orthonormal bases.",
            },
            {
              title: "Only the squared magnitude survives every unitary",
              latex: "\\sum_k |(U\\psi)_k|^2 = \\langle U\\psi | U\\psi \\rangle = \\langle \\psi | U^\\dagger U | \\psi \\rangle = \\langle\\psi|\\psi\\rangle = \\sum_k |\\psi_k|^2",
              explanation:
                "The squared magnitude is preserved by construction. Any other candidate — the amplitude itself, its magnitude, its fourth power — fails to sum to 1 in some rotated basis.",
            },
          ],
          conclusion:
            "P = |amplitude|² is the unique rule consistent with basis independence. Gleason's theorem makes this precise: in dimension 3 or higher it is the only probability rule compatible with the structure of the space at all.",
        },
        {
          kind: "misconception",
          claim: "The amplitude is just an unusual way of writing the probability.",
          correction:
            "Amplitudes carry strictly more information. Two states can assign identical probabilities to every computational-basis outcome and still be perfectly distinguishable — |+⟩ and |−⟩ both give 50/50, yet they are orthogonal. The phase discarded by squaring is exactly what interference uses.",
        },
      ],
    },
  ],
  visual: {
    renderer: "complex-plane",
    title: "Amplitudes in the complex plane",
    caption:
      "Drag each amplitude and watch the sum. Keep both magnitudes fixed and change only the relative phase: the probabilities of the individual outcomes never move, but the magnitude of their sum sweeps from full reinforcement to total cancellation.",
    props: {
      vectors: [
        { id: "a", label: "α", re: 0.7071, im: 0 },
        { id: "b", label: "β", re: 0.7071, im: 0 },
      ],
      showSum: true,
      showMagnitudeSquared: true,
      draggable: true,
    },
  },
  code: {
    title: "Inner products, norms and orthogonality",
    description:
      "Verifies normalisation, checks Cauchy–Schwarz, and demonstrates that |+⟩ and |−⟩ are orthogonal despite giving identical measurement statistics.",
    language: "python",
    code: `import numpy as np

ket_0 = np.array([1, 0], dtype=complex)
ket_1 = np.array([0, 1], dtype=complex)

ket_plus  = (ket_0 + ket_1) / np.sqrt(2)
ket_minus = (ket_0 - ket_1) / np.sqrt(2)

def inner(psi, phi):
    """<psi|phi> -- conjugate the bra, then contract."""
    return np.vdot(psi, phi)

print(f"<+|+> = {inner(ket_plus, ket_plus).real:.6f}   (normalised)")
print(f"<+|-> = {inner(ket_plus, ket_minus).real:.6f}   (orthogonal)")

# Identical statistics in the computational basis...
for name, state in (("|+>", ket_plus), ("|->", ket_minus)):
    p0, p1 = abs(state[0])**2, abs(state[1])**2
    print(f"{name}: P(0) = {p0:.4f}, P(1) = {p1:.4f}")

# ...yet perfectly distinguishable, because they are orthogonal.
print(f"\\noverlap |<+|->|^2 = {abs(inner(ket_plus, ket_minus))**2:.6f}")

# Cauchy-Schwarz bounds the overlap by the product of the norms.
psi = np.array([0.6, 0.8j], dtype=complex)
phi = np.array([1, 1], dtype=complex) / np.sqrt(2)
lhs = abs(inner(psi, phi))
rhs = np.linalg.norm(psi) * np.linalg.norm(phi)
print(f"\\n|<psi|phi>| = {lhs:.6f} <= {rhs:.6f} = ||psi|| ||phi||")
print(f"Cauchy-Schwarz holds: {lhs <= rhs + 1e-12}")

# Interference: same magnitudes, opposite phases, nothing left.
a, b = 1/np.sqrt(2), -1/np.sqrt(2)
print(f"\\n|a|^2 = {abs(a)**2:.4f}, |b|^2 = {abs(b)**2:.4f}, |a+b|^2 = {abs(a+b)**2:.4f}")`,
    expectedOutput: ["<+|-> = 0.000000", "Cauchy-Schwarz holds: True"],
  },
  keyTakeaways: [
    "Amplitudes are complex, so they can cancel; classical probabilities are non-negative and cannot",
    "The inner product ⟨ψ|φ⟩ conjugates the bra, which is what makes ⟨ψ|ψ⟩ a real, non-negative length",
    "Orthogonal states are precisely the perfectly distinguishable ones",
    "P = |amplitude|² is the unique rule that keeps total probability at 1 in every basis",
    "n qubits span a space of dimension 2ⁿ, which is why classical simulation gets expensive so quickly",
  ],
  references: [
    { source: "Nielsen & Chuang, Quantum Computation and Quantum Information", locator: "§2.1" },
    { source: "Axler, Linear Algebra Done Right", locator: "Chapter 6 (inner product spaces)" },
  ],
};
