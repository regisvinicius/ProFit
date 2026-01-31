import "dotenv/config";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifyJwt from "@fastify/jwt";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastify from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { env } from "./config/env.js";
import { createErrorHandler } from "./lib/errors.js";
import { authRoutes } from "./routes/auth.js";
import { healthRoutes } from "./routes/health.js";

const app = fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

app.decorate("config", env);

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

await app.register(fastifyHelmet, {
  contentSecurityPolicy: false,
});
await app.register(fastifyCors, {
  origin: env.CORS_ORIGINS.length > 0 ? env.CORS_ORIGINS : false,
});

await app.register(fastifySwagger, {
  openapi: {
    info: { title: "ProfitOS API", version: "0.1.0" },
  },
  transform: jsonSchemaTransform,
});

await app.register(fastifySwaggerUi, {
  routePrefix: "/docs",
});

if (env.DATABASE_URL) {
  const { db, ping } = await import("./db/index.js");
  app.decorate("db", db);
  app.decorate("checkDb", ping);
}

if (env.JWT_SECRET) {
  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
  });
}

app.setErrorHandler(createErrorHandler());

app.register(healthRoutes, { prefix: "/v1/health" });

if (env.JWT_SECRET && env.DATABASE_URL) {
  app.register(authRoutes, { prefix: "/v1/auth" });
}

await app.listen({ port: env.PORT, host: "0.0.0.0" });
