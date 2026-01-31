import { describe, expect, it, vi } from "vitest";
import { AppError, ERRORS, isUniqueViolation } from "../../src/lib/errors.js";
import { parseUserIdFromSub, register } from "../../src/services/auth.js";

type RegisterApp = Parameters<typeof register>[0];
type RegisterTx = Parameters<
  Parameters<RegisterApp["db"]["transaction"]>[0]
>[0];

const mockApp = {
  config: {
    JWT_SECRET: "secret-min-32-chars-for-testing",
    JWT_ACCESS_TTL: "15m",
    JWT_REFRESH_TTL: "7d",
  },
  db: {
    query: { users: { findFirst: vi.fn().mockResolvedValue(null) } },
    insert: vi.fn(),
    transaction: vi.fn(),
  },
  jwt: { sign: vi.fn().mockReturnValue("access-token") },
} as unknown as RegisterApp;

describe("register", () => {
  it("throws 409 when insert fails with unique_violation (race condition)", async () => {
    const pgUniqueError = new Error("duplicate key value") as Error & {
      code: string;
    };
    pgUniqueError.code = "23505";

    vi.mocked(mockApp.db.query.users.findFirst).mockResolvedValue(undefined);
    vi.mocked(mockApp.db.transaction).mockImplementation(async (cb) => {
      const tx = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockRejectedValue(pgUniqueError),
          }),
        }),
      };
      return cb(tx as unknown as RegisterTx);
    });

    await expect(
      register(mockApp, "same@example.com", "password123"),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: ERRORS.EMAIL_ALREADY_REGISTERED,
    });
  });
});

describe("parseUserIdFromSub", () => {
  it("returns userId when sub is a valid integer string", () => {
    expect(parseUserIdFromSub("1")).toBe(1);
    expect(parseUserIdFromSub("42")).toBe(42);
    expect(parseUserIdFromSub(" 7 ")).toBe(7);
  });

  it("throws 401 INVALID_TOKEN when sub is not a number", () => {
    expect(() => parseUserIdFromSub("abc")).toThrow(AppError);
    expect(() => parseUserIdFromSub("abc")).toThrow(ERRORS.INVALID_TOKEN);
    const err = (() => {
      try {
        parseUserIdFromSub("abc");
      } catch (e) {
        return e;
      }
    })() as AppError;
    expect(err.statusCode).toBe(401);
  });

  it("throws 401 when sub is empty string", () => {
    expect(() => parseUserIdFromSub("")).toThrow(AppError);
    expect(() => parseUserIdFromSub("")).toThrow(ERRORS.INVALID_TOKEN);
  });

  it("parses leading digits and ignores trailing non-digits", () => {
    expect(parseUserIdFromSub("99x")).toBe(99);
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
