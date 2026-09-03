# Step 1: Base image
FROM node:20-alpine AS base

# Install dependencies needed for SQLite and Prisma
RUN apk add --no-libc6-compat openssl

WORKDIR /app

# Step 2: Dependencies
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci

# Step 3: Build
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

RUN apk add --no-libc6-compat openssl

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/.env.example ./.env

RUN mkdir -p /app/uploads /app/prisma

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push && node prisma/seed.js && npm run start"]
