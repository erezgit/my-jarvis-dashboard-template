import { useCallback, useEffect, useState } from "react";
import { useApi } from "@/lib/api";

export type UserSettings = {
  voice_autoplay?: boolean;
};

// Defaults applied at READ time only (merged into the returned settings).
// `voice_autoplay: true` matches the historical Layout behavior — voice
// panel opens by default for new users; turning the toggle off in
// /settings persists `false` to Neon.
const DEFAULTS: Required<UserSettings> = {
  voice_autoplay: true,
};

// localStorage key for the per-user settings cache. Cleared on sign-out
// would be ideal, but in practice WorkOS sign-out reloads the page and
// the next user's first read will overwrite this anyway.
const STORAGE_KEY = "myjarvis.user_settings";

/**
 * Read cached settings from localStorage. Synchronous — used as the
 * lazy initial state for `useState`, so first paint already reflects
 * the user's preference (no flicker between optimistic default and the
 * async DB load). DB is canonical; cache is for first-paint speed.
 */
function readCache(): UserSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as UserSettings)
      : {};
  } catch {
    return {};
  }
}

function writeCache(s: UserSettings): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // Quota / private-mode disabled — non-fatal.
  }
}

/**
 * Loads the authed user's settings blob on mount and exposes an optimistic
 * `update(patch)` that PATCHes /api/settings. Settings are mirrored to
 * localStorage so the next page load reflects the saved preference at
 * the very first paint, without waiting on the network round-trip.
 *
 * Flow:
 *   1. First paint — `settings` initializes synchronously from
 *      localStorage cache. Components reading the hook get the correct
 *      value with no async gap.
 *   2. Mount — fetch `/api/settings` from Neon (canonical source).
 *      On success, refresh both state and cache.
 *   3. update() — apply patch optimistically to state + cache, then
 *      PATCH the server. Server response replaces both on success.
 */
export function useUserSettings() {
  const api = useApi();
  const [settings, setSettings] = useState<UserSettings>(() => readCache());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api("/api/settings");
        if (!res.ok) return;
        const body = (await res.json()) as { data?: UserSettings };
        const fresh = body.data ?? {};
        if (!cancelled) {
          setSettings(fresh);
          writeCache(fresh);
        }
      } catch {
        // Network or auth hiccup — leave cached value applied.
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // api closure is recreated each render; depending on it here would
    // refetch on every parent re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = useCallback(
    async (patch: UserSettings) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        writeCache(next);
        return next;
      });
      try {
        const res = await api("/api/settings", {
          method: "PATCH",
          body: JSON.stringify(patch),
        });
        if (!res.ok) return;
        const body = (await res.json()) as { data?: UserSettings };
        if (body.data) {
          setSettings(body.data);
          writeCache(body.data);
        }
      } catch {
        // Optimistic state + cache already applied; swallow.
      }
    },
    [api],
  );

  return { settings: { ...DEFAULTS, ...settings }, loaded, update };
}
