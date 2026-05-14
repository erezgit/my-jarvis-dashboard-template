import type { PagesFunction } from "@cloudflare/workers-types";
import { json, requireUser, type Env as AuthEnv } from "../../_lib/auth";

interface Env extends AuthEnv {
  MEETINGS_WORKER_URL: string;
  MEETINGS_TENANT_KEY: string;
  MEETINGS_TENANT_SLUG: string;
}

/**
 * GET /api/calendar — connection status
 * Returns: { connected: boolean, oauth_email?: string, channel_expires_at?: string }
 *
 * Proxies to worker GET /calendar/status which reads tenant DO state.
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    await requireUser(request, env);
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }

  if (!env.MEETINGS_WORKER_URL || !env.MEETINGS_TENANT_KEY || !env.MEETINGS_TENANT_SLUG) {
    return json({ error: "server misconfigured: meetings worker bindings missing" }, { status: 500 });
  }

  try {
    const workerRes = await fetch(`${env.MEETINGS_WORKER_URL}/calendar/status`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${env.MEETINGS_TENANT_KEY}`,
        "X-Tenant": env.MEETINGS_TENANT_SLUG,
      },
    });
    const body = await workerRes.json().catch(() => ({}));
    return json(body, { status: workerRes.status });
  } catch (err) {
    return json(
      {
        error: "calendar status fetch failed",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
};
