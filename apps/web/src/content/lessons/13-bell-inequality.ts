import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "bell-inequality",
  slug: "bell-inequality",
  order: 13,
  title: "Bell's Inequality and CHSH",
  subtitle: "An experiment that rules out a whole class of explanations",
  summary:
    "Why 'the outcomes were decided in advance' is a testable claim, the bound it implies, and how quantum mechanics exceeds that bound by exactly √2.",
  difficulty: "advanced",
  estimatedMinutes: 28,
  prerequisites: ["entanglement-and-bell-states"],
  objectives: [
    "State the assumptions behind the CHSH bound S ≤ 2",
    "Compute the quantum correlation E(a, b) = −cos(a − b) for a Bell state",
    "Show where the Tsirelson bound 2√2 comes from",
    "Explain what the loophole-free experiments actually closed",
  ],
  sections: [
    {
      id: "the-question",
      title: "A question that sounds unanswerable",
      blocks: [
        {
          kind: "prose",
          text: "Measuring one half of a Bell pair gives a random bit; measuring the other gives the same bit. An obvious explanation is that the answers were fixed when the pair was created and simply read out later — like two sealed envelopes carrying matching notes.",
        },
        {
          kind: "prose",
          text: "Einstein, Podolsky and Rosen argued in 1935 that the correlations indicated exactly this: quantum mechanics was incomplete, and some **local hidden variable** supplied the missing detail. For thirty years it looked like a matter of philosophical taste.",
        },
        {
          kind: "callout",
          tone: "history",
          title: "Bell, 1964",
          text: "John Bell showed the question was empirical after all. Any theory in which outcomes are predetermined locally must obey an inequality that quantum mechanics violates. Two competing worldviews were suddenly separated by a number you could go and measure.",
        },
      ],
    },
    {
      id: "chsh",
      title: "The CHSH bound",
      blocks: [
        {
          kind: "prose",
          text: "Two parties each choose one of two measurement settings — Alice picks a or a′, Bob picks b or b′ — and each records ±1. Repeat many times and compute the correlation E for each of the four setting pairs.",
        },
        {
          kind: "equation",
          latex: "S = E(a,b) - E(a,b') + E(a',b) + E(a',b')",
          caption: "The CHSH quantity: a particular combination of four correlations.",
        },
        {
          kind: "derivation",
          title: "Why local realism caps S at 2",
          premise:
            "Assume each particle carries predetermined outcomes A(a), A(a′), B(b), B(b′), each ±1, fixed before any measurement and unaffected by the distant choice.",
          steps: [
            {
              title: "Group the terms for a single run",
              latex: "A(a)B(b) - A(a)B(b') + A(a')B(b) + A(a')B(b') = A(a)\\big[B(b) - B(b')\\big] + A(a')\\big[B(b) + B(b')\\big]",
              explanation: "Factor out Alice's two outcomes. This step needs the values to exist simultaneously — which is exactly the assumption on trial.",
            },
            {
              title: "Use that the outcomes are ±1",
              latex: "B(b) - B(b') = 0 \\text{ and } B(b) + B(b') = \\pm 2, \\text{ or the reverse}",
              explanation:
                "Two values each ±1 either agree or differ. If they agree their difference is 0 and their sum is ±2; if they differ, the opposite. One bracket always vanishes.",
            },
            {
              title: "Bound the surviving term",
              latex: "|S| \\le |A| \\cdot 2 = 2",
              explanation:
                "Only one bracket survives and contributes at most 2 in magnitude. Averaging over runs cannot exceed the per-run bound.",
            },
          ],
          conclusion:
            "Any local hidden-variable theory obeys |S| ≤ 2. No quantum mechanics was used — only the assumptions that outcomes pre-exist and that a distant choice cannot affect them.",
        },
      ],
    },
    {
      id: "quantum-value",
      title: "What quantum mechanics predicts",
      blocks: [
        {
          kind: "prose",
          text: "For the singlet state, measuring along directions separated by angle θ gives correlation E = −cos θ. Choosing the four settings at 45° intervals makes every term in S contribute constructively.",
        },
        {
          kind: "equation",
          latex: "S_{\\text{quantum}} = 2\\sqrt{2} \\approx 2.828",
          caption:
            "The Tsirelson bound: the maximum any quantum state can reach, comfortably above the classical limit of 2.",
        },
        {
          kind: "prose",
          text: "The gap is not marginal. Experiments report violations tens of standard deviations beyond the classical bound — this is not a subtle statistical effect.",
        },
        {
          kind: "callout",
          tone: "insight",
          title: "Quantum mechanics does not reach 4",
          text: "The algebraic maximum of S is 4, and hypothetical 'PR boxes' achieving it are consistent with no-signalling. Quantum mechanics stops at 2√2. Why nature picks that specific intermediate value is still an open question, and a whole research programme tries to derive it from information-theoretic principles.",
        },
        {
          kind: "misconception",
          claim: "Bell's theorem proves quantum mechanics is non-local, so something travels faster than light.",
          correction:
            "It rules out theories that are *both* local and realist in Bell's specific sense. Giving up either assumption suffices, and different interpretations drop different ones. Whatever you abandon, no-signalling still holds: the violation is invisible until both parties compare notes over a classical channel. Nothing useful travels faster than light.",
        },
      ],
    },
    {
      id: "experiments",
      title: "Closing the loopholes",
      blocks: [
        {
          kind: "comparison",
          title: "From suggestive to conclusive",
          columns: ["Experiment", "What it settled"],
          rows: [
            { aspect: "Freedman & Clauser, 1972", left: "First violation observed", right: "Encouraging, but detection efficiency was low" },
            { aspect: "Aspect et al., 1982", left: "Settings switched mid-flight", right: "Addressed the locality loophole" },
            { aspect: "Hensen et al., 2015", left: "Loophole-free, 1.3 km separation", right: "Locality and detection closed together" },
            { aspect: "BIG Bell Test, 2018", left: "Settings chosen by 100,000 people", right: "Addressed the freedom-of-choice loophole" },
            { aspect: "Nobel Prize, 2022", left: "Aspect, Clauser, Zeilinger", right: "Awarded for this body of work" },
          ],
        },
        {
          kind: "prose",
          text: "The loopholes were not pedantry. Each was a concrete way a local realist theory could have reproduced the data, and each had to be shut before the conclusion was secure. It took just over fifty years from Bell's paper to a genuinely loophole-free test.",
        },
      ],
    },
  ],
  visual: {
    renderer: "quantum-data-plot",
    title: "Correlation against measurement angle",
    caption:
      "The quantum correlation follows −cos θ. The best any predetermined-outcome model can do is a straight line, and the gap between the two curves is what the experiments measure.",
    props: {
      mode: "amplitude-steps",
      signed: true,
      steps: [
        { label: "θ = 0°", amplitudes: { agree: 1.0, disagree: 0 } },
        { label: "θ = 45°", amplitudes: { agree: 0.8536, disagree: 0.1464 } },
        { label: "θ = 90°", amplitudes: { agree: 0.5, disagree: 0.5 } },
      ],
      annotate: { agree: "cos²(θ/2) — the quantum prediction, confirmed to many standard deviations" },
    },
  },
  circuit: {
    title: "One CHSH measurement setting",
    description:
      "A Bell pair with one qubit rotated by 45° before measurement. Agreement comes out at cos²(π/8) ≈ 85.4% — higher than any predetermined-outcome model permits across all four settings together.",
    numQubits: 2,
    numClbits: 2,
    operations: [
      { id: "op-h", gate: "h", targets: [0], note: "Begins the Bell pair." },
      { id: "op-cx", gate: "cx", targets: [1], controls: [0], note: "Completes |Φ⁺⟩ — the qubits are now maximally entangled." },
      {
        id: "op-ry",
        gate: "ry",
        targets: [1],
        params: [Math.PI / 4],
        note: "Rotates qubit 1's measurement axis by 45°, one of the four CHSH settings.",
      },
    ],
    // cos²(π/8)/2 for the agreeing outcomes, sin²(π/8)/2 for the disagreeing ones.
    expected: { "00": 0.426777, "01": 0.073223, "10": 0.073223, "11": 0.426777 },
    tolerance: 1e-5,
  },
  code: {
    title: "Computing S and beating the classical bound",
    description:
      "Evaluates all four CHSH correlations on a Bell state and sums them, reproducing 2√2 and exceeding the local-realist limit of 2.",
    language: "python",
    code: `import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

def correlation(alice_angle: float, bob_angle: float) -> float:
    """<A(a) B(b)> for the Bell state |Phi+>, measuring along rotated axes."""
    qc = QuantumCircuit(2)
    qc.h(0)
    qc.cx(0, 1)
    qc.ry(-2 * alice_angle, 0)
    qc.ry(-2 * bob_angle, 1)

    probabilities = Statevector.from_instruction(qc).probabilities_dict()
    total = 0.0
    for bits, p in probabilities.items():
        # +1 when the two outcomes agree, -1 when they differ.
        total += p * (1 if bits[0] == bits[1] else -1)
    return total

a, a_prime = 0.0, np.pi / 4
b, b_prime = np.pi / 8, 3 * np.pi / 8

terms = {
    "E(a, b)": correlation(a, b),
    "E(a, b')": correlation(a, b_prime),
    "E(a', b)": correlation(a_prime, b),
    "E(a', b')": correlation(a_prime, b_prime),
}
for label, value in terms.items():
    print(f"{label:10} = {value:+.4f}")

S = terms["E(a, b)"] - terms["E(a, b')"] + terms["E(a', b)"] + terms["E(a', b')"]
print()
print(f"S = {abs(S):.4f}")
print(f"classical bound      : 2")
print(f"Tsirelson bound      : {2*np.sqrt(2):.4f}")
print(f"violates local realism: {abs(S) > 2 + 1e-9}")`,
    expectedOutput: ["violates local realism: True"],
  },
  keyTakeaways: [
    "Local realism — predetermined outcomes unaffected by distant choices — implies |S| ≤ 2",
    "The derivation uses no quantum mechanics, only that outcomes exist and are ±1",
    "Quantum mechanics reaches 2√2, the Tsirelson bound, well clear of the classical limit",
    "Loophole-free experiments from 2015 closed the remaining escape routes",
    "The violation still cannot signal: it is only visible once results are compared classically",
  ],
  references: [
    { source: "Bell, On the Einstein Podolsky Rosen Paradox", locator: "Physics 1, 195 (1964)" },
    { source: "Clauser, Horne, Shimony & Holt", locator: "Phys. Rev. Lett. 23, 880 (1969)" },
    { source: "Hensen et al., Loophole-free Bell inequality violation", locator: "Nature 526, 682 (2015)" },
    { source: "Nielsen & Chuang, Quantum Computation and Quantum Information", locator: "§2.6" },
  ],
};
