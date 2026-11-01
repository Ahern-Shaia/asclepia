#!/bin/sh
# docker-entrypoint-initdb.d hook: runs once, on an empty data directory.
set -eu
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v app_password="$DB_APP_PASSWORD" -f /sql/roles.sql
