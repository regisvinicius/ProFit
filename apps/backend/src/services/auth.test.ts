import { describe, expect, it, vi } from "vitest";
import { ERRORS, isUniqueViolation } from "../lib/errors.js";
import { register } from "./auth.js";

const mockApp = {
  config: {
    JWT_SECRET: "secret-min-32-chars-for-testing",
    JWT_ACCESS_TTL: "15m",
    JWT_REFRESH_TTL: "7d",
  },
  db: {
    query: { users: { findFirst: vi.fn().mockResolvedValue(null) } },
    insert: vi.fn(),
  },
  jwt: { sign: vi.fn().mockReturnValue("access-token") },
} as unknown as Parameters<typeof register>[0];

describe("register", () => {
  it("throws 409 when insert fails with unique_violation (race condition)", async () => {
    const pgUniqueError = new Error("duplicate key value") as Error & {
      code: string;
    };
    pgUniqueError.code = "23505";

    vi.mocked(mockApp.db.query.users.findFirst).mockResolvedValue(undefined);
    vi.mocked(mockApp.db.insert)
      .mockReturnValueOnce({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue(pgUniqueError),
        }),
      } as never)
      .mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      } as never);

    await expect(
      register(mockApp, "same@example.com", "password123"),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: ERRORS.EMAIL_ALREADY_REGISTERED,
    });
  });
});

describe("isUniqueViolation", () => {
  it("returns true for pg error code 23505", () => {
    const err = new Error() as Error & { code: string };
    err.code = "23505";
    expect(isUniqueViolation(err)).toBe(true);
  });

  it("returns false for other errors", () => {
    expect(isUniqueViolation(new Error())).toBe(false);
    expect(isUniqueViolation(null)).toBe(false);
  });
});
