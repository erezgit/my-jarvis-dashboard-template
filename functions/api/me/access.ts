/**
 * GET /api/me/access
 *
 * Tenant-access gate. Looks up the authed user in admin.tenant_users for
 * THIS tenant's slug (derived from the hostname), returns:
 *
 *   200 { access: true, role: "owner" | "admin" | "member" }
 *   403 { access: false }
 *   401 if bearer token missing/invalid (from requireUser)
 *   500 if ADMIN_DATABASE_URL not configured or SQL fails
 *
 * The frontend AuthGate blocks the UI on 403 — signed-in strangers see a
 * "no access" screen instead of the dashboard shell.
 *
 * Why derive slug from hostname rather than trusting the client: this runs
 * server-side on the tenant's Pages deployment, so the hostname IS the tenant
 * identity. The hostname can't be spoofed in the request handler — CF Pages
 * routes it by project.
 */
import type { PagesFunction } from "@cloudflare/workers-types";
import { neon } from "@neondatabase/serverless";
import { requireUser, type Env as AuthEnv } from "../../_lib/auth";

interface Env extends AuthEnv {
  ADMIN_DATABASE_URL: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  let auth;
  try {
    auth = await requireUser(request, env);
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }

  if (!env.ADMIN_DATABASE_URL) {
    return new Response(
      JSON.stringify({ error: "ADMIN_DATABASE_URL not configured" }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }

  const slug = deriveTenantSlug(request);

  try {
    const sql = neon(env.ADMIN_DATABASE_URL);
    const rows = (await sql`
      SELECT role FROM admin.tenant_users
       WHERE tenant_slug = ${slug}
         AND oauth_subject = ${auth.userId}
       LIMIT 1
    `) as Array<{ role: string }>;

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ access: false, tenant_slug: slug }),
        { status: 403, headers: { "content-type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ access: true, role: rows[0]!.role, tenant_slug: slug }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "access check failed",
        detail: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }
};

/**
 * Match `my-jarvis-dashboard-{slug}.pages.dev` and preview variants like
 * `<hash>.my-jarvis-dashboard-{slug}.pages.dev`. Mirrors src/lib/tenant.ts's
 * regex so server-side and client-side derivation agree.
 */
function deriveTenantSlug(request: Request): string {
  const host = new URL(request.url).hostname;
  const match = host.match(
    /my-jarvis-dashboard-([a-z0-9][a-z0-9-]*?)(?:\.pages\.dev|\.workers\.dev|$)/i,
  );
  return match ? match[1]!.toLowerCase() : "unknown";
}
