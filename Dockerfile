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
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy prisma schema + migrations để chạy migrate deploy lúc runtime
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Cần prisma CLI để chạy migrate deploy
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs
EXPOSE 3000

# Chạy migrate trước, sau đó mới start app
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]