FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@8.15.5 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/backend/package.json ./apps/backend/
RUN pnpm install --frozen-lockfile --filter backend --prod --ignore-scripts
EXPOSE 3000
ENV NODE_ENV=production

# Stage 2: Builder - Build the application
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@8.15.5 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
# Copy all package.json files for proper pnpm workspace resolution
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY apps/backend ./apps/backend
RUN pnpm --filter backend build

FROM base
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/drizzle ./apps/backend/drizzle
RUN chown -R node:node /app
USER node
WORKDIR /app/apps/backend
CMD ["node", "dist/index.js"]
