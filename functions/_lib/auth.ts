import { createRemoteJWKSet, jwtVerify } from "jose";

export interface Env {
  DATABASE_URL: string;
  WORKOS_CLIENT_ID: string;
}

export type AuthedUser = {
  userId: string;
  sessionId: string | null;
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
 * Verifies the incoming WorkOS-issued access token from `Authorization: Bearer <token>`.
 * Uses JWKS fetched lazily from WorkOS; `jose` handles caching + key rotation.
 *
 * Returns { userId } on success, throws Response(401) on failure.
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

  try {
    const { payload } = await jwtVerify(token, getJwks(env), {
      issuer: `https://api.workos.com/user_management/${env.WORKOS_CLIENT_ID}`,
    });

    const userId = (payload.sub ?? "") as string;
    if (!userId) throw unauthorized("token missing sub");

    return {
      userId,
      sessionId: (payload.sid ?? null) as string | null,
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
