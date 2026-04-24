/**
 * useResourceDelete — DELETE a row, invalidate list + drop one-cache.
 *
 * Contract: DELETE /api/<resource>/<id> → 204 or `{ ok: true }`
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";

export function useResourceDelete(resource: string) {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number): Promise<void> => {
      const res = await api(`/api/${encodeURIComponent(resource)}/${encodeURIComponent(String(id))}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `DELETE /api/${resource}/${id} → ${res.status}${text ? `: ${text}` : ""}`,
        );
      }
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: [resource, "list"] });
      qc.removeQueries({ queryKey: [resource, "one", id] });
    },
  });
}
