# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .

# Build-time DB connection for Prisma generate (points to prod container)
ARG DATABASE_URL=postgresql://anhnh_prod:SuperMira%40040126@postgres-prod:5432/finance_blog_prod
ENV DATABASE_URL=${DATABASE_URL}

RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Runtime DB connection string for production
ENV DATABASE_URL=postgresql://anhnh_prod:SuperMira%40040126@postgres-prod:5432/finance_blog_prod
ENV PROD_DB_NAME=finance_blog_prod
ENV PROD_DB_USER=anhnh_prod
ENV PROD_DB_PASS=SuperMira@040126

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

USER nextjs
EXPOSE 3000

CMD ["npm", "start"]