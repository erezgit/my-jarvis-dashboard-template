/**
 * ra-core compatibility wrappers.
 *
 * Pages imported from Daniel / Flame King / OS-merged that were originally
 * written against `ra-core`'s `useGetIdentity()` / `useLogout()` can be
 * ported with a single-line import swap:
 *
 *   - from "ra-core"                 → from "@/components/auth"
 *
 * No per-page rewiring required. Callers get the ra-core-shaped return values
 * they expect: `{ data, isLoading, error }` and a bare `() => void`.
 */
import { useAuth } from "./useAuth";

/**
 * ra-core's useGetIdentity returns `{ data, isLoading, error, refetch?, ... }`.
 * `error` is always `undefined` here (WorkOS AuthKit handles errors internally
 * via `onRefreshFailure` in App.tsx). `refetch` is intentionally omitted until
 * a page actually needs it — don't speculate on surface area.
 */
export function useGetIdentity() {
  const { identity, isLoading } = useAuth();
  return { data: identity, isLoading, error: undefined };
}

export function useLogout() {
  return useAuth().logout;
}
