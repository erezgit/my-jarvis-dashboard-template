/**
 * useResourceOne — fetch a single resource row by id.
 *
 * Contract: GET /api/<resource>/<id> → `T`
 */
import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";

export function useResourceOne<T>(
  resource: string,
  id: string | number | null | undefined,
): {
  data: T | undefined;
  isLoading: boolean;
  error: unknown;
  refetch: () => Promise<unknown>;
} {
  const api = useApi();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [resource, "one", id],
    queryFn: async (): Promise<T> => {
      const res = await api(`/api/${encodeURIComponent(resource)}/${encodeURIComponent(String(id))}`);
      if (!res.ok) throw new Error(`GET /api/${resource}/${id} → ${res.status}`);
      return (await res.json()) as T;
    },
    enabled: id != null && id !== "",
    staleTime: 30_000,
  });
  return { data, isLoading, error, refetch };
}
