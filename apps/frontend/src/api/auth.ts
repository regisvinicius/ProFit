import { apiFetch } from "./client";

export interface AuthUser {
  id: number;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface LoginBody {
  email: string;
  password: string;
}

export async function login(body: LoginBody): Promise<AuthResponse> {
  const res = await apiFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? "Login failed");
  }
  return res.json() as Promise<AuthResponse>;
}

export async function me(accessToken: string): Promise<AuthUser> {
  const res = await apiFetch("/auth/me", { token: accessToken });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? "Unauthorized");
  }
  return res.json() as Promise<AuthUser>;
}

/** Revoke refresh token server-side. Best-effort; clears local state regardless. */
export async function logout(refreshToken: string | null): Promise<void> {
  if (!refreshToken) return;
  await apiFetch("/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  // Ignore response: 204 = success; 4xx/5xx = token may already be invalid; still clear client.
}
