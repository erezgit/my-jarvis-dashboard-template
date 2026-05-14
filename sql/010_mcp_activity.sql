-- 010_mcp_activity.sql — migrate mcp_activity feed off legacy Supabase to Neon.
--
-- Schema mirrors the legacy Supabase table 1:1 so MCPActivityPage and the MCP
-- audit POST can swap endpoints without touching shape.

CREATE TABLE IF NOT EXISTS mcp_activity (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       text NOT NULL,
  user_id         text,
  op_type         text NOT NULL CHECK (op_type IN (
    'write_file', 'push_files', 'ship', 'apply_migration',
    'query_db', 'destructive_push', 'delete_file', 'upload_asset'
  )),
  status          text NOT NULL CHECK (status IN ('success', 'failed', 'escalated')),
  payload         jsonb NOT NULL DEFAULT '{}'::jsonb,
  result          jsonb,
  duration_ms     integer,
  mcp_session_id  text,
  chat_id         text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mcp_activity_tenant_created_idx
  ON mcp_activity (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS mcp_activity_status_idx
  ON mcp_activity (status) WHERE status IN ('failed', 'escalated');
