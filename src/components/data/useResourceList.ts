/**
 * useResourceList — ra-core-shape list hook backed by react-query.
 *
 * Contract: GET /api/<resource> → `T[]`
 * Return:   { data, isLoading, error, refetch }
 *
 * Paired with `useResourceOne`, `useResourceCreate`, `useResourceUpdate`,
 * `useResourceDelete` — together they let ported ra-core pages call the
 * same shape without an ra-core data provider.
 */
import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";

export function useResourceList<T>(
  resource: string,
  opts?: { enabled?: boolean },
): {
  data: T[] | undefined;
  isLoading: boolean;
  error: unknown;
  refetch: () => Promise<unknown>;
} {
  const api = useApi();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [resource, "list"],
    queryFn: async (): Promise<T[]> => {
      const res = await api(`/api/${encodeURIComponent(resource)}`);
      if (!res.ok) throw new Error(`GET /api/${resource} → ${res.status}`);
      return (await res.json()) as T[];
    },
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
  return { data, isLoading, error, refetch };
}
