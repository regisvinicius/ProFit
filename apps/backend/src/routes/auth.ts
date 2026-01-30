import { eq } from "drizzle-orm";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { users } from "../db/schemas/index.js";
import { AppError, ERRORS } from "../lib/errors.js";
import {
  authResponseSchema,
  loginBodySchema,
  logoutBodySchema,
  refreshBodySchema,
  registerBodySchema,
} from "../schemas/auth.js";
import * as authService from "../services/auth.js";
import { errorResponseSchema } from "../shared/schemas.js";
import type { JwtPayload } from "../types/fastify.js";

async function requireJwt(request: FastifyRequest, _reply: FastifyReply) {
  if (!request.jwtVerify) throw new AppError(500, ERRORS.JWT_NOT_CONFIGURED);
  await request.jwtVerify<JwtPayload>();
}

export const authRoutes: FastifyPluginAsyncZod = async (
  app: FastifyInstance,
) => {
  const t = app.withTypeProvider<ZodTypeProvider>();

  t.post(
    "/register",
    {
      schema: {
        description: "Register with email and password",
        body: registerBodySchema,
        response: {
          200: authResponseSchema,
          409: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;
      const result = await authService.register(app, email, password);
      return reply.send(result);
    },
  );

  t.post(
    "/login",
    {
      schema: {
        description: "Login with email and password",
        body: loginBodySchema,
        response: {
          200: authResponseSchema,
          401: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;
      const result = await authService.login(app, email, password);
      return reply.send(result);
    },
  );

  t.post(
    "/refresh",
    {
      schema: {
        description: "Exchange refresh token for new access + refresh",
        body: refreshBodySchema,
        response: {
          200: authResponseSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { refreshToken: token } = request.body;
      if (!token) throw new AppError(400, ERRORS.REFRESH_TOKEN_REQUIRED);
      const result = await authService.refresh(app, token);
      return reply.send(result);
    },
  );

  t.post(
    "/logout",
    {
      schema: {
        description: "Revoke refresh token",
        body: logoutBodySchema,
        response: { 204: { type: "null" } },
      },
    },
    async (request, reply) => {
      const { refreshToken: token } = request.body;
      if (token) await authService.revokeRefresh(app, token);
      return reply.status(204).send();
    },
  );

  t.get(
    "/me",
    {
      onRequest: [requireJwt],
      schema: {
        description: "Current user (requires Bearer token)",
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "number" },
              email: { type: "string" },
              createdAt: { type: "string" },
            },
          },
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { sub } = request.user;
      const user = await app.db.query.users.findFirst({
        where: eq(users.id, Number(sub)),
        columns: { id: true, email: true, createdAt: true },
      });
      if (!user) throw new AppError(404, ERRORS.USER_NOT_FOUND);
      return reply.send({
        id: user.id,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
      });
    },
  );
};
