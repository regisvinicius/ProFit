FROM node:22-alpine AS base
WORKDIR /app
COPY package.json ./
RUN npm ci --omit=dev
COPY dist ./dist
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]

FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base
COPY --from=builder /app/dist ./dist
