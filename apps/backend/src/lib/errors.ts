/**
 * Centralized HTTP errors and message constants.
 * Services throw AppError; setErrorHandler maps to response.
 */

/** HTTP error with status and optional client code. */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}

/** Message constants (single source for i18n / consistency). */
export const ERRORS = {
  // Auth — client-facing
  EMAIL_ALREADY_REGISTERED: "Email already registered",
  INVALID_EMAIL_OR_PASSWORD: "Invalid email or password",
  REFRESH_TOKEN_REQUIRED: "refreshToken required in body",
  INVALID_OR_EXPIRED_REFRESH_TOKEN: "Invalid or expired refresh token",
  JWT_SECRET_NOT_CONFIGURED: "JWT_SECRET not configured",
  JWT_NOT_CONFIGURED: "JWT not configured",
  USER_NOT_FOUND: "User not found",
  // Internal (logged, not necessarily exposed as-is)
  INTERNAL: "Internal server error",
  INSERT_FAILED: "Insert failed",
} as const;

type FastifyError = Error & { statusCode?: number; validation?: unknown };

/** Fastify error handler: AppError → statusCode + body; 4xx from Fastify (e.g. validation) → pass through; else 500. */
export function createErrorHandler() {
  return function errorHandler(
    error: unknown,
    _request: import("fastify").FastifyRequest,
    reply: import("fastify").FastifyReply,
  ): void {
    if (isAppError(error)) {
      const body: { error: string; code?: string } = { error: error.message };
      if (error.code) body.code = error.code;
      void reply.status(error.statusCode).send(body);
      return;
    }
    const statusCode = (error as FastifyError)?.statusCode;
    if (
      typeof statusCode === "number" &&
      statusCode >= 400 &&
      statusCode < 500
    ) {
      const message = error instanceof Error ? error.message : "Bad request";
      void reply.status(statusCode).send({ error: message });
      return;
    }
    if (error instanceof Error) {
      reply.log?.error(error, error.message);
    }
    void reply.status(500).send({ error: ERRORS.INTERNAL });
  };
}
