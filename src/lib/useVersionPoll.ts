import { useEffect, useRef } from "react";

const POLL_INTERVAL_MS = 60_000;

/**
 * Polling fallback for the realtime "deploy" broadcast over the voice WS.
 *
 * The primary path is push: the shared my-jarvis-voice-channel Worker receives
 * a Cloudflare Notifications webhook on every deploy and fans out a
 * { type: "deploy" } frame to every user's VoiceChannel DO. The frontend
 * receives it on the existing WS and calls window.location.reload().
 * Latency: 1-6s.
 *
 * This poll catches everything the push path misses — WS dropped, broadcast
 * lost, Notifications webhook failed, Worker outage. Detection latency: 60s.
 *
 * Visibility-aware: pause polling when the tab is hidden (battery + bandwidth
 * on background tabs); fire one immediate check on visibilitychange when the
 * tab returns, so a backgrounded tab catches the deploy on resume.
 */
export function useVersionPoll() {
  const bootSha = useRef<string | null>(null);

  useEffect(() => {
    let timer: number | null = null;
    let cancelled = false;

    const check = async () => {
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const body = (await res.json()) as { sha?: string };
        const sha = body.sha;
        if (!sha || sha === "unknown") return;
        if (bootSha.current === null) {
          // First successful poll — record the SHA we booted with.
          bootSha.current = sha;
          return;
        }
        if (sha !== bootSha.current) {
          window.location.reload();
        }
      } catch {
        // Transient network errors are silent — next tick will retry, or
        // the realtime broadcast will deliver the deploy event first.
      }
    };

    const start = () => {
      if (timer !== null) return;
      void check();
      timer = window.setInterval(check, POLL_INTERVAL_MS);
    };
    const stop = () => {
      if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        void check();
        start();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    if (!document.hidden) start();

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, []);
}
