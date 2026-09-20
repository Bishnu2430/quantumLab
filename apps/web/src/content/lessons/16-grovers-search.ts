import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "grovers-search",
  slug: "grovers-search",
  order: 16,
  title: "Grover's Search Algorithm",
  subtitle: "Amplitude amplification, and why more iterations can hurt",
  summary:
    "How marking and reflecting rotate amplitude onto the answer, why the speedup is quadratic rather than exponential, and why overshooting the optimal iteration count makes things worse.",
  difficulty: "advanced",
  estimatedMinutes: 30,
  prerequisites: ["deutsch-jozsa"],
  objectives: [
    "Describe the oracle and diffuser as two reflections",
    "Explain why the state rotates by a fixed angle each iteration",
    "Compute the optimal number of iterations for a given N",
    "Say why Grover cannot be exponential",
  ],
  sections: [
    {
      id: "problem",
      title: "Unstructured search",
      blocks: [
        {
          kind: "prose",
          text: "Given a function that recognises the right answer but offers no structure to exploit, classical search must try candidates one at a time — N/2 on average, N in the worst case. Grover finds it in about √N queries.",
        },
        {
          kind: "prose",
          text: "The quadratic improvement is smaller than the exponential ones elsewhere, but it applies to a very wide class of problems, and unlike Deutsch–Jozsa it survives against randomised classical algorithms. It is also provably optimal: no quantum algorithm can do better for a black-box oracle.",
        },
      ],
    },
    {
      id: "geometry",
      title: "Two reflections make a rotation",
      blocks: [
        {
          kind: "prose",
          text: "The state always stays in the two-dimensional plane spanned by the marked state |w⟩ and the uniform superposition over everything else. Each Grover iteration is two reflections inside that plane, and two reflections compose into a rotation.",
        },
        {
          kind: "comparison",
          title: "The two halves of an iteration",
          columns: ["Oracle", "Diffuser"],
          rows: [
            { aspect: "Action", left: "Negates the amplitude of the marked state", right: "Reflects every amplitude about the mean" },
            { aspect: "Geometrically", left: "Reflection about the unmarked subspace", right: "Reflection about the uniform superposition" },
            { aspect: "Effect on |w⟩ alone", left: "Sign flip, no probability change", right: "Converts that sign into extra amplitude" },
            { aspect: "Implemented as", left: "A phase oracle, here a CZ", right: "H⊗ⁿ · (2|0⟩⟨0| − I) · H⊗ⁿ" },
          ],
        },
        {
          kind: "callout",
          tone: "insight",
          title: "The oracle alone accomplishes nothing",
          text: "Flipping the sign of one amplitude leaves every probability unchanged — |−a|² = |a|². It is the diffuser, reflecting about the mean, that turns that sign into amplitude. Neither step is useful alone; the algorithm is entirely in their composition.",
        },
        {
          kind: "derivation",
          title: "The rotation angle",
          premise:
            "Write the uniform superposition as |s⟩ = sin θ |w⟩ + cos θ |w⊥⟩, where |w⊥⟩ is the normalised superposition of the unmarked states.",
          steps: [
            {
              title: "Read off the starting angle",
              latex: "\\sin\\theta = \\frac{1}{\\sqrt{N}}",
              explanation:
                "The uniform superposition gives each of N states amplitude 1/√N, and exactly one is marked. For large N, θ ≈ 1/√N — a small angle.",
            },
            {
              title: "Compose the two reflections",
              latex: "\\text{each iteration rotates by } 2\\theta",
              explanation:
                "Two reflections about lines separated by θ produce a rotation by 2θ. This is ordinary plane geometry; nothing quantum enters here.",
            },
            {
              title: "Rotate until the state reaches |w⟩",
              latex: "(2k+1)\\theta \\approx \\frac{\\pi}{2} \\;\\Rightarrow\\; k \\approx \\frac{\\pi}{4}\\sqrt{N}",
              explanation:
                "Starting at θ and adding 2θ per iteration, the state reaches the marked axis after about (π/4)√N steps.",
            },
          ],
          conclusion:
            "The √N scaling comes from the angle: each iteration buys a fixed rotation of 2θ ≈ 2/√N, so about √N of them are needed. The quadratic speedup is geometry, not magic.",
        },
      ],
    },
    {
      id: "overshoot",
      title: "Stopping at the right moment",
      blocks: [
        {
          kind: "prose",
          text: "Because the state rotates steadily, continuing past the optimum carries it *past* the marked state and the success probability falls again. Grover's algorithm is periodic, and running it longer is not safer.",
        },
        {
          kind: "comparison",
          title: "Iterations for N = 4, one marked item",
          columns: ["Iterations", "P(marked)"],
          rows: [
            { aspect: "0", left: "Uniform superposition", right: "0.25" },
            { aspect: "1", left: "Optimal — θ = 30°, so (2·1+1)·30° = 90°", right: "1.00" },
            { aspect: "2", left: "Overshot by 60°", right: "0.25" },
            { aspect: "3", left: "Overshot further", right: "0.25" },
          ],
        },
        {
          kind: "callout",
          tone: "insight",
          title: "N = 4 is the perfect case",
          text: "With four items, sin θ = 1/2 gives θ = 30° exactly, and a single iteration lands precisely on 90° — the marked state with probability exactly 1. That exactness is a coincidence of N = 4; for other N the optimum is approximate and success probability tops out slightly below 1.",
        },
        {
          kind: "misconception",
          claim: "Grover searches a database of N items in √N time, so it beats any classical database lookup.",
          correction:
            "It needs an oracle that recognises the answer, not a stored list. If the data really is sitting in memory, loading it into a quantum state costs O(N) to begin with, which wipes out the gain. Grover pays off when the 'database' is implicitly defined by a function you can evaluate — satisfying assignments to a formula, say — rather than when it is an actual table.",
        },
      ],
    },
  ],
  visual: {
    renderer: "grover-studio",
    title: "Grover amplification laboratory",
    caption:
      "Step through iterations and watch the marked amplitude grow while the rest shrinks. Keep going past the optimum and the effect reverses — the state rotates straight past the answer.",
  },
  circuit: {
    title: "Grover on four items, one iteration",
    description:
      "Two qubits give N = 4. The oracle marks |11⟩ and the diffuser converts that mark into amplitude. One iteration is exactly optimal here, so the answer comes out with certainty.",
    numQubits: 2,
    numClbits: 2,
    operations: [
      { id: "op-h0", gate: "h", targets: [0], note: "Builds the uniform superposition over all four states." },
      { id: "op-h1", gate: "h", targets: [1], note: "Each state now carries amplitude 1/2." },
      {
        id: "op-oracle",
        gate: "cz",
        targets: [1],
        controls: [0],
        note: "The oracle: negates the amplitude of |11⟩ only. Probabilities are unchanged — so far this has done nothing measurable.",
      },
      { id: "op-d-h0", gate: "h", targets: [0], note: "Diffuser begins: rotate into the basis where reflection about the mean is simple." },
      { id: "op-d-h1", gate: "h", targets: [1], note: "Same for qubit 1." },
      { id: "op-d-x0", gate: "x", targets: [0], note: "Maps |00⟩ to |11⟩ so the CZ can act as a reflection about |0…0⟩." },
      { id: "op-d-x1", gate: "x", targets: [1], note: "Same for qubit 1." },
      { id: "op-d-cz", gate: "cz", targets: [1], controls: [0], note: "The conditional phase at the heart of the reflection." },
      { id: "op-d-x0b", gate: "x", targets: [0], note: "Undoes the earlier X." },
      { id: "op-d-x1b", gate: "x", targets: [1], note: "Undoes the earlier X." },
      { id: "op-d-h0b", gate: "h", targets: [0], note: "Returns to the computational basis." },
      { id: "op-d-h1b", gate: "h", targets: [1], note: "Diffuser complete: all amplitude now sits on the marked state." },
    ],
    expected: { "00": 0.0, "01": 0.0, "10": 0.0, "11": 1.0 },
  },
  code: {
    title: "Watching amplitude move, and then move back",
    description:
      "Runs Grover on three qubits for successive iteration counts, printing the success probability so the optimum and the subsequent decline are both visible.",
    language: "python",
    code: `import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

N_QUBITS = 3
MARKED = "111"
N = 2 ** N_QUBITS

def diffuser(qc: QuantumCircuit, qubits: list[int]) -> None:
    """Reflection about the uniform superposition."""
    qc.h(qubits)
    qc.x(qubits)
    qc.h(qubits[-1])
    qc.mcx(qubits[:-1], qubits[-1])
    qc.h(qubits[-1])
    qc.x(qubits)
    qc.h(qubits)

def grover(iterations: int) -> float:
    qubits = list(range(N_QUBITS))
    qc = QuantumCircuit(N_QUBITS)
    qc.h(qubits)

    for _ in range(iterations):
        # Oracle marking |111>: a multi-controlled Z.
        qc.h(qubits[-1])
        qc.mcx(qubits[:-1], qubits[-1])
        qc.h(qubits[-1])
        diffuser(qc, qubits)

    probabilities = Statevector.from_instruction(qc).probabilities_dict()
    return probabilities.get(MARKED, 0.0)

optimal = int(round(np.pi / 4 * np.sqrt(N)))
print(f"N = {N} items, optimal iterations ~= (pi/4)*sqrt(N) = {optimal}")
print()
print("iterations   P(marked)")
for k in range(7):
    p = grover(k)
    bar = "#" * int(round(p * 40))
    flag = "  <- optimal" if k == optimal else ""
    print(f"{k:10d}   {p:.4f}  {bar}{flag}")

print()
print("Past the optimum the probability falls: the state rotates straight")
print("through the marked axis and out the other side.")`,
    expectedOutput: ["optimal iterations", "Past the optimum the probability falls"],
  },
  keyTakeaways: [
    "Each iteration is two reflections, which compose into a fixed rotation of 2θ",
    "sin θ = 1/√N, so about (π/4)√N iterations are needed — the speedup is geometric in origin",
    "The oracle alone changes no probability; the diffuser converts its sign flip into amplitude",
    "Running too many iterations overshoots and lowers the success probability",
    "The quadratic speedup is provably optimal for a black-box oracle, and does not apply to a stored database",
  ],
  references: [
    { source: "Grover, A fast quantum mechanical algorithm for database search", locator: "STOC 1996, p. 212" },
    { source: "Bennett, Bernstein, Brassard & Vazirani, Strengths and weaknesses of quantum computing", locator: "SIAM J. Comput. 26, 1510 (1997)" },
    { source: "Nielsen & Chuang, Quantum Computation and Quantum Information", locator: "§6.1–6.2" },
  ],
};
