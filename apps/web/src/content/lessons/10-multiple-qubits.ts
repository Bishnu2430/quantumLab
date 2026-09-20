import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "multiple-qubits",
  slug: "multiple-qubits",
  order: 10,
  title: "Multiple Qubits and Tensor Products",
  subtitle: "Where the exponential actually comes from",
  summary:
    "How two qubits combine into a four-dimensional space, what the tensor product does, and why bit ordering trips up everyone at least once.",
  difficulty: "intermediate",
  estimatedMinutes: 22,
  prerequisites: ["complex-amplitudes", "pauli-gates"],
  objectives: [
    "Form the tensor product of two single-qubit states",
    "Count the parameters an n-qubit state requires",
    "Apply a single-qubit gate inside a multi-qubit register",
    "Read Qiskit's bit ordering without guessing",
  ],
  sections: [
    {
      id: "combining",
      title: "Combining two qubits",
      blocks: [
        {
          kind: "prose",
          text: "Two classical bits have four possible values. Two qubits have a four-dimensional state space — one complex amplitude for each of those values, all present at once.",
        },
        {
          kind: "equation",
          latex: "|\\psi\\rangle = \\alpha_{00}|00\\rangle + \\alpha_{01}|01\\rangle + \\alpha_{10}|10\\rangle + \\alpha_{11}|11\\rangle, \\qquad \\sum |\\alpha_{ij}|^2 = 1",
          caption: "A general two-qubit state: four complex amplitudes, one normalisation constraint.",
        },
        {
          kind: "prose",
          text: "When two qubits are prepared independently, the joint state is their **tensor product** — every amplitude of the first multiplied by every amplitude of the second.",
        },
        {
          kind: "derivation",
          title: "Building |+⟩ ⊗ |+⟩",
          premise: "Put each of two qubits into |+⟩ = (|0⟩ + |1⟩)/√2 and combine them.",
          steps: [
            {
              title: "Write the product",
              latex: "|{+}\\rangle \\otimes |{+}\\rangle = \\tfrac{1}{\\sqrt{2}}(|0\\rangle + |1\\rangle) \\otimes \\tfrac{1}{\\sqrt{2}}(|0\\rangle + |1\\rangle)",
              explanation: "The tensor product distributes over addition exactly like ordinary multiplication.",
            },
            {
              title: "Expand",
              latex: "= \\tfrac{1}{2}\\left(|00\\rangle + |01\\rangle + |10\\rangle + |11\\rangle\\right)",
              explanation: "Four terms, each with amplitude ½ — every combination appears once.",
            },
            {
              title: "Square for probabilities",
              latex: "|\\tfrac{1}{2}|^2 = \\tfrac{1}{4} \\text{ for each outcome}",
              explanation: "A uniform distribution over all four basis states, which is what two independent coins give.",
            },
          ],
          conclusion:
            "Two Hadamards on two qubits produce an equal superposition of all four basis states. Generalise to n qubits and one layer of Hadamards spans all 2ⁿ states at once — the starting move of nearly every quantum algorithm.",
        },
      ],
    },
    {
      id: "exponential",
      title: "The exponential, precisely",
      blocks: [
        {
          kind: "prose",
          text: "Each additional qubit doubles the dimension of the state space. This is the fact usually quoted as the source of quantum power, and it is worth being exact about what it does and does not give you.",
        },
        {
          kind: "comparison",
          title: "Classical bits versus qubits",
          columns: ["n classical bits", "n qubits"],
          rows: [
            { aspect: "Possible values", left: "2ⁿ, one at a time", right: "2ⁿ basis states, all with amplitudes" },
            { aspect: "Numbers to describe the state", left: "n", right: "2ⁿ complex amplitudes" },
            { aspect: "At n = 50", left: "50 bits", right: "~10¹⁵ amplitudes — about 16 petabytes" },
            { aspect: "What you can read out", left: "all n bits", right: "n bits, chosen randomly by the Born rule" },
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "The readout is the catch",
          text: "A 50-qubit register does carry 10¹⁵ amplitudes, which is why classical simulation becomes hopeless around there. But measuring it yields 50 bits, once. The amplitudes are real and they matter — through interference — yet they are never directly readable. Any claim of 'exponential storage' that ignores this is wrong.",
        },
      ],
    },
    {
      id: "gates-and-ordering",
      title: "Gates on a register, and bit ordering",
      blocks: [
        {
          kind: "prose",
          text: "A single-qubit gate acting inside a larger register is the tensor product of that gate with identities on every other qubit. Applying H to qubit 0 of a two-qubit register means the operator H ⊗ I, or I ⊗ H, depending on a convention that catches everyone once.",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Qiskit writes qubit 0 on the right",
          text: "In Qiskit's convention the basis state |q₁q₀⟩ puts qubit 0 in the rightmost position — the opposite of how circuit diagrams stack wires top to bottom. So applying X to qubit 0 of |00⟩ gives the string \"01\", not \"10\". Every result in this course follows that convention; if a count looks mirrored, this is almost always why.",
        },
        {
          kind: "misconception",
          claim: "A two-qubit state is just a pair of single-qubit states.",
          correction:
            "Only sometimes. States that factor as |a⟩ ⊗ |b⟩ are called product states, and those really are two independent qubits. But most two-qubit states do not factor at all — a Bell state is the standard example — and those are entangled. Four complex amplitudes minus normalisation and global phase leaves six real parameters, while two independent qubits need only four; the two extra parameters are exactly where entanglement lives.",
        },
      ],
    },
  ],
  visual: {
    renderer: "multi-qubit-matrix",
    title: "Multi-qubit matrix laboratory",
    caption:
      "Build tensor products and watch the dimension double with each qubit. Compare a product state against an entangled one and see which can be factored back apart.",
  },
  circuit: {
    title: "Two Hadamards, four outcomes",
    description:
      "One Hadamard on each qubit spans all four basis states equally. The state still factors as |+⟩ ⊗ |+⟩, so despite appearances nothing here is entangled.",
    numQubits: 2,
    numClbits: 2,
    operations: [
      { id: "op-h0", gate: "h", targets: [0], note: "Puts qubit 0 into |+⟩, independently of qubit 1." },
      { id: "op-h1", gate: "h", targets: [1], note: "Same for qubit 1. The joint state is the product of the two." },
    ],
    expected: { "00": 0.25, "01": 0.25, "10": 0.25, "11": 0.25 },
  },
  code: {
    title: "Tensor products and separability",
    description:
      "Builds a product state with np.kron, then tests both a product state and a Bell state for separability — the check that tells entanglement from mere superposition.",
    language: "python",
    code: `import numpy as np

ket_0 = np.array([1, 0], dtype=complex)
ket_1 = np.array([0, 1], dtype=complex)
ket_plus = (ket_0 + ket_1) / np.sqrt(2)

product = np.kron(ket_plus, ket_plus)
print("|+> (x) |+> =", np.round(product, 4))
print("probabilities:", np.round(abs(product) ** 2, 4))

bell = (np.kron(ket_0, ket_0) + np.kron(ket_1, ket_1)) / np.sqrt(2)
print()
print("Bell state  =", np.round(bell, 4))
print("probabilities:", np.round(abs(bell) ** 2, 4))

def is_separable(state):
    """A two-qubit state factors exactly when its 2x2 amplitude matrix has rank 1."""
    matrix = state.reshape(2, 2)
    singular = np.linalg.svd(matrix, compute_uv=False)
    return np.isclose(singular[1], 0.0, atol=1e-9), singular

for name, state in (("product", product), ("bell", bell)):
    separable, singular = is_separable(state)
    print()
    print(f"{name}: singular values {np.round(singular, 4)}")
    print(f"  separable: {separable}")

print()
print("The product state has one non-zero singular value, so it factors.")
print("The Bell state has two, so no pair of single-qubit states reproduces it.")

for n in (1, 2, 10, 50):
    print(f"n = {n:2d} qubits -> {2**n:,} amplitudes")`,
    expectedOutput: ["separable: True", "separable: False"],
  },
  keyTakeaways: [
    "n qubits span a 2ⁿ-dimensional space, needing 2ⁿ complex amplitudes to describe",
    "Independently prepared qubits combine by tensor product, and such states are called product states",
    "The exponential is real but the readout is not: measuring n qubits yields n bits",
    "Qiskit writes qubit 0 rightmost, so X on qubit 0 of |00⟩ gives \"01\"",
    "A two-qubit state has six real parameters against four for two separate qubits; the surplus is entanglement",
  ],
  references: [
    { source: "Nielsen & Chuang, Quantum Computation and Quantum Information", locator: "§1.2, §2.1.7" },
    { source: "Axler, Linear Algebra Done Right", locator: "Tensor products and multilinear maps" },
  ],
};
