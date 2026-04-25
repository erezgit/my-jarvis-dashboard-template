import type { PagesFunction } from "@cloudflare/workers-types";

interface Env {
  CF_PAGES_COMMIT_SHA?: string;
}

/**
 * GET /api/version
 *
 * Returns the commit SHA of the deployment serving this request. Frontend
 * polls every 60s as a fallback for the realtime "deploy" broadcast that
 * arrives over the voice WebSocket. If the WS dropped or the broadcast was
 * missed, the poll catches the new SHA within 60s and reloads.
 *
 * CF_PAGES_COMMIT_SHA is set by Cloudflare Pages at build time and snapshotted
 * into the deployment env. At runtime it reflects the deployment serving the
 * request — not the latest commit on main — which is exactly what we want for
 * detecting "there's a newer deploy than the one I booted with."
 */
export const onRequest: PagesFunction<Env> = ({ env }) => {
  return new Response(
    JSON.stringify({ sha: env.CF_PAGES_COMMIT_SHA ?? "unknown" }),
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    },
  );
};
