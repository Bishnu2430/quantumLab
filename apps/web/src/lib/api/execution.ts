/** Client for the sandboxed code-execution API. */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type ExecutionStatus = "ok" | "error" | "timeout" | "out_of_memory" | "unavailable";

export interface ExecutionResult {
  status: ExecutionStatus;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  durationMs: number;
  runner: string;
  /** False when a development fallback ran the code without isolation. */
  isolated: boolean;
  warnings: string[];
}

export interface RunnerStatus {
  available: boolean;
  runner: string;
  isolated: boolean;
  message: string;
}

export class ExecutionError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
    readonly requiredRole?: string,
  ) {
    super(message);
    this.name = "ExecutionError";
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Auth travels in httpOnly cookies, so credentials must be included.
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const detail = payload?.detail;
    throw new ExecutionError(
      detail?.message ?? `Request failed with status ${response.status}`,
      detail?.code ?? "REQUEST_FAILED",
      response.status,
      detail?.requiredRole,
    );
  }

  return response.json() as Promise<T>;
}

/** Runs the snippet the given lesson ships. No code is sent. */
export function runLessonCode(lessonSlug: string): Promise<ExecutionResult> {
  return post<ExecutionResult>("/api/v1/execution/lesson", { lessonSlug });
}

/** Runs researcher-authored code. Requires the researcher role. */
export function runCode(code: string): Promise<ExecutionResult> {
  return post<ExecutionResult>("/api/v1/execution/run", { code });
}

export async function getRunnerStatus(): Promise<RunnerStatus | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/execution/status`, {
      credentials: "include",
    });
    if (!response.ok) return null;
    return (await response.json()) as RunnerStatus;
  } catch {
    // The API being unreachable is an expected state during local development.
    return null;
  }
}
