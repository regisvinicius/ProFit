import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Env } from "../config/env.js";
import type { DatabaseSchema } from "../db/schemas/index.js";

declare module "fastify" {
  interface FastifyInstance {
    config: Env;
    db: NodePgDatabase<DatabaseSchema>;
  }

  interface FastifyRequest {
    jwtVerify?: () => Promise<JwtPayload>;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string; email?: string };
    user: { sub: string; email?: string };
  }
}

export type JwtPayload = { sub: string; email?: string };
