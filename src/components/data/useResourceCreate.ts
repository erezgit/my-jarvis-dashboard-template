/**
 * useResourceCreate — POST a new row, invalidate list + returned id's one-cache.
 *
 * Contract: POST /api/<resource> body=<Partial<T>> → `T` (with id)
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";

export function useResourceCreate<T extends { id?: string | number }>(resource: string) {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<T>): Promise<T> => {
      const res = await api(`/api/${encodeURIComponent(resource)}`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`POST /api/${resource} → ${res.status}${text ? `: ${text}` : ""}`);
      }
      return (await res.json()) as T;
    },
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: [resource, "list"] });
      if (row.id != null) qc.setQueryData([resource, "one", row.id], row);
    },
  });
}
