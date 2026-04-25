import { Component, type ErrorInfo, type ReactNode } from "react";

const RELOAD_FLAG = "chunk-reload-attempted";

/**
 * Catches dynamic-import / chunk-load failures triggered when a user
 * lazy-loads a route whose hashed asset no longer exists on the CDN.
 * This happens in the brief window after a deploy where the user's old
 * SPA references chunks that the new deployment replaced.
 *
 * Strategy: one-shot reload, gated by a sessionStorage flag. If the new
 * bundle ALSO fails to load, the flag prevents an infinite reload loop —
 * we surface a manual "Reload" UI instead.
 *
 * Composes with the broader auto-refresh: the realtime broadcast and the
 * /api/version poll usually catch deploys before the user navigates. This
 * boundary is the safety net for the race-condition case.
 */
export class ChunkErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    const isChunkErr =
      /Loading chunk [\d]+ failed|ChunkLoadError|Failed to fetch dynamically imported module|Importing a module script failed/.test(
        error.message,
      );
    if (isChunkErr && !sessionStorage.getItem(RELOAD_FLAG)) {
      sessionStorage.setItem(RELOAD_FLAG, "1");
      window.location.reload();
    }
    return { hasError: true };
  }

  componentDidMount() {
    // Successful boot — clear any stale reload flag from a previous attempt.
    sessionStorage.removeItem(RELOAD_FLAG);
    window.addEventListener("vite:preloadError", this.handleViteError);
  }

  componentWillUnmount() {
    window.removeEventListener("vite:preloadError", this.handleViteError);
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (!sessionStorage.getItem(RELOAD_FLAG)) {
      console.error("[ChunkErrorBoundary] caught:", error, info);
    }
  }

  private handleViteError = (e: Event) => {
    if (sessionStorage.getItem(RELOAD_FLAG)) return;
    sessionStorage.setItem(RELOAD_FLAG, "1");
    if (typeof e.preventDefault === "function") e.preventDefault();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-4 text-center">
          <h1 className="text-lg font-semibold text-foreground">
            Something went wrong loading this page.
          </h1>
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem(RELOAD_FLAG);
              window.location.reload();
            }}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
