/**
 * Lesson content model.
 *
 * Lessons are authored as typed modules rather than loaded from a CMS so that
 * every claim is reviewable in a pull request and every embedded circuit can be
 * verified against the real simulator in CI (see `content.verification.test`).
 *
 * `circuit`, `code` and `visual` are all optional. A lesson that does not earn
 * one omits it entirely — the renderer adapts rather than showing an empty or
 * placeholder panel.
 */

export type Difficulty = "beginner" | "intermediate" | "advanced";

/** Renderers available to a lesson, mirroring docs/content/visual-registry.json. */
export type VisualRenderer =
  | "bloch-sphere"
  | "complex-plane"
  | "concept-map"
  | "energy-levels"
  | "linear-algebra"
  | "quantum-circuit"
  | "quantum-data-plot"
  | "quantum-network"
  | "timeline"
  | "wave-interference";

// --- prose ----------------------------------------------------------------

/** A block of explanatory content. Discriminated on `kind`. */
export type Block =
  | ProseBlock
  | EquationBlock
  | DerivationBlock
  | ComparisonBlock
  | CalloutBlock
  | MisconceptionBlock;

export interface ProseBlock {
  kind: "prose";
  /** Markdown-ish: supports `inline code`, **bold**, and $inline math$. */
  text: string;
}

export interface EquationBlock {
  kind: "equation";
  /** KaTeX-compatible LaTeX, without surrounding delimiters. */
  latex: string;
  /** What the equation says in words. Never optional: an unexplained
   *  equation teaches nothing. */
  caption: string;
  /** Symbol-by-symbol glossary, rendered as a legend beneath the equation. */
  where?: { symbol: string; meaning: string }[];
}

export interface DerivationStep {
  /** What this step accomplishes, e.g. "Apply H to each basis component". */
  title: string;
  latex?: string;
  /** Why this step is licensed — the justification, not a restatement. */
  explanation: string;
}

export interface DerivationBlock {
  kind: "derivation";
  title: string;
  /** The starting point, stated so the reader can check each step follows. */
  premise: string;
  steps: DerivationStep[];
  /** What has been established once the steps are complete. */
  conclusion: string;
}

export interface ComparisonBlock {
  kind: "comparison";
  title: string;
  columns: [string, string];
  rows: { aspect: string; left: string; right: string }[];
}

export interface CalloutBlock {
  kind: "callout";
  tone: "insight" | "warning" | "history";
  title: string;
  text: string;
}

export interface MisconceptionBlock {
  kind: "misconception";
  /** The plausible-but-wrong statement, quoted as a learner would phrase it. */
  claim: string;
  /** Why it is wrong, and what is true instead. */
  correction: string;
}

// --- sections -------------------------------------------------------------

export interface Section {
  id: string;
  title: string;
  blocks: Block[];
}

// --- interactive assets ---------------------------------------------------

export interface VisualSpec {
  renderer: VisualRenderer;
  title: string;
  /** What the learner should notice — the reason this visual exists. */
  caption: string;
  /** Renderer-specific configuration, validated by the renderer itself. */
  props?: Record<string, unknown>;
}

/** A circuit operation, in the backend's canonical Quantum IR form. */
export interface LessonOperation {
  id: string;
  gate: string;
  targets: number[];
  controls?: number[];
  clbits?: number[];
  params?: number[];
  /** Shown in the circuit inspector when this gate is selected. */
  note?: string;
}

/**
 * A circuit that ships with a lesson.
 *
 * `expected` is the contract: CI runs the circuit through Qiskit Aer and fails
 * the build if the real probabilities disagree. That is what stops a lesson
 * from asserting physics the simulator does not reproduce.
 */
export interface LessonCircuit {
  title: string;
  /** What the circuit demonstrates, in one sentence. */
  description: string;
  numQubits: number;
  numClbits: number;
  operations: LessonOperation[];
  /** Basis state -> probability. Verified against the simulator in CI. */
  expected: Record<string, number>;
  /** Tolerance for the check; defaults to 1e-6 for exact statevector claims. */
  tolerance?: number;
}

export interface CodeExample {
  title: string;
  /** What the learner should run it to find out. */
  description: string;
  language: "python";
  code: string;
  /** Substrings that must appear in stdout, verified when the sandbox runs. */
  expectedOutput?: string[];
}

export interface Reference {
  source: string;
  /** Chapter or section, so a reader can actually find the passage. */
  locator?: string;
  url?: string;
}

// --- lesson ---------------------------------------------------------------

export interface Lesson {
  /** Stable identifier; never reused or renumbered. */
  id: string;
  /** URL segment under /learn. */
  slug: string;
  /** Position in the curriculum ordering. */
  order: number;
  title: string;
  subtitle: string;
  summary: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  /** Slugs of lessons that should come first. */
  prerequisites: string[];
  /** Completable statements: "Predict the outcome of...", not "Understand...". */
  objectives: string[];
  sections: Section[];
  /** Omitted when no visual genuinely serves the lesson. */
  visual?: VisualSpec;
  /** Omitted for theory lessons that no circuit would illuminate. */
  circuit?: LessonCircuit;
  /** Omitted when there is nothing worth running. */
  code?: CodeExample;
  keyTakeaways: string[];
  references: Reference[];
}
