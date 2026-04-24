import type { PagesFunction, DurableObjectNamespace } from "@cloudflare/workers-types";
import { requireUser, type Env as AuthEnv } from "../../_lib/auth";

interface Env extends AuthEnv {
  VOICE_CHANNEL: DurableObjectNamespace;
}

/**
 * GET /api/voice/stream
 *
 * WebSocket upgrade. We authenticate the WS handshake via the same WorkOS
 * bearer as the feed endpoint — AuthKit exposes getAccessToken() which the
 * frontend injects as ?token=... (native WebSocket APIs don't carry custom
 * headers so a query-param is the standard workaround). Once authed, we
 * forward the upgrade to the user's VoiceChannel DO instance.
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket upgrade", { status: 426 });
  }

  // Pull the bearer from ?token=... and re-inject as an Authorization header
  // so requireUser can verify it with the same JWKS path as the feed route.
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) return new Response("unauthorized: missing token", { status: 401 });

  const authedReq = new Request(request.url, {
    method: "GET",
    headers: { ...Object.fromEntries(request.headers), Authorization: `Bearer ${token}` },
  });

  let auth;
  try {
    auth = await requireUser(authedReq, env);
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }

  const id = env.VOICE_CHANNEL.idFromName(`voice:${auth.userId}`);
  const stub = env.VOICE_CHANNEL.get(id);

  // Forward the upgrade request to the DO. The DO's fetch handler returns
  // { status: 101, webSocket }, which the runtime propagates back to the
  // client — exactly the standard DO-WebSocket pattern.
  return stub.fetch("https://voice-channel/ws", request);
};
