import { z } from "zod";

export const healthResponseSchema = z.object({
  status: z.literal("ok"),
  timestamp: z.string(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

const readinessDbEnum = z.enum(["ok", "not_checked", "error"]);

export const readinessResponseSchema = z.object({
  status: z.literal("ok"),
  timestamp: z.string(),
  db: readinessDbEnum,
});

export const readinessFailureResponseSchema = z.object({
  status: z.literal("error"),
  timestamp: z.string(),
  db: readinessDbEnum,
});

export type ReadinessResponse = z.infer<typeof readinessResponseSchema>;
export type ReadinessFailureResponse = z.infer<
  typeof readinessFailureResponseSchema
>;
