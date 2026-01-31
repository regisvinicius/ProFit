import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import {
  healthResponseSchema,
  readinessFailureResponseSchema,
  readinessResponseSchema,
} from "../schemas/health.js";

type CheckDb = () => Promise<boolean>;

export async function healthRoutes(
  app: FastifyInstance,
  _opts: FastifyPluginOptions,
) {
  const checkDb: CheckDb | null =
    (app as { checkDb?: CheckDb }).checkDb ?? null;

  app.route({
    method: "GET",
    url: "/",
    schema: {
      description: "Liveness: process is alive",
      response: { 200: healthResponseSchema },
    },
    handler: async (_request, reply) => {
      return reply.send({
        status: "ok",
        timestamp: new Date().toISOString(),
      });
    },
  });

  app.route({
    method: "GET",
    url: "/ready",
    schema: {
      description:
        "Readiness: alive and able to serve (DB check when available)",
      response: {
        200: readinessResponseSchema,
        503: readinessFailureResponseSchema,
      },
    },
    handler: async (_request, reply) => {
      let db: "ok" | "not_checked" | "error" = "not_checked";
      if (checkDb) {
        try {
          db = (await checkDb()) ? "ok" : "error";
        } catch {
          db = "error";
        }
      }
      const timestamp = new Date().toISOString();
      if (db === "error") {
        return reply.status(503).send({
          status: "error",
          timestamp,
          db,
        });
      }
      return reply.send({
        status: "ok",
        timestamp,
        db,
      });
    },
  });
}
