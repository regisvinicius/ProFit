import { z } from "zod";

export const registerBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshTokenBodySchema = z.object({
  refreshToken: z.string().min(1).optional(),
});

export const refreshBodySchema = refreshTokenBodySchema;
export const logoutBodySchema = refreshTokenBodySchema;

export const authUserSchema = z.object({
  id: z.number(),
  email: z.string(),
  createdAt: z.string(),
});

export const authResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: authUserSchema,
});

export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type RefreshBody = z.infer<typeof refreshBodySchema>;
export type LogoutBody = z.infer<typeof logoutBodySchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
