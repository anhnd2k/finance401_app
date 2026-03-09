FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files và prisma schema
COPY package.json package-lock.json* ./
COPY prisma ./prisma/  # THÊM DÒNG NÀY

RUN npm ci

# Generate Prisma client
RUN npx prisma generate  # THÊM DÒNG NÀY

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma  # THÊM DÒNG NÀY

USER nextjs
EXPOSE 3000

CMD ["npm", "start"]