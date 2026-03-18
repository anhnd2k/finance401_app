#!/bin/sh
set -e

echo "[entrypoint] Running Prisma migrations..."
./node_modules/.bin/prisma migrate deploy

echo "[entrypoint] Starting Next.js server..."
exec node server.js
