# Backend setup — step-by-step

English summary of the steps we followed to get the backend running (pair-style, without coding ahead).

---

## 1. Project and docs

- Started from a clean repo (only README).
- Created **docs/backend-decisions.md** to lock in: stack (Fastify, PostgreSQL, Drizzle, Biome, Swagger, **Zod**), folder layout, auth options. All decisions can be revisited in pair.

---

## 2. Monorepo and package manager

- **pnpm** as package manager.
- **pnpm-workspace.yaml** at repo root with `packages: ["apps/*"]`.
- **package.json** at root with `"packageManager": "pnpm@9.15.0"` and scripts that delegate to the backend (`dev`, `build`, `lint`, `lint:fix`, `format`, `check`, `db:generate`, `db:migrate`).
- Run **`pnpm install`** from root to install all workspace dependencies.

---

## 3. Backend app (Fastify + Swagger + Zod)

- **apps/backend/** with:
  - **package.json**: Fastify, @fastify/swagger, @fastify/swagger-ui, **zod**, **fastify-type-provider-zod**, TypeScript, tsx, Biome, @types/node.
  - **tsconfig.json**: ESNext, strict, `src` → `dist`.
  - **src/index.ts**: create Fastify app; set Zod compilers; register **Helmet**, **CORS**, Swagger with **jsonSchemaTransform**, Swagger UI; register health routes; listen on **env.PORT** (from config).
  - **src/schemas/health.ts**: **Zod** schemas: `healthResponseSchema` (liveness), `readinessResponseSchema` (readiness with `db` field); single source of truth.
  - **src/routes/health.ts**: `GET /` (liveness), `GET /ready` (readiness; uses `app.checkDb` when set, else `db: "not_checked"`).
- **Port:** comes from **config** (`env.PORT`); see step 3b.

---

## 3b. Env and config (Zod)

- **`.env.example`** in `apps/backend/`: lists PORT, NODE_ENV, DATABASE_URL, CORS_ORIGINS; JWT_* commented for later. Do not commit `.env` (in .gitignore).
- **`src/config/env.ts`**: Zod schema for env (PORT, NODE_ENV, DATABASE_URL optional, CORS_ORIGINS as array). `loadEnv()` parses `process.env` and exports typed **`env`**; app uses `env.PORT`, `env.CORS_ORIGINS`, etc. Fails fast on invalid env.

---

## 3c. CORS and Helmet

- **@fastify/cors**: registered with `origin: env.CORS_ORIGINS.length > 0 ? env.CORS_ORIGINS : true` (list of origins or allow-all for dev).
- **@fastify/helmet**: registered with `contentSecurityPolicy: false` so Swagger UI works; secure HTTP headers.

---

## 3d. Health: liveness and readiness

- **GET /health** — liveness: `{ status, timestamp }` (process alive).
- **GET /health/ready** — readiness: `{ status, timestamp, db: "ok" | "not_checked" | "error" }`. When DB is connected, set `app.decorate('checkDb', async () => { ... })` before registering health routes; until then `db: "not_checked"`.

---

## 4. Biome

- **biome.json** in backend: `organizeImports.enabled: true`, linter recommended, formatter 2 spaces.
- **files.ignore**: `["dist", "node_modules", "drizzle"]` so Biome does not check build output (avoids errors on generated JS).
- Scripts: **lint** = `biome check .`, **lint:fix** = `biome check --write .` (applies fixes and import organization).
- Root scripts: `pnpm lint`, `pnpm lint:fix`, `pnpm format`, `pnpm check`.

---

## 5. Tests (Vitest)

- **Vitest** for all tests (domain, routes, config). **vitest.config.ts**: Node env, globals, include `src/**/*.test.ts`.
- **src/config/env.test.ts**: example tests for env schema (PORT default, CORS_ORIGINS parsing, invalid PORT).
- Scripts: **test**, **test:watch** in backend; **pnpm test**, **pnpm test:watch** at root.

---

## 6. Database (Drizzle + PostgreSQL)

- Dependencies: **drizzle-orm**, **pg**, **drizzle-kit** (dev), **@types/pg** (dev).
- **src/db/schema.ts**: `users` table (id, email, passwordHash, createdAt, updatedAt) with unique index on email.
- **src/db/index.ts**: create Pool from `DATABASE_URL`, export `db` (Drizzle with schema). Throws if `DATABASE_URL` is missing (only loaded when env has it).
- **src/db/migrate.ts**: run Drizzle migrations from `./drizzle`.
- **drizzle.config.ts**: schema path, output `./drizzle`, dialect PostgreSQL, `DATABASE_URL` from env (default `postgres://app:app@localhost:5432/profit`).
- **Wiring:** In **src/index.ts**, when **env.DATABASE_URL** is set, we dynamic-import `db` and set **app.decorate('checkDb', ...)** (ping with `SELECT 1`). Then **GET /health/ready** returns `db: "ok"` or `"error"`. Without `DATABASE_URL`, app still runs and readiness returns `db: "not_checked"`.
- Scripts: **db:generate** = generate migrations from schema, **db:migrate** = run migrations (DB must be up), **db:studio** = Drizzle Studio.

---

## 7. Docker

- **docker-compose.yml** at root: **db** (postgres:16-alpine), **backend** (build from apps/backend). Backend depends on db (healthcheck). Env: `DATABASE_URL` for backend, Postgres user/db/password for db.
- **apps/backend/Dockerfile**: multi-stage build; final image runs `node dist/index.js`.

---

## 8. Fixes applied along the way

- **Biome checking dist/:** fixed by adding `dist` to `files.ignore` in **biome.json**.
- **Build error “Could not find declaration file for 'pg'”:** added **@types/pg** to backend devDependencies.
- **Runtime “options.port … Received NaN”:** `Number(process.env.PORT) ?? 3000` leaves `NaN` when PORT is unset; changed to `Number.parseInt(process.env.PORT ?? "3000", 10)`.

---

## 9. Commands recap (from repo root)

| Command        | Effect                          |
|----------------|----------------------------------|
| `pnpm install` | Install workspace deps          |
| `pnpm dev`     | Run backend (tsx watch)         |
| `pnpm build`   | Build backend (tsc)             |
| `pnpm lint`    | Biome check (no write)          |
| `pnpm lint:fix`| Biome check + apply fixes       |
| `pnpm format`  | Biome format                    |
| `pnpm test`    | Run Vitest once                 |
| `pnpm test:watch` | Vitest watch (backend)       |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate`  | Run migrations (need DB up) |
| `docker compose up -d db` | Start Postgres only     |
| `docker compose up -d`    | Start db + backend      |

---

## 10. URLs when backend is running

- **Liveness:** http://localhost:3000/health  
- **Readiness:** http://localhost:3000/health/ready  
- **Swagger UI:** http://localhost:3000/docs  

---

Next steps (when you want): run migrations and connect DB; set `app.decorate('checkDb', ...)` so readiness pings DB; then implement auth (e.g. JWT + Refresh) per **backend-decisions.md**. See **SUMMARY.md** for a one-page overview.
