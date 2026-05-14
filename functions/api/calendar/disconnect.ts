import type { PagesFunction } from "@cloudflare/workers-types";
import { json, requireUser, type Env as AuthEnv } from "../../_lib/auth";

interface Env extends AuthEnv {
  MEETINGS_WORKER_URL: string;
  MEETINGS_TENANT_KEY: string;
  MEETINGS_TENANT_SLUG: string;
}

/**
 * POST /api/calendar/disconnect — stops the Google push channel + clears tenant DO state.
 * Past meetings + transcripts are preserved.
 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    await requireUser(request, env);
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }

  try {
    const workerRes = await fetch(`${env.MEETINGS_WORKER_URL}/calendar/disconnect`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.MEETINGS_TENANT_KEY}`,
        "X-Tenant": env.MEETINGS_TENANT_SLUG,
        "Content-Type": "application/json",
      },
    });
    const body = await workerRes.json().catch(() => ({}));
    return json(body, { status: workerRes.status });
  } catch (err) {
    return json(
      {
        error: "calendar disconnect failed",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
};
