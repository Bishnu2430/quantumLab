export interface LessonSection {
  id: string;
  number: string;
  title: string;
  subtitle?: string;
  type: "text" | "comparison" | "derivation" | "circuit" | "prediction" | "challenge" | "summary";
}

export interface SuperpositionContent {
  id: string;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  sections: LessonSection[];
}

export const SUPERPOSITION_LESSON_DATA: SuperpositionContent = {
  id: "superposition",
  title: "Superposition & The Hadamard Gate",
  subtitle: "Understanding the fundamental linear combinations of quantum states through mathematics, visual circuits, and real Qiskit simulation.",
  estimatedMinutes: 20,
  difficulty: "Beginner",
  sections: [
    { id: "s01-qubit", number: "01", title: "What is a Qubit?", type: "text" },
    { id: "s02-comparison", number: "02", title: "Classical Bit vs Qubit", type: "comparison" },
    { id: "s03-superposition", number: "03", title: "Superposition", type: "text" },
    { id: "s04-amplitudes", number: "04", title: "Probability Amplitudes & Phase", type: "text" },
    { id: "s05-hadamard", number: "05", title: "The Hadamard Gate", type: "text" },
    { id: "s06-derivation", number: "06", title: "Mathematical Derivation", type: "derivation" },
    { id: "s07-circuit", number: "07", title: "Interactive Circuit", type: "circuit" },
    { id: "s08-simulation", number: "08", title: "Run the Simulation", type: "circuit" },
    { id: "s09-statevector", number: "09", title: "Statevector Amplitudes", type: "circuit" },
    { id: "s10-probability", number: "10", title: "Theoretical vs Measured Probability", type: "circuit" },
    { id: "s11-bloch", number: "11", title: "Bloch Sphere Projection", type: "circuit" },
    { id: "s12-prediction", number: "12", title: "Prediction Experiment", type: "prediction" },
    { id: "s13-explore", number: "13", title: "Explore Relative Phase (H on |1⟩)", type: "prediction" },
    { id: "s14-challenge", number: "14", title: "Interactive Challenge", type: "challenge" },
    { id: "s15-summary", number: "15", title: "Key Takeaways", type: "summary" },
  ],
};
