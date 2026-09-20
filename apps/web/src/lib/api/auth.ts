/** Client for the authentication API. Tokens live in httpOnly cookies. */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type Role = "learner" | "researcher" | "admin";

export interface User {
  id: string;
  email: string;
  display_name: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
}

export interface AuthResponse {
  user: User;
  expires_at: string;
}

export class AuthError extends Error {
  constructor(message: string, readonly code: string, readonly status: number) {
    super(message);
    this.name = "AuthError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    // Required: the session cookie is httpOnly and cross-origin in development.
    credentials: "include",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const detail = payload?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : (detail?.message ??
          // Pydantic validation errors arrive as a list of issues.
          (Array.isArray(payload?.detail) ? payload.detail[0]?.msg : null) ??
          `Request failed (${response.status})`);
    throw new AuthError(message, detail?.code ?? "REQUEST_FAILED", response.status);
  }

  return response.json() as Promise<T>;
}

export function signIn(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(
  email: string,
  displayName: string,
  password: string,
): Promise<AuthResponse> {
  return request<AuthResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, display_name: displayName, password }),
  });
}

export function signOut(): Promise<unknown> {
  return request("/api/v1/auth/logout", { method: "POST" });
}

/** Returns the signed-in user, or null when there is no valid session. */
export async function fetchCurrentUser(): Promise<User | null> {
  try {
    return await request<User>("/api/v1/auth/me");
  } catch {
    // 401 is the normal anonymous case, and an unreachable API should not
    // break the page — both mean "no user".
    return null;
  }
}

const RANK: Record<Role, number> = { learner: 0, researcher: 1, admin: 2 };

/** Roles are cumulative, matching the backend's `Role.satisfies`. */
export function hasRole(user: User | null, required: Role): boolean {
  if (!user) return false;
  return RANK[user.role] >= RANK[required];
}
