-- Low-privilege application role (security-baseline §2, stack-rules S4-7). Idempotent.
-- Run as the schema owner (the role that runs `prisma migrate`):
--   psql "$MIGRATE_DATABASE_URL" -v app_password="$DB_APP_PASSWORD" -f prisma/sql/roles.sql
-- The app connects as asclepia_app: DML only, no DDL, no superuser, AuditLog insert/select only.
\set ON_ERROR_STOP on

SELECT format(
  'CREATE ROLE asclepia_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD %L',
  :'app_password')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'asclepia_app') \gexec

SELECT format('ALTER ROLE asclepia_app PASSWORD %L', :'app_password') \gexec
SELECT format('GRANT CONNECT ON DATABASE %I TO asclepia_app', current_database()) \gexec

REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO asclepia_app;

-- Tables created later by this owner (migrations) get DML grants automatically.
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO asclepia_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO asclepia_app;
-- Tables that already exist.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO asclepia_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO asclepia_app;

-- Re-run after every `prisma migrate deploy`: the grants above would otherwise hand these back.
DO $$
BEGIN
  -- Migration bookkeeping is the owner's business.
  IF to_regclass('public."_prisma_migrations"') IS NOT NULL THEN
    REVOKE ALL ON TABLE "_prisma_migrations" FROM asclepia_app;
  END IF;
  -- Audit is append-only (R5). The migration also revokes this and adds a trigger.
  IF to_regclass('public."AuditLog"') IS NOT NULL THEN
    REVOKE UPDATE, DELETE, TRUNCATE ON TABLE "AuditLog" FROM asclepia_app;
  END IF;
END $$;
