import { describe, expect, it } from "vitest";
import { envSchema } from "../../src/config/env.js";

describe("env config", () => {
  it("parses defaults with empty input", () => {
    const parsed = envSchema.safeParse({});
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.PORT).toBe(3000);
      expect(parsed.data.NODE_ENV).toBe("development");
      expect(parsed.data.CORS_ORIGINS).toEqual([]);
      expect(parsed.data.JWT_ACCESS_TTL).toBe("15m");
      expect(parsed.data.JWT_REFRESH_TTL).toBe("7d");
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

  it("rejects invalid JWT_REFRESH_TTL format", () => {
    expect(envSchema.safeParse({ JWT_REFRESH_TTL: "30days" }).success).toBe(
      false,
    );
    expect(envSchema.safeParse({ JWT_REFRESH_TTL: "1 week" }).success).toBe(
      false,
    );
    expect(envSchema.safeParse({ JWT_REFRESH_TTL: "invalid" }).success).toBe(
      false,
    );
  });

  it("accepts optional DATABASE_URL and JWT_SECRET", () => {
    const parsed = envSchema.safeParse({
      DATABASE_URL: "postgres://localhost/db",
      JWT_SECRET: "a".repeat(32),
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.DATABASE_URL).toBe("postgres://localhost/db");
      expect(parsed.data.JWT_SECRET).toBe("a".repeat(32));
    }
  });
});
