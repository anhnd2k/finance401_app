FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and prisma schema
COPY package.json yarn.lock ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN yarn install --frozen-lockfile

# Explicitly generate Prisma client (also runs via postinstall, but kept for clarity)
RUN npx prisma generate

COPY . .
RUN yarn build

# ── Runner ──────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
# Required for Next.js standalone to bind on all interfaces inside Docker
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Standalone bundle includes a minimal node_modules — no need to copy full deps
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
