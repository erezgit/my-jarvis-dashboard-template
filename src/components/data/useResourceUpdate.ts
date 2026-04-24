/**
 * useResourceUpdate — PATCH an existing row, invalidate list + one-cache.
 *
 * Contract: PATCH /api/<resource>/<id> body=<Partial<T>> → `T`
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";

export function useResourceUpdate<T extends { id: string | number }>(resource: string) {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: T["id"];
      patch: Partial<T>;
    }): Promise<T> => {
      const res = await api(`/api/${encodeURIComponent(resource)}/${encodeURIComponent(String(id))}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `PATCH /api/${resource}/${id} → ${res.status}${text ? `: ${text}` : ""}`,
        );
      }
      return (await res.json()) as T;
    },
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: [resource, "list"] });
      if (row.id != null) qc.setQueryData([resource, "one", row.id], row);
    },
  });
}
