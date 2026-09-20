import { NextRequest, NextResponse } from "next/server";

import { LESSONS } from "@/content";

/**
 * Copilot backend.
 *
 * Streams from Groq, grounded in the curriculum that actually ships. The
 * previous version claimed mastery of "36 curriculum domains" that no longer
 * exist and pointed at two model IDs (`qwen/qwen3.8-27b` and
 * `qwen/qwen3.6-27b`) that are not real Groq models, so every request 404'd.
 */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/** A current Groq production model. Overridable, but not invented. */
const DEFAULT_MODEL = "llama-3.3-70b-versatile";
const FALLBACK_MODEL = "llama-3.1-8b-instant";

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 4000;

type Depth = "intuitive" | "applied" | "rigorous";

/**
 * Built from the real curriculum rather than a hand-maintained list, so the
 * assistant cannot advertise lessons that do not exist.
 */
function curriculumSummary(): string {
  return LESSONS.map(
    (lesson) =>
      `${lesson.order}. ${lesson.title} (/learn/${lesson.slug}) — ${lesson.summary}`,
  ).join("\n");
}

/** Retrieves the lessons most relevant to a question, for grounding. */
function relevantLessons(question: string, limit = 3) {
  const words = question
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 3);

  if (words.length === 0) return [];

  const scored = LESSONS.map((lesson) => {
    const haystack = [
      lesson.title,
      lesson.summary,
      ...lesson.keyTakeaways,
      ...lesson.objectives,
    ]
      .join(" ")
      .toLowerCase();

    const score = words.reduce(
      (total, word) => total + (haystack.includes(word) ? 1 : 0),
      0,
    );
    return { lesson, score };
  })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((entry) => entry.lesson);
}

function systemPrompt(depth: Depth, path: string | undefined, question: string): string {
  const grounding = relevantLessons(question)
    .map((lesson) => {
      const takeaways = lesson.keyTakeaways.map((t) => `  - ${t}`).join("\n");
      return `### ${lesson.title} (/learn/${lesson.slug})\n${lesson.summary}\nKey points:\n${takeaways}`;
    })
    .join("\n\n");

  const depthGuidance: Record<Depth, string> = {
    intuitive:
      "Lead with physical intuition and analogy. Introduce notation only when it earns its place, and explain each symbol the first time it appears.",
    applied:
      "Assume Dirac notation and linear algebra are familiar. Show the matrices, and include short Qiskit snippets where they clarify rather than decorate.",
    rigorous:
      "Assume graduate-level background. State assumptions precisely, give full derivations, and name the theorems being relied on.",
  };

  return `You are the assistant for Amplitude Lab, an interactive quantum computing course.

House style:
- Be accurate before being impressive. If you are unsure, say so.
- Never invent numerical results. The learner can run any circuit here on a real
  simulator, so a fabricated probability will be caught immediately. Tell them to
  run it instead.
- Prefer the shortest correct explanation. Do not pad.
- Use $inline$ and $$display$$ LaTeX for mathematics.
- Link to lessons as /learn/<slug> when one covers the question.
- Correct misconceptions directly rather than working around them.

${depthGuidance[depth]}

The course covers these lessons and nothing else. Do not claim coverage of
topics outside this list; if asked about one, say plainly that the course does
not cover it yet.

${curriculumSummary()}
${grounding ? `\nRelevant lesson content for this question:\n\n${grounding}` : ""}
${path ? `\nThe learner is currently on the page ${path}.` : ""}`;
}

export async function POST(req: NextRequest) {
  let body: {
    messages?: { role: string; content: string }[];
    currentPath?: string;
    level?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be JSON." },
      { status: 400 },
    );
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "A non-empty 'messages' array is required." },
      { status: 400 },
    );
  }

  // Bound the payload so a runaway client cannot drive up cost or latency.
  const trimmed = messages.slice(-MAX_MESSAGES).map((message) => ({
    role: message.role === "assistant" ? "assistant" : "user",
    content: String(message.content ?? "").slice(0, MAX_MESSAGE_LENGTH),
  }));

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "The assistant is not configured. Add GROQ_API_KEY to .env to enable it — everything else in the course works without it.",
        code: "NOT_CONFIGURED",
      },
      { status: 503 },
    );
  }

  const depth = (["intuitive", "applied", "rigorous"] as const).includes(
    body.level as Depth,
  )
    ? (body.level as Depth)
    : "applied";

  const lastUserMessage =
    [...trimmed].reverse().find((message) => message.role === "user")?.content ?? "";

  const payload = {
    messages: [
      { role: "system", content: systemPrompt(depth, body.currentPath, lastUserMessage) },
      ...trimmed,
    ],
    temperature: 0.4,
    max_tokens: 1600,
    stream: true,
  };

  const callModel = (model: string) =>
    fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...payload, model }),
    });

  const requestedModel = process.env.GROQ_MODEL || DEFAULT_MODEL;
  let upstream = await callModel(requestedModel);

  if (!upstream.ok && upstream.status !== 429) {
    // A smaller model is better than no answer, but rate limiting should
    // surface rather than silently burn a second request.
    upstream = await callModel(FALLBACK_MODEL);
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    return NextResponse.json(
      {
        error:
          upstream.status === 429
            ? "Rate limited by the model provider. Wait a moment and try again."
            : `The model provider returned ${upstream.status}.`,
        code: upstream.status === 429 ? "RATE_LIMITED" : "UPSTREAM_ERROR",
        detail: detail.slice(0, 400),
      },
      { status: upstream.status === 429 ? 429 : 502 },
    );
  }

  // Re-emit as plain text chunks: the client only needs the token stream, not
  // the provider's SSE envelope.
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      let buffer = "";

      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          // The final element may be a partial line; keep it for next time.
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const token = parsed.choices?.[0]?.delta?.content;
              if (token) controller.enqueue(encoder.encode(token));
            } catch {
              // A malformed chunk should not abort a working stream.
            }
          }
        }
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Model": requestedModel,
    },
  });
}
