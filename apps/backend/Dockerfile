FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/
RUN pnpm install --frozen-lockfile --filter backend --prod
EXPOSE 3000
ENV NODE_ENV=production

FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/
RUN pnpm install --frozen-lockfile --filter backend
COPY apps/backend ./apps/backend
RUN pnpm --filter backend build

FROM base
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
WORKDIR /app/apps/backend
CMD ["node", "dist/index.js"]
