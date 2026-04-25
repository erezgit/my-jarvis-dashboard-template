import { useEffect, useState } from "react";
import { AuthKitProvider, useAuth } from "@workos-inc/authkit-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter } from "react-router-dom";
import { CRM } from "./components/atomic-crm/root/CRM";
import { VoiceChannelProvider } from "./components/voice/VoiceChannelProvider";
import { AutoplayManager } from "./components/voice/AutoplayManager";
import { ChunkErrorBoundary } from "./components/ChunkErrorBoundary";
import { useVersionPoll } from "./lib/useVersionPoll";
import { getTenantIdentity } from "./lib/tenant";

// Canonical multi-tenant pattern (per WorkOS docs + Cloudflare Pages best practice):
//   - VITE_WORKOS_CLIENT_ID  — shared MyJarvis AuthKit client
//   - VITE_WORKOS_ORG_ID     — THIS tenant's WorkOS Organization ID
//
// signIn() passes `organizationId` so AuthKit issues a session for that org IF the
// user is a member. WorkOS does NOT refuse the sign-in for non-members today
// (open feature request workos-node#1213) — instead it falls back to issuing a
// token for whichever org the user actually belongs to. So enforcement is the
// relying party's job, in two layers:
//
//   1. Server-side (canonical security boundary): each Pages Function verifies
//      the JWT signature against WorkOS JWKS AND that `payload.org_id` equals
//      `env.TENANT_WORKOS_ORG_ID`. Wrong org → 401, no data leaks.
//   2. Frontend (UX gate, not security): after AuthKit returns a user, decode
//      the access token and compare its `org_id` claim against this tenant's
//      `VITE_WORKOS_ORG_ID`. On mismatch, sign the user out and show a clean
//      "no access" screen instead of a broken dashboard shell where every API
//      call silently 401s.
const workosClientId = import.meta.env.VITE_WORKOS_CLIENT_ID as string | undefined;
const workosOrgId = import.meta.env.VITE_WORKOS_ORG_ID as string | undefined;

if (!workosClientId) {
  console.warn(
    "[dashboard] VITE_WORKOS_CLIENT_ID is not set — auth will not work",
  );
}
if (!workosOrgId) {
  console.warn(
    "[dashboard] VITE_WORKOS_ORG_ID is not set — frontend org gate disabled",
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

// Decodes the JWT payload without verifying the signature. We are NOT using this
// as a security boundary — server-side `requireUser` re-verifies signature + JWKS
// + org_id. This is purely UX: read the org_id claim to decide whether to render
// the dashboard or the no-access screen.
function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const segment = token.split(".")[1];
    if (!segment) return {};
    const padded = segment.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(padded));
  } catch {
    return {};
  }
}

type AccessCheck = "pending" | "allowed" | "denied";

// Mounts the version-polling fallback that catches deploys whenever the
// realtime "deploy" broadcast over the voice WS is missed (WS dropped,
// Notifications webhook failed, Worker outage). Renders nothing.
function VersionPollMount() {
  useVersionPoll();
  return null;
}

// Client-side OAuth PKCE is handled inside AuthKitProvider. The redirect-URI the
// SDK sends users back to is the current origin (configured in the WorkOS dashboard).
// While the user is on that callback URL, the SDK intercepts `?code=…` + `?state=…`,
// exchanges for tokens, and hydrates useAuth() — we don't need a custom route.
//
// `devMode` is a misnomer in the SDK: it just tells AuthKit to persist tokens in
// localStorage instead of relying on cookies set by api.workos.com. Browsers block
// those cross-origin cookies as third-party now (Chrome, Safari, Firefox), which
// kills session persistence on reload. Our dashboards are per-user isolated
// environments (own Pages site, own repo, own Neon DB), so localStorage is the
// right-sized trade-off — no shared blast radius, no BFF overhead to maintain.
function AuthGate() {
  const { isLoading, user, signIn, signOut, getAccessToken } = useAuth();
  const { displayName: tenantDisplayName } = getTenantIdentity();
  const [accessCheck, setAccessCheck] = useState<AccessCheck>("pending");
  const [tokenOrgId, setTokenOrgId] = useState<string | null>(null);

  useEffect(() => {
    document.title = `${tenantDisplayName} Dashboard`;
  }, [tenantDisplayName]);

  useEffect(() => {
    if (!user) {
      setAccessCheck("pending");
      setTokenOrgId(null);
      return;
    }
    if (!workosOrgId) {
      // Tenant org not configured — fall back to "allowed" so the legacy /
      // un-bound deployment still works. Server-side check is still the source
      // of truth for actual data access.
      setAccessCheck("allowed");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const token = await getAccessToken();
        if (cancelled) return;
        if (!token) {
          setAccessCheck("denied");
          return;
        }
        const payload = decodeJwtPayload(token);
        const orgId = typeof payload.org_id === "string" ? payload.org_id : null;
        setTokenOrgId(orgId);
        setAccessCheck(orgId === workosOrgId ? "allowed" : "denied");
      } catch {
        if (!cancelled) setAccessCheck("denied");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, getAccessToken]);

  if (isLoading || (user && accessCheck === "pending")) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 rounded-xl border bg-card px-8 py-10 shadow-sm">
          <h1 className="text-lg font-semibold">
            Welcome to {tenantDisplayName}
          </h1>
          <p className="max-w-xs text-center text-sm text-muted-foreground">
            Sign in to access your dashboard.
          </p>
          <button
            type="button"
            onClick={() =>
              signIn(workosOrgId ? { organizationId: workosOrgId } : undefined)
            }
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  if (accessCheck === "denied") {
    const userEmail = (user as { email?: string }).email ?? "your account";
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-4">
        <div className="flex max-w-md flex-col items-center gap-4 rounded-xl border bg-card px-8 py-10 text-center shadow-sm">
          <h1 className="text-lg font-semibold">
            No access to {tenantDisplayName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {userEmail} isn't a member of this workspace. Sign out and use an
            account that has access, or ask the workspace admin for an invite.
          </p>
          {tokenOrgId && (
            <p className="text-xs text-muted-foreground/70">
              Signed in to a different organization.
            </p>
          )}
          <button
            type="button"
            onClick={() => signOut()}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <ChunkErrorBoundary>
      <HashRouter>
        <VoiceChannelProvider>
          <AutoplayManager />
          <VersionPollMount />
          <CRM />
        </VoiceChannelProvider>
      </HashRouter>
    </ChunkErrorBoundary>
  );
}

const App = () => (
  <AuthKitProvider
    clientId={workosClientId ?? ""}
    devMode
    onRefreshFailure={({ signIn }) =>
      signIn(workosOrgId ? { organizationId: workosOrgId } : undefined)
    }
  >
    <QueryClientProvider client={queryClient}>
      <AuthGate />
    </QueryClientProvider>
  </AuthKitProvider>
);

export default App;
