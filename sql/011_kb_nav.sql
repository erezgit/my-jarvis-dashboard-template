-- 011_kb_nav.sql
-- Data-driven Knowledge Base nav (MJOS-143). nav_folders = the DB analog of
-- Docusaurus _category_.json: folder chrome keyed by the stripped slug-path.
-- Per-page chrome lives on page_content.nav_* columns. Idempotent — safe to replay.

CREATE TABLE IF NOT EXISTS nav_folders (
  slug_path  text PRIMARY KEY,
  label      text NOT NULL,
  icon       text,
  sort_order integer NOT NULL DEFAULT 100
);

ALTER TABLE page_content
  ADD COLUMN IF NOT EXISTS nav_label  text,
  ADD COLUMN IF NOT EXISTS nav_icon   text,
  ADD COLUMN IF NOT EXISTS nav_order  integer,
  ADD COLUMN IF NOT EXISTS nav_hidden boolean NOT NULL DEFAULT false;
