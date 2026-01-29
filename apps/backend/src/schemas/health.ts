import { z } from "zod";

export const healthResponseSchema = z.object({
  status: z.literal("ok"),
  timestamp: z.string(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export const readinessResponseSchema = z.object({
  status: z.literal("ok"),
  timestamp: z.string(),
  db: z.enum(["ok", "not_checked", "error"]),
});

export type ReadinessResponse = z.infer<typeof readinessResponseSchema>;
