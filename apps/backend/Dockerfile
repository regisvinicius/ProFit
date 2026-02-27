FROM node:22-slim AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps ./apps

RUN pnpm install --frozen-lockfile
RUN pnpm --filter backend build

FROM node:22-slim AS runtime

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/backend/package.json ./apps/backend/

RUN pnpm install --frozen-lockfile --filter backend

COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/drizzle ./apps/backend/drizzle

WORKDIR /app/apps/backend

EXPOSE 3000
ENV NODE_ENV=development

CMD ["sh", "-c", "pnpm db:migrate && pnpm db:seed && node dist/index.js"]