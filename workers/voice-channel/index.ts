import type {
  DurableObjectNamespace,
  DurableObjectState,
} from "@cloudflare/workers-types";

interface Env {
  VOICE_CHANNEL: DurableObjectNamespace;
}

/**
 * VoiceChannel — one instance per user, keyed by `voice:{user_id}`.
 *
 * - POST /notify:  body is the freshly-inserted voice_samples row. We
 *                  JSON-stringify and broadcast to every attached WS client.
 * - GET  /ws:      WebSocket upgrade — adds the socket to the broadcast set
 *                  and holds it until the client disconnects.
 *
 * We don't use CF's Hibernatable WebSockets API yet — the feed is low
 * throughput (tens of messages/day per user) so the simpler Set<WebSocket>
 * approach is cheaper to reason about. Can revisit if the concurrent
 * connection count ever matters.
 */
export class VoiceChannel {
  private sockets = new Set<WebSocket>();

  constructor(_state: DurableObjectState, _env: Env) {
    // state is reserved for when we add storage-backed features (e.g.
    // persistent last-seen cursor for replay-on-reconnect). Unused today.
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/ws" && request.headers.get("Upgrade") === "websocket") {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair) as [WebSocket, WebSocket];
      server.accept();
      this.sockets.add(server);

      const drop = () => {
        this.sockets.delete(server);
        try { server.close(); } catch { /* ignore */ }
      };
      server.addEventListener("close", drop);
      server.addEventListener("error", drop);

      // Minimal hello so the client can confirm the channel is open.
      try {
        server.send(JSON.stringify({ type: "hello", ts: Date.now() }));
      } catch { /* ignore */ }

      return new Response(null, { status: 101, webSocket: client });
    }

    if (url.pathname === "/notify" && request.method === "POST") {
      let payload: unknown;
      try {
        payload = await request.json();
      } catch {
        return new Response("invalid json", { status: 400 });
      }
      const frame = JSON.stringify({ type: "sample", data: payload });
      let delivered = 0;
      for (const sock of this.sockets) {
        try {
          sock.send(frame);
          delivered++;
        } catch {
          this.sockets.delete(sock);
        }
      }
      return new Response(JSON.stringify({ delivered }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("not found", { status: 404 });
  }
}

// The Worker's default export is a no-op — the DO class is the entire
// surface. CF still requires a default export for the Worker to deploy.
export default {
  async fetch(): Promise<Response> {
    return new Response(
      "voice-channel — access via DO namespace only",
      { status: 410 },
    );
  },
};
