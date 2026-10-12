#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
hdx_sql_container="hdx-sql-check-$$"
hdx_postgres_image="postgres:17-alpine@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24"
trap 'docker rm -f "$hdx_sql_container" >/dev/null 2>&1 || true' EXIT
docker run --detach --name "$hdx_sql_container" --network none -e POSTGRES_HOST_AUTH_METHOD=trust "$hdx_postgres_image" >/dev/null
hdx_ready=false
for attempt in {1..100}; do
  if docker logs "$hdx_sql_container" 2>&1 | rg -q 'PostgreSQL init process complete' && docker exec "$hdx_sql_container" pg_isready -U postgres >/dev/null 2>&1; then hdx_ready=true; break; fi
  sleep 0.3
done
if [[ "$hdx_ready" != true ]]; then echo 'PostgreSQL did not become ready' >&2; exit 1; fi
docker exec -i "$hdx_sql_container" psql -U postgres -v ON_ERROR_STOP=1 <<'SQL'
create role anon;
create role authenticated;
create role service_role bypassrls;
create schema storage;
create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
SQL
docker exec -i "$hdx_sql_container" psql -U postgres -v ON_ERROR_STOP=1 < supabase/migrations/202610120001_hedoix.sql
# A second execution checks repeatability without creating duplicate triggers/buckets.
docker exec -i "$hdx_sql_container" psql -U postgres -v ON_ERROR_STOP=1 < supabase/migrations/202610120001_hedoix.sql
docker exec -i "$hdx_sql_container" psql -U postgres -v ON_ERROR_STOP=1 < supabase/tests/schema.sql
echo 'Supabase SQL checks passed on isolated PostgreSQL 17'
