import type { AuthResponse, AuthUser } from "backend/schemas/auth";
import { authResponseSchema, authUserSchema } from "backend/schemas/auth";
import type { LoginBody } from "backend/schemas/auth";
import { z } from "zod";
import { apiFetch } from "./client";

export type { AuthResponse, AuthUser, LoginBody };

const errorBodySchema = z.object({ error: z.string().optional() });

function parseErrorBody(data: unknown, fallback: string): string {
	const parsed = errorBodySchema.safeParse(data);
	return parsed.success && parsed.data.error ? parsed.data.error : fallback;
}

export async function login(body: LoginBody): Promise<AuthResponse> {
	const res = await apiFetch("/auth/login", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok) {
		throw new Error(parseErrorBody(data, "Login failed"));
	}
	return authResponseSchema.parse(data);
}

export async function me(accessToken: string): Promise<AuthUser> {
	const res = await apiFetch("/auth/me", { token: accessToken });
	const data = await res.json().catch(() => ({}));
	if (!res.ok) {
		throw new Error(parseErrorBody(data, "Unauthorized"));
	}
	return authUserSchema.parse(data);
}

export async function refresh(refreshToken: string): Promise<AuthResponse> {
	const res = await apiFetch("/auth/refresh", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ refreshToken }),
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok) {
		throw new Error(parseErrorBody(data, "Refresh failed"));
	}
	return authResponseSchema.parse(data);
}

export async function logout(refreshToken: string | null): Promise<void> {
	if (!refreshToken) return;
	await apiFetch("/auth/logout", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ refreshToken }),
	});
}

export async function uploadProfilePicture(
	accessToken: string,
	file: File,
): Promise<{ url: string }> {
	const formData = new FormData();
	formData.append("file", file);

	const res = await apiFetch("/auth/profile/picture", {
		method: "PATCH",
		token: accessToken,
		body: formData,
	});

	const data = await res.json().catch(() => ({}));
	if (!res.ok) {
		console.error(`[AuthAPI] Upload failed with status ${res.status}`, data);
		throw new Error(parseErrorBody(data, "Upload failed"));
	}

	return z.object({ url: z.string().url() }).parse(data);
}

export async function updateProfile(
	accessToken: string,
	body: { name?: string },
): Promise<AuthUser> {
	const res = await apiFetch("/auth/profile", {
		method: "PATCH",
		token: accessToken,
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	const data = await res.json().catch(() => ({}));
	if (!res.ok) {
		throw new Error(parseErrorBody(data, "Update failed"));
	}

	return authUserSchema.parse(data);
}
