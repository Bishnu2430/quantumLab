/**
 * Curriculum registry.
 *
 * Lessons are registered here explicitly rather than discovered by glob, so
 * that adding one is a visible, reviewable change and the ordering is never
 * implicit in filenames.
 */

import type { Lesson } from "./types";

import { lesson as whatIsQuantumComputing } from "./lessons/01-what-is-quantum-computing";
import { lesson as complexAmplitudes } from "./lessons/03-complex-amplitudes";
import { lesson as diracNotation } from "./lessons/04-dirac-notation";
import { lesson as theQubit } from "./lessons/05-the-qubit-and-bloch-sphere";
import { lesson as superpositionAndHadamard } from "./lessons/06-superposition-and-hadamard";

export const LESSONS: Lesson[] = [
  whatIsQuantumComputing,
  complexAmplitudes,
  diracNotation,
  theQubit,
  superpositionAndHadamard,
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
