#!/usr/bin/env bash
# Separate database for Playwright (asclepia_e2e on the local compose server), so e2e runs never
# touch dev data. Called by playwright.config.ts before the server starts. Requires `pnpm db:setup`.
set -euo pipefail
cd "$(dirname "$0")/../.."
set -a; . ./.env; set +a
: "${MIGRATE_DATABASE_URL:?}" "${DB_APP_PASSWORD:?}"
docker compose exec -T db psql -q -U asclepia_owner -d asclepia -tAc \
  "select 1 from pg_database where datname = 'asclepia_e2e'" | grep -q 1 ||
  docker compose exec -T db psql -q -U asclepia_owner -d asclepia -c "create database asclepia_e2e"
MIGRATE_DATABASE_URL="${MIGRATE_DATABASE_URL%/*}/asclepia_e2e" pnpm exec prisma migrate deploy >/dev/null
docker compose exec -T db psql -q -v ON_ERROR_STOP=1 -U asclepia_owner -d asclepia_e2e \
  -v app_password="$DB_APP_PASSWORD" -f /sql/roles.sql
