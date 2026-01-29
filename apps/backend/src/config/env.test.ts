import { describe, expect, it } from "vitest";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  CORS_ORIGINS: z
    .string()
    .optional()
    .transform((s) => (s ? s.split(",").map((o) => o.trim()) : [])),
});

describe("env config", () => {
  it("parses PORT default", () => {
    const parsed = envSchema.safeParse({});
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.PORT).toBe(3000);
      expect(parsed.data.NODE_ENV).toBe("development");
      expect(parsed.data.CORS_ORIGINS).toEqual([]);
    }
  });

  it("parses PORT from string", () => {
    const parsed = envSchema.safeParse({ PORT: "4000" });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.PORT).toBe(4000);
  });

  it("parses CORS_ORIGINS comma-separated", () => {
    const parsed = envSchema.safeParse({
      CORS_ORIGINS: "http://a.com, http://b.com",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.CORS_ORIGINS).toEqual([
        "http://a.com",
        "http://b.com",
      ]);
    }
  });

  it("rejects invalid PORT", () => {
    const parsed = envSchema.safeParse({ PORT: 99999 });
    expect(parsed.success).toBe(false);
  });
});
