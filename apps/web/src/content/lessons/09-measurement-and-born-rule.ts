import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "measurement-and-born-rule",
  slug: "measurement-and-born-rule",
  order: 9,
  title: "Measurement and the Born Rule",
  subtitle: "The one irreversible step, and how sampling converges",
  summary:
    "What projective measurement does to a state, why repeated measurement gives the same answer, and how many shots you actually need to pin a probability down.",
  difficulty: "intermediate",
  estimatedMinutes: 24,
  prerequisites: ["dirac-notation", "superposition-and-hadamard"],
  objectives: [
    "Apply a projector to compute a post-measurement state",
    "Explain why measuring twice in a row gives the same outcome",
    "Estimate how many shots are needed for a given precision",
    "Distinguish a measurement basis from the state being measured",
  ],
  sections: [
    {
      id: "projective",
      title: "What measurement does",
      blocks: [
        {
          kind: "prose",
          text: "Every gate so far has been unitary: reversible, norm-preserving, and deterministic. Measurement is none of those. It is the only step in quantum mechanics that destroys information, and the only one whose outcome is genuinely random.",
        },
        {
          kind: "equation",
          latex: "P(m) = \\langle\\psi|P_m|\\psi\\rangle = \\|P_m|\\psi\\rangle\\|^2, \\qquad |\\psi'\\rangle = \\frac{P_m|\\psi\\rangle}{\\sqrt{P(m)}}",
          caption:
            "The probability of outcome m, and the state left behind. The denominator renormalises what the projector shortened.",
          where: [
            { symbol: "P_m", meaning: "the projector onto outcome m, for example |0⟩⟨0|" },
            { symbol: "|\\psi'\\rangle", meaning: "the post-measurement state — the component along the observed outcome, rescaled" },
          ],
        },
        {
          kind: "derivation",
          title: "Measuring |+⟩ and getting 0",
          premise: "Take |ψ⟩ = (|0⟩ + |1⟩)/√2 and suppose the measurement returns 0.",
          steps: [
            {
              title: "Project",
              latex: "P_0|\\psi\\rangle = |0\\rangle\\langle 0|\\psi\\rangle = \\tfrac{1}{\\sqrt{2}}|0\\rangle",
              explanation:
                "The projector keeps only the |0⟩ component. The |1⟩ part is discarded entirely — this is where the information is lost.",
            },
            {
              title: "Read off the probability",
              latex: "P(0) = \\left\\|\\tfrac{1}{\\sqrt{2}}|0\\rangle\\right\\|^2 = \\tfrac{1}{2}",
              explanation: "The squared length of what survived the projection.",
            },
            {
              title: "Renormalise",
              latex: "|\\psi'\\rangle = \\frac{(1/\\sqrt{2})|0\\rangle}{\\sqrt{1/2}} = |0\\rangle",
              explanation:
                "Projection shortens the vector, so it must be rescaled back to unit length for the result to be a physical state.",
            },
          ],
          conclusion:
            "The qubit is now exactly |0⟩. Measure again and you get 0 with certainty — the superposition is gone, and no later gate can recover which superposition it came from.",
        },
        {
          kind: "callout",
          tone: "insight",
          title: "This is why P² = P matters",
          text: "Projectors are idempotent, so applying one twice does nothing beyond applying it once. That algebraic fact is the same statement as the physical one: an immediate second measurement returns the first answer with certainty.",
        },
      ],
    },
    {
      id: "basis",
      title: "The basis is a choice",
      blocks: [
        {
          kind: "prose",
          text: "There is no such thing as measuring a qubit without choosing what to measure. The computational basis is a convention, not a property of the qubit, and hardware usually implements other bases by rotating the state first and then measuring in Z.",
        },
        {
          kind: "comparison",
          title: "The same state, three bases",
          columns: ["Measuring |+⟩", "Result"],
          rows: [
            { aspect: "Z basis (measure directly)", left: "P(0) = P(1) = ½", right: "Completely random" },
            { aspect: "X basis (H, then measure)", left: "P(0) = 1", right: "Completely certain" },
            { aspect: "Y basis (S†, H, then measure)", left: "P(0) = P(1) = ½", right: "Completely random" },
          ],
        },
        {
          kind: "misconception",
          claim: "A qubit in superposition gives a random result, so quantum computers are just randomness generators.",
          correction:
            "Randomness is a property of the state relative to the measurement, not of the qubit. |+⟩ is random in Z and certain in X. A well-designed algorithm arranges for the final state to be nearly an eigenstate of the measurement it performs, so the answer is close to deterministic — the randomness is what you get when you measure the wrong thing.",
        },
      ],
    },
    {
      id: "statistics",
      title: "How many shots?",
      blocks: [
        {
          kind: "prose",
          text: "A single run yields one bit. Recovering a probability means running many times and counting, which makes shot budgeting a practical question with a precise answer.",
        },
        {
          kind: "equation",
          latex: "\\sigma = \\sqrt{\\frac{p(1-p)}{N}}",
          caption:
            "Standard error on an estimated probability after N shots. Halving the error costs four times the shots.",
          where: [
            { symbol: "p", meaning: "the true probability being estimated" },
            { symbol: "N", meaning: "number of shots" },
          ],
        },
        {
          kind: "comparison",
          title: "Shots needed for p = 0.5",
          columns: ["Shots", "Typical error"],
          rows: [
            { aspect: "10", left: "σ ≈ 0.158", right: "Estimates scatter across roughly 0.34–0.66" },
            { aspect: "100", left: "σ ≈ 0.050", right: "Two significant figures are unreliable" },
            { aspect: "1,024", left: "σ ≈ 0.016", right: "The usual default — about 1.6% precision" },
            { aspect: "10,000", left: "σ ≈ 0.005", right: "Half a percent" },
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "The 1/√N wall",
          text: "Precision improves only as the square root of the shot count, so every extra digit costs a hundred times more runs. This is why algorithms that estimate expectation values — VQE most of all — spend the overwhelming majority of their wall-clock time sampling rather than computing.",
        },
      ],
    },
  ],
  visual: {
    renderer: "quantum-data-plot",
    title: "Where the amplitude goes",
    caption:
      "Before measurement both amplitudes are real and equal. Measurement keeps one and discards the other — and no subsequent gate can tell you which superposition it came from.",
    props: {
      mode: "amplitude-steps",
      signed: true,
      steps: [
        { label: "|0⟩", amplitudes: { "0": 1, "1": 0 } },
        { label: "after H", amplitudes: { "0": 0.7071, "1": 0.7071 } },
        { label: "measured 0", amplitudes: { "0": 1, "1": 0 } },
      ],
      annotate: { "1": "discarded by the projection — irreversibly" },
    },
  },
  circuit: {
    title: "An honest coin",
    description:
      "One Hadamard and a measurement. Run it at 100 shots and again at 8192, and watch the counts settle towards 50/50 at the rate 1/√N predicts.",
    numQubits: 1,
    numClbits: 1,
    operations: [
      { id: "op-h", gate: "h", targets: [0], note: "Puts the qubit in |+⟩ — equal amplitudes, opposite to a hidden coin." },
      { id: "op-m", gate: "measure", targets: [0], clbits: [0], note: "Projects onto |0⟩ or |1⟩, each with probability ½, and destroys the superposition." },
    ],
    expected: { "0": 0.5, "1": 0.5 },
  },
  code: {
    title: "Watching the estimate converge",
    description:
      "Samples the same circuit at increasing shot counts and compares the observed error against the 1/√N prediction.",
    language: "python",
    code: `import numpy as np
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

qc = QuantumCircuit(1, 1)
qc.h(0)
qc.measure(0, 0)

simulator = AerSimulator()
truth = 0.5

print(" shots     P(0)     error    predicted sigma")
for shots in (10, 100, 1024, 8192, 100000):
    counts = simulator.run(qc, shots=shots, seed_simulator=7).result().get_counts()
    p0 = counts.get("0", 0) / shots
    sigma = np.sqrt(truth * (1 - truth) / shots)
    print(f"{shots:7d}   {p0:.4f}   {abs(p0 - truth):.4f}   {sigma:.4f}")

print()
print("Error shrinks like 1/sqrt(N): a hundredfold increase in shots buys")
print("one extra digit of precision, which is why sampling dominates runtime.")`,
    expectedOutput: ["Error shrinks like 1/sqrt(N)"],
  },
  keyTakeaways: [
    "Measurement projects the state onto the observed outcome and renormalises, discarding everything orthogonal to it",
    "P² = P is the algebra behind the fact that an immediate repeat measurement gives the same answer",
    "Randomness depends on the basis: |+⟩ is random in Z and certain in X",
    "Estimating a probability to precision σ needs about p(1−p)/σ² shots",
    "Precision improves only as 1/√N, which is why sampling dominates the runtime of variational algorithms",
  ],
  references: [
    { source: "Nielsen & Chuang, Quantum Computation and Quantum Information", locator: "§2.2.3, §2.2.5" },
    { source: "Griffiths & Schroeter, Introduction to Quantum Mechanics", locator: "Chapter 3 (the measurement postulate)" },
  ],
};
