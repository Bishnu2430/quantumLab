import type { Lesson } from "../types";

/**
 * Orientation lesson. Deliberately carries no circuit and no code: nothing
 * here is illuminated by running gates, and a token `h` on q0 would be
 * decoration. The concept map is the interactive element.
 */
export const lesson: Lesson = {
  id: "what-is-quantum-computing",
  slug: "what-is-quantum-computing",
  order: 1,
  title: "What Is Quantum Computing?",
  subtitle: "What actually changes when computation obeys quantum mechanics",
  summary:
    "Where quantum computers differ from classical ones, which problems that difference touches, and — just as importantly — which it does not.",
  difficulty: "beginner",
  estimatedMinutes: 12,
  prerequisites: [],
  objectives: [
    "State the three resources a quantum computer has that a classical one lacks",
    "Explain why interference, not parallelism, is the source of quantum advantage",
    "Name two problem classes with known quantum speedups, and one with none",
    "Recognise why 'tries all answers at once' is a misleading description",
  ],
  sections: [
    {
      id: "the-shift",
      title: "A different set of rules",
      blocks: [
        {
          kind: "prose",
          text: "A classical computer manipulates bits. Every bit is 0 or 1, every operation maps definite inputs to definite outputs, and the machine's state at any moment could in principle be written down as a list of those values. This describes every laptop, phone and supercomputer built to date.",
        },
        {
          kind: "prose",
          text: "A quantum computer manipulates **qubits**, whose state is governed by quantum mechanics rather than classical logic. This is not a faster classical computer, and it is not an analogue computer. It is a machine whose available operations are drawn from a genuinely larger set, because the underlying physics permits states with no classical counterpart.",
        },
        {
          kind: "prose",
          text: "Three features of that physics do the work. **Superposition** lets a register hold a weighted combination of many basis states at once. **Interference** lets those weights — which are complex numbers, and so can cancel — be steered so that wrong answers destructively cancel and right ones reinforce. **Entanglement** creates correlations between qubits that cannot be reproduced by any assignment of independent local states.",
        },
        {
          kind: "callout",
          tone: "insight",
          title: "Interference is the engine",
          text: "Superposition alone buys nothing: a classical probabilistic computer also holds a distribution over many states, and sampling it gives you one random answer. What sets quantum mechanics apart is that amplitudes are complex numbers which can cancel. Every quantum algorithm worth the name is an exercise in arranging that cancellation so the wrong answers destroy each other before you measure.",
        },
      ],
    },
    {
      id: "the-misconception",
      title: "What quantum computers do not do",
      blocks: [
        {
          kind: "misconception",
          claim: "A quantum computer tries every possible answer at the same time, so it solves any search instantly.",
          correction:
            "A register of n qubits does carry amplitudes for all 2^n basis states at once, but measurement returns exactly one of them, chosen at random according to the Born rule. Reading out all 2^n values is impossible. The skill in quantum algorithm design is arranging interference so that the single outcome you are permitted to observe is overwhelmingly likely to be the one you wanted — and for most problems, nobody knows how to arrange that.",
        },
        {
          kind: "misconception",
          claim: "Quantum computers will replace classical computers.",
          correction:
            "They are accelerators for a narrow class of structured problems, not general-purpose replacements. A quantum computer running a spreadsheet would be slower, vastly more expensive, and far less reliable than the machine you are reading this on. Every practical quantum system is controlled by classical computers that prepare circuits, read results and handle error correction.",
        },
        {
          kind: "misconception",
          claim: "Entanglement lets you send information faster than light.",
          correction:
            "Measuring one half of an entangled pair instantly fixes the correlation with the other half, but the outcome you obtain is random and you cannot choose it. The distant party sees uniformly random results regardless of what you do. Extracting the correlation requires comparing notes over an ordinary classical channel, which is bounded by the speed of light. This is the no-communication theorem.",
        },
      ],
    },
    {
      id: "where-it-helps",
      title: "Where the advantage is real",
      blocks: [
        {
          kind: "prose",
          text: "Known quantum speedups are specific and structural. They exist where a problem has hidden periodicity, an algebraic structure, or is itself quantum mechanical.",
        },
        {
          kind: "comparison",
          title: "Problem classes",
          columns: ["Known quantum speedup", "No known speedup"],
          rows: [
            {
              aspect: "Factoring integers",
              left: "Shor's algorithm: polynomial time, an exponential improvement over the best known classical method",
              right: "—",
            },
            {
              aspect: "Unstructured search",
              left: "Grover's algorithm: O(√N) instead of O(N) — quadratic, and provably optimal for a black-box oracle",
              right: "—",
            },
            {
              aspect: "Simulating quantum systems",
              left: "Natural fit: chemistry and materials, the application Feynman originally proposed",
              right: "—",
            },
            {
              aspect: "General NP-complete problems",
              left: "—",
              right: "Grover gives at most a quadratic gain; no exponential speedup is known or expected",
            },
            {
              aspect: "Everyday computing",
              left: "—",
              right: "Databases, rendering, compilation, machine learning inference — no advantage",
            },
          ],
        },
        {
          kind: "callout",
          tone: "history",
          title: "Feynman's framing, 1981",
          text: "Feynman observed that simulating a quantum system on a classical computer appears to cost resources growing exponentially in the number of particles, and suggested the obvious remedy: build the simulator out of quantum mechanics too. Quantum chemistry remains the application with the clearest physical motivation.",
        },
      ],
    },
    {
      id: "the-cost",
      title: "Why this is hard to build",
      blocks: [
        {
          kind: "prose",
          text: "Superposition is fragile. Any uncontrolled interaction with the environment — a stray photon, a vibration, a fluctuating magnetic field — leaks information about the qubit outward, and that leakage destroys the delicate phase relationships interference depends on. This is **decoherence**, and it is the central engineering obstacle.",
        },
        {
          kind: "prose",
          text: "Current hardware keeps qubits coherent for microseconds to milliseconds, which bounds how deep a circuit can run before its results become noise. Quantum error correction addresses this by spreading one logical qubit across many physical ones, at an overhead that is currently in the hundreds to thousands. This is why a 1000-qubit device is not yet a 1000-qubit computer.",
        },
        {
          kind: "prose",
          text: "Everything you will simulate in this course runs on an ideal, noiseless simulator. That is the right place to learn the mechanics — but it is worth knowing from the start that the gap between the mathematics here and a physical device is substantial, and that closing it is where most of the field's effort goes.",
        },
      ],
    },
  ],
  visual: {
    renderer: "concept-map",
    title: "How the ideas connect",
    caption:
      "Superposition and entanglement supply the state space; interference is what converts it into an answer. Follow any path to see which later lesson develops it.",
    props: {
      nodes: [
        { id: "superposition", label: "Superposition", lesson: "the-qubit" },
        { id: "interference", label: "Interference", lesson: "superposition-and-hadamard", emphasis: true },
        { id: "entanglement", label: "Entanglement", lesson: "entanglement-and-bell-states" },
        { id: "measurement", label: "Measurement", lesson: "measurement-and-born-rule" },
        { id: "algorithms", label: "Algorithms", lesson: "grovers-search" },
        { id: "decoherence", label: "Decoherence", terminal: true },
      ],
      edges: [
        { from: "superposition", to: "interference", label: "enables" },
        { from: "interference", to: "algorithms", label: "drives" },
        { from: "entanglement", to: "algorithms", label: "enables" },
        { from: "measurement", to: "algorithms", label: "reads out" },
        { from: "superposition", to: "measurement", label: "collapsed by" },
        { from: "decoherence", to: "superposition", label: "destroys" },
      ],
    },
  },
  keyTakeaways: [
    "Quantum computers gain their power from interference between complex amplitudes, not from evaluating many answers in parallel",
    "Measurement returns one basis state, so an algorithm must concentrate probability on the answer before you look",
    "Speedups are known for factoring, unstructured search and quantum simulation — not for computing in general",
    "Decoherence bounds circuit depth, and error correction pays for reliability with a large overhead in physical qubits",
  ],
  references: [
    { source: "Nielsen & Chuang, Quantum Computation and Quantum Information", locator: "Chapter 1" },
    { source: "Feynman, Simulating Physics with Computers", locator: "Int. J. Theor. Phys. 21, 467 (1982)" },
    { source: "Preskill, Quantum Computing in the NISQ Era and Beyond", locator: "Quantum 2, 79 (2018)" },
  ],
};
