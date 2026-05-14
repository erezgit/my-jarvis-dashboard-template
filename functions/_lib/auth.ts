import { createRemoteJWKSet, jwtVerify } from "jose";

export interface Env {
  DATABASE_URL: string;
  WORKOS_CLIENT_ID: string;
  TENANT_WORKOS_ORG_ID: string;
  // Used by /api/users to list Cloudflare Pages dashboard projects.
  // Optional so other endpoints don't break when these aren't configured.
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
}

export type AuthedUser = {
  userId: string;
  sessionId: string | null;
  orgId: string;
};

// JWKS is created lazily per Pages Function isolate and caches keys.
// The WorkOS JWKS endpoint is client-scoped.
let jwksCache: ReturnType<typeof createRemoteJWKSet> | null = null;
let jwksClientId = "";

function getJwks(env: Env) {
  if (!jwksCache || jwksClientId !== env.WORKOS_CLIENT_ID) {
    jwksCache = createRemoteJWKSet(
      new URL(`https://api.workos.com/sso/jwks/${env.WORKOS_CLIENT_ID}`),
    );
    jwksClientId = env.WORKOS_CLIENT_ID;
  }
  return jwksCache;
}

/**
 * Verifies the incoming WorkOS-issued access token AND that it was issued for
 * THIS tenant's organization (canonical multi-tenant pattern per WorkOS docs).
 *
 *   1. JWT signature verified against WorkOS JWKS.
 *   2. JWT `org_id` claim must equal `env.TENANT_WORKOS_ORG_ID`.
 *
 * Step 2 is the access control. If a user is signed in to a different org's
 * dashboard, their token's `org_id` won't match and we return 401.
 *
 * Returns { userId, sessionId, orgId } on success, throws Response(401) on failure.
 */
export async function requireUser(
  request: Request,
  env: Env,
): Promise<AuthedUser> {
  const authHeader = request.headers.get("Authorization") ?? "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    throw unauthorized("missing bearer token");
  }
  const token = match[1];

  if (!env.WORKOS_CLIENT_ID) {
    throw unauthorized("server misconfigured: WORKOS_CLIENT_ID not set");
  }
  if (!env.TENANT_WORKOS_ORG_ID) {
    throw unauthorized("server misconfigured: TENANT_WORKOS_ORG_ID not set");
  }

  try {
    const { payload } = await jwtVerify(token, getJwks(env), {
      issuer: `https://api.workos.com/user_management/${env.WORKOS_CLIENT_ID}`,
    });

    const userId = (payload.sub ?? "") as string;
    if (!userId) throw unauthorized("token missing sub");

    const orgId = (payload.org_id ?? "") as string;
    if (!orgId) {
      throw unauthorized(
        "token missing org_id claim — sign-in must pass organizationId",
      );
    }
    if (orgId !== env.TENANT_WORKOS_ORG_ID) {
      throw unauthorized(
        `token org_id mismatch: expected ${env.TENANT_WORKOS_ORG_ID}, got ${orgId}`,
      );
    }

    return {
      userId,
      sessionId: (payload.sid ?? null) as string | null,
      orgId,
    };
  } catch (err) {
    if (err instanceof Response) throw err;
    throw unauthorized(
      `token verify failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

function unauthorized(reason: string): Response {
  return new Response(JSON.stringify({ error: "unauthorized", reason }), {
    status: 401,
    headers: { "content-type": "application/json" },
  });
}

/** Small helper: JSON response. */
export function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}
