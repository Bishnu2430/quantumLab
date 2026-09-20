/**
 * Curriculum registry.
 *
 * Lessons are registered here explicitly rather than discovered by glob, so
 * adding one is a visible, reviewable change and the ordering is never
 * implicit in filenames.
 */

import type { Lesson } from "./types";

import { lesson as whatIsQuantumComputing } from "./lessons/01-what-is-quantum-computing";
import { lesson as doubleSlit } from "./lessons/02-double-slit";
import { lesson as complexAmplitudes } from "./lessons/03-complex-amplitudes";
import { lesson as diracNotation } from "./lessons/04-dirac-notation";
import { lesson as theQubit } from "./lessons/05-the-qubit-and-bloch-sphere";
import { lesson as superpositionAndHadamard } from "./lessons/06-superposition-and-hadamard";
import { lesson as pauliGates } from "./lessons/07-pauli-gates";
import { lesson as phaseAndRotationGates } from "./lessons/08-phase-and-rotation-gates";
import { lesson as measurementAndBornRule } from "./lessons/09-measurement-and-born-rule";
import { lesson as multipleQubits } from "./lessons/10-multiple-qubits";
import { lesson as cnotAndTwoQubitGates } from "./lessons/11-cnot-and-two-qubit-gates";
import { lesson as entanglementAndBellStates } from "./lessons/12-entanglement-and-bell-states";
import { lesson as bellInequality } from "./lessons/13-bell-inequality";
import { lesson as quantumTeleportation } from "./lessons/14-quantum-teleportation";
import { lesson as deutschJozsa } from "./lessons/15-deutsch-jozsa";
import { lesson as groversSearch } from "./lessons/16-grovers-search";
import { lesson as bb84 } from "./lessons/17-bb84";

export const LESSONS: Lesson[] = [
  whatIsQuantumComputing,
  doubleSlit,
  complexAmplitudes,
  diracNotation,
  theQubit,
  superpositionAndHadamard,
  pauliGates,
  phaseAndRotationGates,
  measurementAndBornRule,
  multipleQubits,
  cnotAndTwoQubitGates,
  entanglementAndBellStates,
  bellInequality,
  quantumTeleportation,
  deutschJozsa,
  groversSearch,
  bb84,
].sort((a, b) => a.order - b.order);

export const LESSONS_BY_SLUG: ReadonlyMap<string, Lesson> = new Map(
  LESSONS.map((lesson) => [lesson.slug, lesson]),
);

export function getLesson(slug: string): Lesson | undefined {
  return LESSONS_BY_SLUG.get(slug);
}

/** Slugs for Next.js `generateStaticParams`. */
export function allLessonSlugs(): string[] {
  return LESSONS.map((lesson) => lesson.slug);
}

/**
 * The lesson before and after `slug` in curriculum order, for prev/next
 * navigation. Either may be undefined at the ends of the sequence.
 */
export function getNeighbours(slug: string): { previous?: Lesson; next?: Lesson } {
  const index = LESSONS.findIndex((lesson) => lesson.slug === slug);
  if (index === -1) return {};
  return { previous: LESSONS[index - 1], next: LESSONS[index + 1] };
}

export * from "./types";
