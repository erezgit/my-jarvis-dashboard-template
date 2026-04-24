-- Lilach dashboard — initial schema
-- Applied via: psql "$NEON_DATABASE_URL" -f sql/001_init.sql
-- Idempotent: safe to re-run.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── clients ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  phone       TEXT,
  email       TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS clients_created_at_idx ON clients (created_at DESC);

-- ── sessions ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID        NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  scheduled_at  TIMESTAMPTZ NOT NULL,
  summary       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sessions_client_idx     ON sessions (client_id);
CREATE INDEX IF NOT EXISTS sessions_scheduled_idx  ON sessions (scheduled_at DESC);

-- ── work_plans ───────────────────────────────────────────────────────
-- Each client has one or more active work plans (the thing she's coaching toward).
CREATE TABLE IF NOT EXISTS work_plans (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID        NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  status      TEXT        NOT NULL DEFAULT 'active',  -- active | archived | done
  content     JSONB       NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS work_plans_client_idx ON work_plans (client_id);

-- ── coach_reflections ────────────────────────────────────────────────
-- Lilach's private coach-side reflections, per session or free-standing.
CREATE TABLE IF NOT EXISTS coach_reflections (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID        REFERENCES sessions(id) ON DELETE SET NULL,
  client_id   UUID        REFERENCES clients(id)  ON DELETE SET NULL,
  body        TEXT        NOT NULL,
  tags        TEXT[]      NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS coach_reflections_session_idx ON coach_reflections (session_id);
CREATE INDEX IF NOT EXISTS coach_reflections_client_idx  ON coach_reflections (client_id);

-- ── methodology_cards ────────────────────────────────────────────────
-- The cards that make up Lilach's method — reusable across clients.
CREATE TABLE IF NOT EXISTS methodology_cards (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT        NOT NULL,
  kind        TEXT        NOT NULL DEFAULT 'principle', -- principle | exercise | metaphor | story
  body        TEXT,
  tags        TEXT[]      NOT NULL DEFAULT '{}',
  source_path TEXT,                                -- original markdown path, if imported
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS methodology_cards_kind_idx ON methodology_cards (kind);

-- ── content_items ────────────────────────────────────────────────────
-- Drafts, posts, carousels — anything that goes out the door.
CREATE TABLE IF NOT EXISTS content_items (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT,
  kind        TEXT        NOT NULL DEFAULT 'draft',   -- draft | instagram_post | carousel | newsletter
  status      TEXT        NOT NULL DEFAULT 'draft',   -- draft | scheduled | published | archived
  body        TEXT,
  media       JSONB       NOT NULL DEFAULT '[]'::jsonb,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS content_items_status_idx ON content_items (status);

-- ── updated_at auto-bump (simple trigger for tables that have it) ────
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
  FOR t IN SELECT unnest(ARRAY['clients', 'sessions', 'work_plans', 'methodology_cards', 'content_items']) LOOP
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
