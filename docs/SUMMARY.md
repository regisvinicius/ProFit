# Backend summary — what we have so far

High-level overview of the ProFit/ProfitOS backend. Use this to understand the full picture; details are in **backend-decisions.md** and **backend-setup-step-by-step.md**.

---

## How this is built (development)

This project is developed with **Cursor** as a pair-programming partner. The developer drives **technology choices** and **how to solve problems**; Cursor is used for **comparisons** (e.g. libs, patterns), **research**, and **implementation** — in a way that mirrors how a solid senior dev would reason and code: explicit trade-offs, clear structure, type safety, and minimal unnecessary abstraction. Decisions are documented here and in **backend-decisions.md** so the codebase stays coherent and onboarding (human or AI) is straightforward.

---

## In one paragraph

We have a **Fastify** API in **apps/backend/** with **TypeScript**, **Zod** (single source of truth for validation, types, and OpenAPI), **Biome** (lint/format), **Drizzle + PostgreSQL** (schema in `db/schemas/`, one file per table; migrations; `db` and readiness when **DATABASE_URL** is set), **Swagger UI** at `/docs`, **centralized config** (env validated with Zod), **CORS** and **Helmet**, **liveness + readiness** at `/v1/health` and `/v1/health/ready`, **centralized errors** (AppError + ERRORS in `lib/errors.ts`), and **Vitest** for tests. Everything is driven by **pnpm** from the repo root; **.env.example** documents required env vars.

---

## What’s in place

| Area | What we did |
|------|------------------|
| **Stack** | Node, Fastify, TypeScript, Zod, Drizzle, PostgreSQL, Biome, Swagger, pnpm monorepo. |
| **Env & config** | `.env.example` lists vars; `src/config/env.ts` validates `process.env` with Zod and exports typed `env`. No raw `process.env` in app code. |
| **API** | Routes under `/v1` (health, auth). OpenAPI from Zod via `jsonSchemaTransform`. Centralized error handler (AppError → status + body). |
| **Security** | @fastify/cors (origins from `CORS_ORIGINS`), @fastify/helmet (headers; CSP off for Swagger). |
| **DB** | Drizzle schema in **src/db/schemas/** (one file per table; index exports `schemaForDb`). Migrations in `drizzle/`; `db:generate` / `db:migrate`. When **DATABASE_URL** is set, app imports `db` and sets **checkDb** for readiness. |
| **Tests** | Vitest; config in `vitest.config.ts`; example test for env schema. `pnpm test` from root. |
| **Docker** | `docker-compose.yml`: `db` (Postgres) + `backend`. Backend Dockerfile multi-stage. |
| **Docs** | backend-decisions.md (architecture, stack, auth, env, CORS, health, tests, dev workflow). backend-setup-step-by-step.md (step-by-step). i18n.md (i18n). See "How this is built" below for Cursor pair programming. |

---

## Main files (backend)

- **src/index.ts** — Bootstrap: Zod compilers, Helmet, CORS, Swagger; if `env.DATABASE_URL` set, dynamic-imports `db` and decorates **checkDb** (ping); health routes; listens on `env.PORT`.
- **src/config/env.ts** — Zod env schema; exports `env` (PORT, NODE_ENV, DATABASE_URL, CORS_ORIGINS).
- **src/schemas/** — **Zod** schemas for API validation (body/response) and OpenAPI: `auth.ts`, `health.ts`. Single source of truth for request/response contracts.
- **src/db/schemas/** — **Drizzle** table definitions (one file per table): `users.ts`, `refreshTokens.ts`, `enums.ts`, `channels.ts`, `products.ts`, `feeRules.ts`, `sales.ts`, `costs.ts`, plus `uuid.ts`. **src/db/schemas/index.ts** re-exports all and defines `schemaForDb` / `DatabaseSchema` for the Fastify augmentation.
- **src/db/index.ts** — Drizzle connection and `ping`; uses `schemaForDb` from `schemas/index.ts`. **checkDb** is set when **DATABASE_URL** is set.
- **src/routes/health.ts** — GET `/` (liveness), GET `/ready` (readiness; uses `app.checkDb` when set).
- **src/domain/** — entities (SaleInput, ProductInput, FeeRuleInput, etc.) and profit logic (computeRevenue, computeFeeFromRule, computeProfit, computeMarginPercent, analyzeSale). No Fastify/DB.
- **src/lib/errors.ts** — `AppError` (statusCode + message), `ERRORS` constants, `createErrorHandler()` for Fastify. Routes/services throw `AppError`; global handler maps to HTTP response.

---

## Commands (from repo root)

| Command | What it does |
|---------|------------------|
| `pnpm install` | Install dependencies. |
| `pnpm dev` | Run backend (tsx watch). |
| `pnpm build` | Build backend (tsc). |
| `pnpm lint` / `pnpm lint:fix` | Biome check / check + fix. |
| `pnpm test` / `pnpm test:watch` | Run Vitest once / watch. |
| `pnpm clean` | Remove all `node_modules` (root + apps). Run before a fresh `pnpm install`. |
| `pnpm db:generate` | Generate Drizzle migrations (runs with tsx so schema `.ts` imports resolve). |
| `pnpm db:migrate` | Run migrations (DB must be up). |

---

## URLs (backend on port 3000)

- **Liveness:** http://localhost:3000/v1/health  
- **Readiness:** http://localhost:3000/v1/health/ready  
- **Auth:** http://localhost:3000/v1/auth (register, login, refresh, logout, me)  
- **Swagger UI:** http://localhost:3000/docs  

---

## Domain (profit intelligence)

- **Tables:** `channels`, `products`, `fee_rules`, `sales`, `costs` (UUID v7; all scoped by `user_id` except fee_rules by channel). Run **pnpm db:generate** then **pnpm db:migrate** to apply.
- **Domain layer:** `src/domain/` — entities (plain types), profit logic (revenue, fee from rule, cost of goods, extra costs, profit, margin). Pure functions; no Fastify, no DB. Tests in `src/domain/profit.test.ts`.

## Improvements

See **backend-improvements.md** for optional improvements (central error handler, `/v1` prefix, error constants, tests, etc.). See **i18n.md** for how to add internationalization (backend is ready; messages in `ERRORS`).

## Next (when you're ready)

1. **DB:** Run **pnpm db:migrate** (with Postgres up) to apply migrations. With **DATABASE_URL** set, readiness already pings DB.  
2. **Auth:** JWT + Refresh implemented (register, login, refresh, logout, me). Schema ready for Login with Google.  
3. **API:** Add routes/services for products, sales, channels, fee rules, costs; wire domain into services.  
4. **i18n:** Backend is ready — all client-facing messages live in **`src/lib/errors.ts`** (`ERRORS`). When you add i18n, replace `ERRORS.XXX` with a translate function (e.g. `t('errors.EMAIL_ALREADY_REGISTERED')`) and pass locale from `Accept-Language` or query/body in the error handler or a Fastify hook.
