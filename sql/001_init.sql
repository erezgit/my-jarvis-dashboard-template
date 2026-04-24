-- MyJarvis dashboard — platform-universal initial schema.
-- Applied by the Provisioning Worker at step 10 (apply_tenant_schema) against
-- the freshly-created Neon project for every new tenant. For manual setup:
--   psql "$NEON_DATABASE_URL" -f sql/001_init.sql
-- Idempotent: safe to re-run.
--
-- WHAT LIVES HERE (and nowhere else): ONLY tables every MyJarvis dashboard
-- needs — never tenant-specific content shapes (clients, sessions, methodology,
-- products, etc.). Those belong in `sql/tenant/<slug>.sql` under the tenant's
-- OWN repo, applied alongside the tenant's data migration (Ship 5 pattern).
-- If a table is here, it must be needed by the voice stack, the KB renderer,
-- or the settings layer — the three platform-universal pillars.
--
-- WHY `user_id TEXT`: WorkOS subjects have the format `user_01XXX...`, not
-- UUIDs. A UUID column here silently breaks every row-insert from the Pages
-- Functions. We learned this the Daniel way (Noa caught it in migration).
-- Template-level rule: any user-keyed column is TEXT, not UUID. PKs + FKs
-- between platform tables stay UUID.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── user_settings ──────────────────────────────────────────────────────
-- Per-user settings blob. Readers: GET /api/settings. Writers: PATCH /api/settings
-- (upsert via `data || EXCLUDED.data`). Tenant owners keep their UI prefs here;
-- nothing-is-sensitive so a simple JSONB blob suffices.
CREATE TABLE IF NOT EXISTS user_settings (
  user_id     TEXT        PRIMARY KEY,
  data        JSONB       NOT NULL DEFAULT '{}'::jsonb,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── voice_samples ──────────────────────────────────────────────────────
-- One row per agent-voice message delivered to the user. Readers:
-- GET /api/voice/feed. Writers: POST /api/voice (with audio uploaded to
-- R2 first, URL stored here). The per-tenant R2 bucket holds the MP3s;
-- this table is the metadata index + feed source.
CREATE TABLE IF NOT EXISTS voice_samples (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           TEXT        NOT NULL,
  agent_name        TEXT        NOT NULL,
  text_content      TEXT        NOT NULL,
  audio_url         TEXT        NOT NULL,
  title             TEXT,
  duration_seconds  INT,
  category          TEXT        NOT NULL DEFAULT 'message',
  voice_id          TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS voice_samples_user_created_idx
  ON voice_samples (user_id, created_at DESC);

-- ── page_content ───────────────────────────────────────────────────────
-- KB + knowledge-base source table. Readers: src/components/kb/* via
-- GET /api/kb/:slug and GET /api/kb. Writers: migration scripts (Ship 5)
-- and eventual inline-editing hooks. `content` is a PageContent JSONB
-- with a `title` + `sections[]` shape; each section is one of 13 typed
-- variants + an unknown fallback (see src/components/kb/types.ts).
CREATE TABLE IF NOT EXISTS page_content (
  id          SERIAL      PRIMARY KEY,
  page_slug   TEXT        NOT NULL UNIQUE,
  content     JSONB       NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS page_content_updated_idx
  ON page_content (updated_at DESC);

-- ── updated_at auto-bump ───────────────────────────────────────────────
-- Simple trigger applied to every table that has an updated_at column.
-- Loop covers all three platform tables; tenant-specific tables loop
-- themselves at the bottom of `sql/tenant/<slug>.sql` when they need it.
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['user_settings', 'page_content']) LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS %I_touch_updated_at ON %I;',
      t, t
    );
    EXECUTE format(
      'CREATE TRIGGER %I_touch_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION touch_updated_at();',
      t, t
    );
  END LOOP;
END $$;
