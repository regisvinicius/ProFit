# Backend: architecture and technical decisions

Reference document for the backend. Everything here can be revisited in pair.

---

## Stack (aligned with README)

| Layer         | Choice          | Rationale (README)                                |
|---------------|-----------------|---------------------------------------------------|
| Runtime       | Node.js         | Ecosystem, simple deploy                          |
| HTTP Framework| **Fastify**     | Performance, typing, ecosystem                     |
| Language      | TypeScript      | Strict mode, type-safe                             |
| API           | REST            | Health check, validation at boundaries              |
| Validation    | **Zod**         | Single source of truth: backend, frontend, OpenAPI  |
| Documentation | **Swagger**     | OpenAPI, @fastify/swagger (+ Zod → JSON Schema)     |
| Lint/Format   | **Biome**       | Simplicity, DX                                    |
| Database      | **PostgreSQL**  | Container, versioned migrations                     |
| ORM/Migrations| **Drizzle**     | Schema-first, versioned migrations, native TS      |
| API Doc UI    | **Swagger UI**  | In use: `/docs` with @fastify/swagger-ui            |

---

## Database (Docker)

- **PostgreSQL** in a container; backend also in Docker (Compose).
- **Tables**: `users`, `refresh_tokens` (auth); `channels`, `products`, `fee_rules`, `sales`, `costs` (domain; UUID v7, user-scoped). Fee rules are per channel; sales reference product and optional channel; costs can link to product and/or sale.
- **Drizzle**: schema in **`src/db/schemas/`** (one file per table; `index.ts` exports `schemaForDb`). Migrations in `drizzle/`. `db:generate` runs with tsx so schema imports resolve; `db:migrate` applies migrations.

---

## Authentication — options (decide in pair)

README mentions **JWT + Refresh Token**. Below are common options; they can be combined (e.g. JWT + refresh in DB).

| Option | Description | Pros | Cons |
|-------|-------------|------|------|
| **1. JWT only (access)** | Single signed token; stateless. | Simple, scales well. | Revocation = short expiry or blacklist. |
| **2. JWT + Refresh** | Short access (e.g. 15 min) + long refresh (e.g. 7 days); refresh stored in DB. | Revoke refresh; limited access over time. | More code (refresh route, token cleanup). |
| **3. Session (cookie)** | Session on server (Redis/DB); `httpOnly` cookie. | Immediate revocation; secure in browser. | Stateful; scales with Redis/DB. |
| **4. OAuth2 / “Login with Google”** | User logs in with provider; backend exchanges code for token. | No password storage; familiar. | Depends on provider; more complex flow. |
| **5. API Key** | Fixed key per app or user. | Very simple for integrations. | Not “user login”; more for server-to-server. |

**Suggestion aligned with README:** **2. JWT + Refresh** — access token in memory on frontend, refresh in httpOnly cookie or body; refresh stored in `refresh_tokens` table for revocation.

**Useful libs:** `@fastify/jwt` (sign/verify JWT), `argon2` or `bcrypt` (password hash). Refresh: DB row with `userId`, `token` (hash), `expiresAt`.

**Implemented:** **2. JWT + Refresh** — POST /auth/register, /auth/login, /auth/refresh, /auth/logout, GET /auth/me. Access token (JWT), refresh token (opaque, stored hashed in `refresh_tokens`). Argon2 for password hash. Schema ready for **Login with Google** later: `users.passwordHash` nullable, `users.googleId`; no extra migration needed.

---

## Single source of truth: Zod

We use **Zod** so that one schema defines:

- **Backend**: request/response validation (via `fastify-type-provider-zod`).
- **Frontend**: form validation, types (e.g. `z.infer<typeof schema>`), API client types.
- **Documentation**: OpenAPI/Swagger can be derived from Zod (e.g. `jsonSchemaTransform` when using the type provider with @fastify/swagger).

Schemas live in **`src/schemas/`** (e.g. `health.ts`). Routes reference these schemas; no duplicate JSON Schema or hand-written types for the same contract.

---

## Folder architecture (modular)

```
apps/backend/
├── src/
│   ├── index.ts              # bootstrap: Fastify, plugins, routes
│   ├── config/               # env, constants
│   ├── schemas/              # Zod schemas (single source of truth)
│   ├── routes/               # routes per resource (health, products, ...)
│   ├── services/             # application logic (calls domain + db)
│   ├── domain/               # business rules, calculations (no Fastify, no DB)
│   ├── db/                   # schema, migrations, connection
│   └── plugins/               # Fastify plugins (swagger, auth, etc.)
├── package.json
├── tsconfig.json
├── biome.json
└── Dockerfile
```

- **routes**: receive request, validate input, call service, return response.
- **services**: orchestrate domain + db; do not know HTTP details.
- **domain**: entities (`src/domain/entities.ts`: SaleInput, ProductInput, FeeRuleInput, etc.) and calculations (`src/domain/profit.ts`: revenue, fee from rule, cost of goods, profit, margin); no dependency on Fastify or DB. Tests in `src/domain/profit.test.ts`.

---

## Env and config

- **`.env.example`** in `apps/backend/`: lists all env vars (PORT, NODE_ENV, DATABASE_URL, CORS_ORIGINS; later JWT_*). Do not commit `.env` (in .gitignore).
- **`src/config/env.ts`**: single module that reads `process.env`, validates with **Zod**, and exports typed **`env`**. App uses `env.PORT`, `env.CORS_ORIGINS`, etc.; fails fast on invalid/missing required vars.

## CORS and security

- **@fastify/cors**: origin from `env.CORS_ORIGINS` (comma-separated). Empty = same origin only; for dev can allow e.g. `http://localhost:5173`.
- **@fastify/helmet**: secure HTTP headers. Registered with `contentSecurityPolicy: false` so Swagger UI works; can tighten later.

## Health: liveness and readiness

- **GET /v1/health** — liveness: process is alive (status, timestamp).
- **GET /v1/health/ready** — readiness: alive + DB check when available. Response includes `db: "ok" | "not_checked" | "error"`. When **DATABASE_URL** is set, the app sets `app.decorate('checkDb', ...)` (ping with `SELECT 1`); otherwise `db: "not_checked"`.

## Errors and i18n readiness

- **`src/lib/errors.ts`**: `AppError(statusCode, message, code?)`, `ERRORS` (all client-facing and internal message strings), `createErrorHandler()` for Fastify. Services throw `AppError(409, ERRORS.EMAIL_ALREADY_REGISTERED)` etc.
- **i18n:** All user-facing messages are in **`ERRORS`**. When you add i18n, introduce a `t(locale, key)` (or similar) and in the error handler use `t(request.locale, error.messageKey)` instead of `error.message`, or pass a message key in AppError and resolve the translated string in the handler using `Accept-Language` or a custom header/query.

## Tests

- **Vitest** for all tests (domain, routes, config). Config in `vitest.config.ts`; `pnpm test` / `pnpm test:watch` in backend; `pnpm test` at root runs backend tests.

## Development workflow (Cursor pair programming)

This project is developed with **Cursor** as a pair-programming partner. The developer **chooses technologies** and **how to solve problems**; Cursor is used for **comparisons** (libraries, patterns, trade-offs), **research**, and **implementation** — in a senior-dev style: explicit decisions, clear structure, type safety, minimal unnecessary abstraction. Asking Cursor for comparisons, searches, and code generation keeps the bar high and the codebase coherent; decisions are written down here and in SUMMARY so that future work (by the developer or by AI) stays aligned.

---

## What is installed / next

- **fastify**, **@fastify/swagger**, **@fastify/swagger-ui**, **@fastify/cors**, **@fastify/helmet** — API + Swagger UI + CORS + secure headers.
- **Zod** + **fastify-type-provider-zod** — validation and types; schemas in `src/schemas/`.
- **Config** — `src/config/env.ts` + `.env.example`.
- **Health** — liveness + readiness (readiness DB check when `checkDb` is set).
- **Vitest** — test runner; example test for env schema in `src/config/env.test.ts`.
- **Drizzle** + **PostgreSQL** — schema, migrations, `users` table. When **DATABASE_URL** is set, app connects and **checkDb** is set for readiness.
- **Docker Compose** — `db` (Postgres) + `backend`; everything runs together.
- **Auth** — options above; implement after choosing (e.g. 2. JWT + Refresh).
