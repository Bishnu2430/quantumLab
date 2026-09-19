import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { LessonView } from "@/components/lesson/LessonView";
import { LESSONS_BY_SLUG, allLessonSlugs, getLesson, getNeighbours } from "@/content";

interface PageProps {
  params: { slug: string };
}

/** Pre-renders every lesson at build time; the set is fixed and known. */
export function generateStaticParams() {
  return allLessonSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const lesson = getLesson(params.slug);
  if (!lesson) return { title: "Lesson not found" };
  return {
    title: `${lesson.title} — PBQuantum Labs`,
    description: lesson.summary,
  };
}

export default function LessonPage({ params }: PageProps) {
  const lesson = getLesson(params.slug);
  if (!lesson) notFound();

  const { previous, next } = getNeighbours(params.slug);
  const prerequisites = lesson.prerequisites
    .map((slug) => LESSONS_BY_SLUG.get(slug))
    .filter((entry): entry is NonNullable<typeof entry> => entry !== undefined);

  return (
    <LessonView lesson={lesson} previous={previous} next={next} prerequisites={prerequisites} />
  );
}
