import { AuthKitProvider, useAuth } from "@workos-inc/authkit-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter } from "react-router-dom";
import { CRM } from "./components/atomic-crm/root/CRM";
import { VoiceChannelProvider } from "./components/voice/VoiceChannelProvider";
import { AutoplayManager } from "./components/voice/AutoplayManager";

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
          <h1 className="text-lg font-semibold">Welcome</h1>
          <p className="max-w-xs text-center text-sm text-muted-foreground">
            Sign in with your Google account via WorkOS.
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
