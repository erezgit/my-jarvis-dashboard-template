# sql/ — tenant database schema

Two layers. Never mix them.

## `001_init.sql` — platform-universal

Applied to **every** new tenant's Neon project by the Provisioning Worker
(`my-jarvis-provisioning`) at step 10 (`apply_tenant_schema`).

Contains ONLY the tables every MyJarvis dashboard needs:

| Table | Used by |
|---|---|
| `user_settings` | `GET/PATCH /api/settings` |
| `voice_samples` | `POST /api/voice`, `GET /api/voice/feed` (shared voice stack) |
| `page_content` | `src/components/kb/*` via `GET /api/kb/:slug` + `GET /api/kb` |

Rule: if a table isn't needed by the voice stack, the KB renderer, or the
settings layer — it doesn't belong here.

## `sql/tenant/<slug>.sql` — per-tenant content schema

When a tenant needs their own content shape (Lilach's coaching tables,
Daniel's client roster, OS-merged's agency schema), it lives in a tenant-
specific SQL file applied alongside the tenant's data migration. NOT in
the template.

The Provisioning Worker at step 10 also optionally looks for
`sql/tenant/<slug>.sql` in the newly-forked repo and applies it after
`001_init.sql`. If the file is absent, step 10 runs platform-universal
only. Tenants who don't need extra tables skip this file entirely.

This directory ships empty intentionally — it's a convention, not a
content pool. The tenant's own repo populates it during Ship 5 migration
or when Erez sets up a fresh dashboard.

## Hard rules

1. **`user_id` columns are `TEXT`, never `UUID`.** WorkOS subjects are
   strings (`user_01XXX...`), not UUIDs. A `UUID` column silently breaks
   every row-insert from the Pages Functions. Noa caught this the
   Daniel way; it's now a template-level invariant.
2. **Everything idempotent.** `CREATE TABLE IF NOT EXISTS`,
   `CREATE INDEX IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`,
   etc. The provisioning pipeline retries on transient failures — a
   non-idempotent statement breaks re-runs.
3. **No tenant content in 001_init.sql — ever.** Lilach's `clients` /
   `sessions` / `coach_reflections` used to live here; that was a time
   bomb that came within one migration of shipping to Daniel. Schema
   shape belongs with schema data, not with the template.
