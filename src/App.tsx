import { useEffect } from "react";
import { AuthKitProvider, useAuth } from "@workos-inc/authkit-react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { HashRouter } from "react-router-dom";
import { CRM } from "./components/atomic-crm/root/CRM";
import { VoiceChannelProvider } from "./components/voice/VoiceChannelProvider";
import { AutoplayManager } from "./components/voice/AutoplayManager";
import { getTenantIdentity } from "./lib/tenant";
import { useApi } from "./lib/api";

// One shared QueryClient per session. Used by the data hooks
// (src/components/data/*) and the KB renderer (src/components/kb/*).
// staleTime 30s matches hook defaults; refetchOnWindowFocus off avoids noisy
// reloads on tab-switch during long sessions.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

const workosClientId = import.meta.env.VITE_WORKOS_CLIENT_ID as string | undefined;

if (!workosClientId) {
  console.warn(
    "[dashboard] VITE_WORKOS_CLIENT_ID is not set — auth will not work",
  );
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
  const { isLoading, user, signIn } = useAuth();
  const { displayName: tenantDisplayName } = getTenantIdentity();

  // Set the document title once we know the tenant. Replaces the static
  // index.html title ("MyJarvis Dashboard") with "<Tenant> Dashboard".
  useEffect(() => {
    document.title = `${tenantDisplayName} Dashboard`;
  }, [tenantDisplayName]);

  if (isLoading) {
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
            onClick={() => signIn()}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  // User is signed in — now check that they have access to THIS tenant.
  return <TenantAccessGate tenantDisplayName={tenantDisplayName} />;
}

/**
 * Gates the dashboard on a live admin-db check. Every sign-in hits
 * /api/me/access once (cached 60s by react-query). 403 → deny screen;
 * network/500 → retry with exponential backoff; 200 → render the dashboard.
 *
 * Why server-side + runtime-checked (not a Vercel-style build-time env
 * check): tenants' membership can change (admin grants, owner transfer,
 * revocation). A client-side constant would need a redeploy per change.
 */
function TenantAccessGate({ tenantDisplayName }: { tenantDisplayName: string }) {
  const api = useApi();
  const { signOut } = useAuth();

  const { data, isLoading, error } = useQuery<{ access: boolean; role?: string }>({
    queryKey: ["me", "access"],
    queryFn: async () => {
      const res = await api("/api/me/access");
      if (res.status === 403) {
        return { access: false };
      }
      if (!res.ok) {
        throw new Error(`/api/me/access → ${res.status}`);
      }
      return (await res.json()) as { access: boolean; role?: string };
    },
    staleTime: 60_000,
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Checking access…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 rounded-xl border bg-card px-8 py-10 shadow-sm max-w-md">
          <h1 className="text-lg font-semibold">Couldn't verify access</h1>
          <p className="text-center text-sm text-muted-foreground">
            Network or server error while checking your access to {tenantDisplayName}. Please retry.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data?.access) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 rounded-xl border bg-card px-8 py-10 shadow-sm max-w-md">
          <h1 className="text-lg font-semibold">No access to {tenantDisplayName}</h1>
          <p className="text-center text-sm text-muted-foreground">
            You're signed in, but this account isn't a member of {tenantDisplayName}'s dashboard. Ask the
            owner to invite you, or sign in with a different account.
          </p>
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
    // HashRouter (not BrowserRouter) — works on any static host without a SPA
    // fallback config on Cloudflare Pages. Bookmarks survive deploys.
    <HashRouter>
      <VoiceChannelProvider>
        <AutoplayManager />
        <CRM />
      </VoiceChannelProvider>
    </HashRouter>
  );
}

const App = () => (
  <AuthKitProvider
    clientId={workosClientId ?? ""}
    devMode
    onRefreshFailure={({ signIn }) => signIn()}
  >
    <QueryClientProvider client={queryClient}>
      <AuthGate />
    </QueryClientProvider>
  </AuthKitProvider>
);

export default App;
