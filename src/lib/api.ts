import { useAuth } from "@workos-inc/authkit-react";

/**
 * Hook that returns an authed fetch — wraps window.fetch, injecting the
 * current WorkOS access token as `Authorization: Bearer <jwt>`.
 *
 * Usage:
 *   const api = useApi();
 *   const res = await api("/api/clients", { method: "GET" });
 */
export function useApi() {
  const { getAccessToken } = useAuth();

  return async function apiFetch(
    input: string,
    init: RequestInit = {},
  ): Promise<Response> {
    let token: string | null = null;
    try {
      token = await getAccessToken();
    } catch {
      // Not signed in (or token refresh failed) — fall through unauthenticated.
      // The server-side requireUser will return 401 and the UI can re-prompt.
    }

    const headers = new Headers(init.headers ?? {});
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return fetch(input, { ...init, headers });
  };
}
