/**
 * Shared JSON Schema definitions for Fastify route responses.
 * Use across auth, health, and future endpoints.
 */

/** Reusable JSON Schema for error response body `{ error: string }`. */
export const errorResponseSchema = {
  type: "object",
  properties: { error: { type: "string" } },
} as const;
