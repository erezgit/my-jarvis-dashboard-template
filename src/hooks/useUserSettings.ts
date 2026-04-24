import { useCallback, useEffect, useState } from "react";
import { useApi } from "@/lib/api";

export type UserSettings = {
  voice_autoplay?: boolean;
};

const DEFAULTS: Required<UserSettings> = {
  voice_autoplay: false,
};

/**
 * Loads the authed user's settings blob on mount and exposes an optimistic
 * `update(patch)` that PATCHes /api/settings. Network failures leave the
 * optimistic value applied — server is source of truth, but we don't block
 * UI on the round-trip.
 */
export function useUserSettings() {
  const api = useApi();
  const [settings, setSettings] = useState<UserSettings>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api("/api/settings");
        if (!res.ok) return;
        const body = (await res.json()) as { data?: UserSettings };
        if (!cancelled) setSettings(body.data ?? {});
      } catch {
        // Network or auth hiccup — leave defaults.
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // api closure is recreated each render; depending on it here would refetch
    // on every parent re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = useCallback(
    async (patch: UserSettings) => {
      setSettings((prev) => ({ ...prev, ...patch }));
      try {
        const res = await api("/api/settings", {
          method: "PATCH",
          body: JSON.stringify(patch),
        });
        if (!res.ok) return;
        const body = (await res.json()) as { data?: UserSettings };
        if (body.data) setSettings(body.data);
      } catch {
        // Optimistic value already applied; swallow.
      }
    },
    [api],
  );

  return { settings: { ...DEFAULTS, ...settings }, loaded, update };
}
