# Stage 1: Base - Install dependencies
FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@8.15.5 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/backend/package.json ./apps/backend/
RUN pnpm install --frozen-lockfile --ignore-scripts

# Stage 2: Builder - Build the application
FROM base AS builder
WORKDIR /app
COPY apps/frontend ./apps/frontend
COPY apps/backend/src ./apps/backend/src
RUN pnpm --filter frontend build

# Stage 3: Runner - Serve with Nginx
FROM nginx:alpine AS runner
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Support running as non-root
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

USER nginx

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
