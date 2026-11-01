#!/usr/bin/env bash
# Local dev database: start Postgres (compose.yaml), apply migrations as the owner, then re-apply the
# app-role grants (prisma/sql/roles.sql must run after every migration). Production is done by a
# human with the same two commands (CLAUDE.md R10).
set -euo pipefail
cd "$(dirname "$0")/../.."
[ -f .env ] || { echo "missing .env (copy .env.example)"; exit 1; }
set -a; . ./.env; set +a
: "${MIGRATE_DATABASE_URL:?set MIGRATE_DATABASE_URL in .env}" "${DB_APP_PASSWORD:?set DB_APP_PASSWORD in .env}"
docker compose up -d --wait
for _ in $(seq 1 30); do docker compose exec -T db pg_isready -q -U asclepia_owner -d asclepia && break; sleep 1; done
pnpm exec prisma migrate deploy
docker compose exec -T db psql -q -v ON_ERROR_STOP=1 -U asclepia_owner -d asclepia \
  -v app_password="$DB_APP_PASSWORD" -f /sql/roles.sql
echo "db ready: migrations applied, app role grants refreshed"
