-- 002_meetings.sql
-- Meetings mini-app schema (Recall.ai bot + transcript ingest + local-agent action log).
-- Additive — safe to run on existing tenants. No RLS (per-tenant DB; ownership enforced at API layer).

CREATE TABLE IF NOT EXISTS meetings (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  meeting_url TEXT NOT NULL,
  bot_id TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  summary TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meetings_bot_id ON meetings(bot_id);
CREATE INDEX IF NOT EXISTS idx_meetings_status_created ON meetings(status, created_at DESC);

CREATE TABLE IF NOT EXISTS meeting_transcript (
  id BIGSERIAL PRIMARY KEY,
  meeting_id BIGINT REFERENCES meetings(id) ON DELETE CASCADE,
  bot_id TEXT NOT NULL,
  speaker_name TEXT,
  speaker_id TEXT,
  is_host BOOLEAN,
  words TEXT NOT NULL,
  start_ts NUMERIC,
  end_ts NUMERIC,
  event_type TEXT,
  raw JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transcript_bot_created ON meeting_transcript(bot_id, created_at);
CREATE INDEX IF NOT EXISTS idx_transcript_meeting_created ON meeting_transcript(meeting_id, created_at);

CREATE TABLE IF NOT EXISTS meeting_actions (
  id BIGSERIAL PRIMARY KEY,
  meeting_id BIGINT REFERENCES meetings(id) ON DELETE CASCADE,
  cycle_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  content TEXT,
  audio_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (meeting_id, cycle_id)
);

CREATE INDEX IF NOT EXISTS idx_actions_meeting_created ON meeting_actions(meeting_id, created_at);
