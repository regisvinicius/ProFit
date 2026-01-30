export const errorResponseSchema = {
  type: "object",
  properties: { error: { type: "string" } },
} as const;
