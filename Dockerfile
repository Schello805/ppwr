# syntax=docker/dockerfile:1

# Step 1: Base image
FROM node:20-alpine AS base

# Install dependencies needed for SQLite and Prisma
RUN apk add --no-libc6-compat openssl

WORKDIR /app

# Step 2: Dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci

# Step 3: Build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

# Step 4: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN apk add --no-libc6-compat openssl curl

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/prisma ./prisma

# These directories must be configured as persistent directories in CapRover.
RUN mkdir -p /app/public /app/uploads /app/data

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/api/health || exit 1

CMD ["sh", "-c", "npx prisma db push && node prisma/seed.js && npm run start"]
