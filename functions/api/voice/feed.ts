import type { PagesFunction } from "@cloudflare/workers-types";
import { getDb } from "../../_lib/db";
import { json, requireUser, type Env } from "../../_lib/auth";

type FeedRow = {
  id: string;
  agent_name: string | null;
  text_content: string;
  audio_url: string;
  title: string | null;
  duration_seconds: number | null;
  category: string;
  voice_id: string;
  created_at: string;
};

/**
 * GET /api/voice/feed
 *
 * Returns the authed user's last 50 voice samples, newest first.
 * WorkOS JWT bearer auth (the SPA's normal session token).
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  let auth;
  try {
    auth = await requireUser(request, env);
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }

  try {
    const sql = getDb(env);
    const rows = (await sql/* sql */ `
      SELECT
        id, agent_name, text_content, audio_url, title,
        duration_seconds, category, voice_id, created_at
      FROM voice_samples
      WHERE user_id = ${auth.userId}
      ORDER BY created_at DESC
      LIMIT 50
    `) as FeedRow[];
    return json(rows);
  } catch (err) {
    return json(
      {
        error: "feed fetch failed",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
};
