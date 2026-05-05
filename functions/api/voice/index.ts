import type { PagesFunction, R2Bucket, DurableObjectNamespace } from "@cloudflare/workers-types";
import { getDb } from "../../_lib/db";
import { json, type Env as AuthEnv } from "../../_lib/auth";

// This env interface extends the base AuthEnv (which owns DATABASE_URL +
// WORKOS_CLIENT_ID) with the voice-specific bindings. We don't re-export
// it from _lib/auth because those bindings only exist on routes that
// touch audio — keeps the base env minimal.
interface Env extends AuthEnv {
  VOICE_API_KEY: string;
  VOICE_BUCKET: R2Bucket;
  VOICE_CHANNEL: DurableObjectNamespace;
  // Public base URL for the R2 bucket (set as a Pages var once the bucket
  // has a public .r2.dev subdomain or a custom domain). Falls back to the
  // account-scoped public URL Cloudflare auto-provisions when the bucket
  // goes public.
  VOICE_PUBLIC_URL?: string;
  // Self-hosted TTS gateway — Kokoro container behind my-jarvis-tts-worker.
  // Worker is bearer-authed; dashboard owns the shared key as a Pages secret.
  TTS_WORKER_URL: string;
  TTS_WORKER_KEY: string;
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

// Public voice contract. Six OpenAI strings are kept for back-compat with
// Algorithm.md and any existing MCP callers; the five Kokoro IDs let modern
// callers address persona voices directly. Anything outside this set falls
// back to DEFAULT_VOICE.
const ALLOWED_VOICES = new Set([
  // OpenAI legacy strings
  "alloy",
  "echo",
  "fable",
  "onyx",
  "nova",
  "shimmer",
  // Kokoro persona IDs
  "am_echo",   // Jarvis
  "am_onyx",   // Atlas
  "bm_fable",  // Ben
  "af_nova",   // Nova
  "bf_emma",   // Emma
  "af_aoede",  // Iris
  "af_heart",  // Top-quality female (used as default for shimmer fallback)
]);

const DEFAULT_VOICE = "echo";

// OpenAI voice → Kokoro voice ID. Persona mapping locked here so the
// dashboard is the source of truth — callers don't have to know which
// stack is behind the curtain. Direct Kokoro IDs pass through unchanged
// (the lookup just returns the input if it's not in this map).
const OPENAI_TO_KOKORO: Record<string, string> = {
  alloy: "bf_emma",   // Emma
  echo: "am_echo",    // Jarvis (default)
  fable: "bm_fable",  // Ben
  onyx: "am_onyx",    // Atlas
  nova: "af_nova",    // Nova
  shimmer: "af_aoede",// Iris
};

function resolveKokoroVoice(input: string): string {
  return OPENAI_TO_KOKORO[input] ?? input;
}

// Hebrew unicode block — Kokoro v1.0 has no Hebrew model and produces
// garbage on these inputs. Reject before the worker call so we don't burn
// container CPU on it.
const HEBREW_RE = /[֐-׿יִ-ﭏ]/;

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
 *   3. Kokoro TTS via my-jarvis-tts-worker → wav bytes
 *   4. R2 upload at voice/{user_id}/{ts}-{uuid}.wav
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

  const voiceRaw = typeof body.voice === "string" ? body.voice : DEFAULT_VOICE;
  const voice = ALLOWED_VOICES.has(voiceRaw) ? voiceRaw : DEFAULT_VOICE;
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

  // --- TTS — Kokoro via my-jarvis-tts-worker ---
  if (!env.TTS_WORKER_URL || !env.TTS_WORKER_KEY) {
    return json(
      { error: "server misconfigured: TTS_WORKER_URL/KEY missing" },
      { status: 500 },
    );
  }
  if (HEBREW_RE.test(text)) {
    return json(
      { error: "language_not_supported", detail: "Kokoro v1.0 has no Hebrew voice." },
      { status: 422 },
    );
  }
  const kokoroVoice = resolveKokoroVoice(voice);
  const ttsResp = await fetch(`${env.TTS_WORKER_URL.replace(/\/$/, "")}/synthesize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.TTS_WORKER_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, voice: kokoroVoice }),
  });
  if (!ttsResp.ok) {
    const details = await ttsResp.text().catch(() => "");
    return json({ error: "tts failed", status: ttsResp.status, details }, { status: 502 });
  }
  const audioBuf: ArrayBuffer = await ttsResp.arrayBuffer();
  const audioMime = "audio/wav";
  const audioExt = "wav";
  // Kokoro emits WAV PCM_16 mono 24 kHz → 24000 samples × 2 bytes = 48000
  // bytes/sec. 44 bytes of RIFF header trimmed before the divide for a
  // tighter estimate; clamped at 1s minimum.
  const audioBytes = Math.max(0, audioBuf.byteLength - 44);
  const durationSeconds = Math.max(1, Math.round(audioBytes / 48000));

  // --- R2 upload ---
  const ts = Date.now();
  const rand = crypto.randomUUID().slice(0, 8);
  const key = `voice/${userId}/${ts}-${rand}.${audioExt}`;
  await env.VOICE_BUCKET.put(key, audioBuf, {
    httpMetadata: { contentType: audioMime },
  });

  const publicBase = (env.VOICE_PUBLIC_URL ?? "").replace(/\/$/, "");
  if (!publicBase) {
    return json(
      { error: "VOICE_PUBLIC_URL not configured — set bucket public URL on Pages project" },
      { status: 500 },
    );
  }
  const audioUrl = `${publicBase}/${key}`;
  const duration = durationSeconds;

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
