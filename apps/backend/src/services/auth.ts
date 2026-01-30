import { createHash, randomBytes } from "node:crypto";
import argon2 from "argon2";
import { and, eq, gt } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { refreshTokens, users } from "../db/schemas/index.js";
import { AppError, ERRORS } from "../lib/errors.js";
import type { AuthResponse, AuthUser } from "../schemas/auth.js";

const REFRESH_TOKEN_BYTES = 32;
const TOKEN_HASH_ALG = "sha256";

/** Parse TTL string (e.g. "7d", "15m") to milliseconds. Same format as JWT expiresIn. */
function parseTtlMs(ttl: string): number {
  const match = /^(\d+)([smhd])$/.exec(ttl.trim().toLowerCase());
  if (!match) return 7 * 24 * 60 * 60 * 1000; // fallback 7d
  const n = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return n * (multipliers[unit] ?? multipliers.d);
}

function hashToken(token: string): string {
  return createHash(TOKEN_HASH_ALG).update(token).digest("hex");
}

function toAuthUser(row: {
  id: number;
  email: string;
  createdAt: Date;
}): AuthUser {
  return {
    id: row.id,
    email: row.email,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function register(
  app: FastifyInstance,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const secret = app.config.JWT_SECRET;
  if (!secret) throw new AppError(500, ERRORS.JWT_SECRET_NOT_CONFIGURED);

  const existing = await app.db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existing) throw new AppError(409, ERRORS.EMAIL_ALREADY_REGISTERED);

  const passwordHash = await argon2.hash(password);
  const [user] = await app.db
    .insert(users)
    .values({ email, passwordHash })
    .returning({
      id: users.id,
      email: users.email,
      createdAt: users.createdAt,
    });
  if (!user) throw new AppError(500, ERRORS.INSERT_FAILED);

  const refreshToken = randomBytes(REFRESH_TOKEN_BYTES).toString("hex");
  const expiresAt = new Date(
    Date.now() + parseTtlMs(app.config.JWT_REFRESH_TTL),
  );
  await app.db.insert(refreshTokens).values({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt,
  });

  const accessToken = app.jwt.sign(
    { sub: String(user.id), email: user.email },
    { expiresIn: app.config.JWT_ACCESS_TTL },
  );

  return {
    accessToken,
    refreshToken,
    user: toAuthUser(user),
  };
}

export async function login(
  app: FastifyInstance,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const secret = app.config.JWT_SECRET;
  if (!secret) throw new AppError(500, ERRORS.JWT_SECRET_NOT_CONFIGURED);

  const user = await app.db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true, email: true, passwordHash: true, createdAt: true },
  });
  if (!user?.passwordHash)
    throw new AppError(401, ERRORS.INVALID_EMAIL_OR_PASSWORD);

  const ok = await argon2.verify(user.passwordHash, password);
  if (!ok) throw new AppError(401, ERRORS.INVALID_EMAIL_OR_PASSWORD);

  const refreshToken = randomBytes(REFRESH_TOKEN_BYTES).toString("hex");
  const expiresAt = new Date(
    Date.now() + parseTtlMs(app.config.JWT_REFRESH_TTL),
  );
  await app.db.insert(refreshTokens).values({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt,
  });

  const accessToken = app.jwt.sign(
    { sub: String(user.id), email: user.email },
    { expiresIn: app.config.JWT_ACCESS_TTL },
  );

  return {
    accessToken,
    refreshToken,
    user: toAuthUser(user),
  };
}

export async function refresh(
  app: FastifyInstance,
  refreshToken: string,
): Promise<AuthResponse> {
  const secret = app.config.JWT_SECRET;
  if (!secret) throw new AppError(401, ERRORS.JWT_SECRET_NOT_CONFIGURED);

  const tokenHash = hashToken(refreshToken);
  const now = new Date();
  const [deleted] = await app.db
    .delete(refreshTokens)
    .where(
      and(
        eq(refreshTokens.tokenHash, tokenHash),
        gt(refreshTokens.expiresAt, now),
      ),
    )
    .returning({ id: refreshTokens.id, userId: refreshTokens.userId });
  if (!deleted) {
    throw new AppError(401, ERRORS.INVALID_OR_EXPIRED_REFRESH_TOKEN);
  }

  const user = await app.db.query.users.findFirst({
    where: eq(users.id, deleted.userId),
    columns: { id: true, email: true, createdAt: true },
  });
  if (!user) throw new AppError(404, ERRORS.USER_NOT_FOUND);

  const newRefreshToken = randomBytes(REFRESH_TOKEN_BYTES).toString("hex");
  const expiresAt = new Date(
    Date.now() + parseTtlMs(app.config.JWT_REFRESH_TTL),
  );
  await app.db.insert(refreshTokens).values({
    userId: user.id,
    tokenHash: hashToken(newRefreshToken),
    expiresAt,
  });

  const accessToken = app.jwt.sign(
    { sub: String(user.id), email: user.email },
    { expiresIn: app.config.JWT_ACCESS_TTL },
  );

  return {
    accessToken,
    refreshToken: newRefreshToken,
    user: toAuthUser(user),
  };
}

export async function revokeRefresh(
  app: FastifyInstance,
  refreshToken: string,
): Promise<void> {
  const tokenHash = hashToken(refreshToken);
  await app.db
    .delete(refreshTokens)
    .where(eq(refreshTokens.tokenHash, tokenHash));
}
