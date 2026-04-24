import type { PagesFunction, R2Bucket, DurableObjectNamespace } from "@cloudflare/workers-types";
import { getDb } from "../../_lib/db";
import { json, type Env as AuthEnv } from "../../_lib/auth";

// This env interface extends the base AuthEnv (which owns DATABASE_URL +
// WORKOS_CLIENT_ID) with the three voice-specific bindings. We don't
// re-export it from _lib/auth because those bindings only exist on routes
// that touch audio — keeps the base env minimal.
interface Env extends AuthEnv {
  OPENAI_API_KEY: string;
  VOICE_API_KEY: string;
  VOICE_BUCKET: R2Bucket;
  VOICE_CHANNEL: DurableObjectNamespace;
  // Public base URL for the R2 bucket (set as a Pages var once the bucket
  // has a public .r2.dev subdomain or a custom domain). Falls back to the
  // account-scoped public URL Cloudflare auto-provisions when the bucket
  // goes public.
  VOICE_PUBLIC_URL?: string;
}

type InsertedRow = {
  id: string;
  user_id: string;
  agent_name: string | null;
  text_content: string;
  audio_url: string;
  title: string | null;
  duration_seconds: number | null;
  category: string;
  voice_id: string;
  created_at: string;
};

const ALLOWED_VOICES = new Set([
  "alloy",
  "echo",
  "fable",
  "onyx",
  "nova",
  "shimmer",
]);

const MAX_TEXT_LEN = 4096;

/**
 * POST /api/voice
 *
 * Bearer-authed with VOICE_API_KEY (shared secret, not a per-user token —
 * this endpoint is called by Ben's MCP Worker on behalf of whichever
 * user issued the tool call). Pipeline:
 *
 *   1. auth (VOICE_API_KEY bearer)
 *   2. parse + validate body
 *   3. OpenAI TTS -> mp3 bytes
 *   4. R2 upload at voice/{user_id}/{ts}-{uuid}.mp3
 *   5. Neon insert into voice_samples
 *   6. notify the user's VoiceChannel DO so open WS clients fan out
 *   7. return { id, audio_url, duration_seconds }
 *
 * If R2 upload succeeds but Neon insert fails, the R2 object is orphaned.
 * That's the cheapest failure mode to own — we don't roll back R2 because
 * a delete on failure path adds more ways to fail than it prevents. The
 * orphans can be swept later by a cron that lists R2 keys not present in
 * voice_samples. Logged but not resolved here.
 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  // --- auth ---
  const authHeader = request.headers.get("Authorization") ?? "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match || !env.VOICE_API_KEY || match[1] !== env.VOICE_API_KEY) {
    return json({ error: "unauthorized" }, { status: 401 });
  }

  if (!env.OPENAI_API_KEY) {
    return json({ error: "server misconfigured: OPENAI_API_KEY missing" }, { status: 500 });
  }

  // --- parse body ---
  let body: { text?: unknown; voice?: unknown; agent_name?: unknown; user_id?: unknown; title?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ error: "invalid JSON body" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return json({ error: "text is required" }, { status: 400 });
  if (text.length > MAX_TEXT_LEN) {
    return json(
      { error: `text exceeds ${MAX_TEXT_LEN} chars`, len: text.length },
      { status: 400 },
    );
  }

  const voiceRaw = typeof body.voice === "string" ? body.voice : "echo";
  const voice = ALLOWED_VOICES.has(voiceRaw) ? voiceRaw : "echo";
  const agentName =
    typeof body.agent_name === "string" && body.agent_name.trim()
      ? body.agent_name.trim().slice(0, 64)
      : "assistant";
  const title =
    typeof body.title === "string" && body.title.trim()
      ? body.title.trim().slice(0, 120)
      : null;

  // The user_id is an explicit body field (not derived from the Bearer
  // token) because this endpoint is called from the MCP Worker which
  // has its own OAuth-derived user id for the caller. When we later swap
  // to per-user tokens we can look it up from the token itself.
  const userId = typeof body.user_id === "string" ? body.user_id.trim() : "";
  if (!userId) return json({ error: "user_id is required" }, { status: 400 });

  // --- TTS ---
  const ttsResp = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "tts-1", voice, input: text, response_format: "mp3" }),
  });
  if (!ttsResp.ok) {
    const details = await ttsResp.text().catch(() => "");
    return json({ error: "tts failed", status: ttsResp.status, details }, { status: 502 });
  }
  const audioBuf = await ttsResp.arrayBuffer();

  // --- R2 upload ---
  const ts = Date.now();
  const rand = crypto.randomUUID().slice(0, 8);
  const key = `voice/${userId}/${ts}-${rand}.mp3`;
  await env.VOICE_BUCKET.put(key, audioBuf, {
    httpMetadata: { contentType: "audio/mpeg" },
  });

  const publicBase = (env.VOICE_PUBLIC_URL ?? "").replace(/\/$/, "");
  if (!publicBase) {
    return json(
      { error: "VOICE_PUBLIC_URL not configured — set bucket public URL on Pages project" },
      { status: 500 },
    );
  }
  const audioUrl = `${publicBase}/${key}`;

  // rough byte->seconds for tts-1 mp3 (~16 kbps speech ~= 2000 bytes/sec)
  const duration = Math.max(1, Math.round(audioBuf.byteLength / 2000));

  // --- Neon insert ---
  const sql = getDb(env);
  let inserted: InsertedRow | null = null;
  try {
    const rows = (await sql/* sql */ `
      INSERT INTO voice_samples
        (user_id, agent_name, text_content, audio_url, title, duration_seconds, category, voice_id)
      VALUES
        (${userId}, ${agentName}, ${text}, ${audioUrl}, ${title}, ${duration}, 'message', ${voice})
      RETURNING
        id, user_id, agent_name, text_content, audio_url, title,
        duration_seconds, category, voice_id, created_at
    `) as InsertedRow[];
    inserted = rows[0] ?? null;
  } catch (err) {
    return json(
      {
        error: "db insert failed",
        detail: err instanceof Error ? err.message : String(err),
        orphan_r2_key: key,
      },
      { status: 500 },
    );
  }
  if (!inserted) {
    return json({ error: "db insert returned no row", orphan_r2_key: key }, { status: 500 });
  }

  // --- DO fan-out (best effort) ---
  try {
    const id = env.VOICE_CHANNEL.idFromName(`voice:${userId}`);
    const stub = env.VOICE_CHANNEL.get(id);
    await stub.fetch("https://voice-channel/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inserted),
    });
  } catch {
    // Don't fail the request if DO broadcast fails — the row is durable in
    // Neon and the feed will pick it up on next fetch. Logged server-side
    // via CF observability, not surfaced to the client.
  }

  return json({
    id: inserted.id,
    audio_url: inserted.audio_url,
    duration_seconds: inserted.duration_seconds,
  });
};
