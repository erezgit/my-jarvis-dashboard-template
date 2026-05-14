import { useEffect, useState } from "react";
import { BlockRenderer, type Block } from "../blueprint/BlockRenderer";
import { architectureConfig } from "../blueprint/ArchitectureBlocks";
import { useApi } from "../../../lib/api";

const SLUG = "kb-doc/tickets/agent-feed";

export function AgentFeedTicketPage() {
  const api = useApi();
  const [blocks, setBlocks] = useState<Block[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api(`/api/kb/${SLUG}`);
        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          if (!cancelled) setError(`fetch failed: ${res.status} ${detail.slice(0, 200)}`);
          return;
        }
        const body = (await res.json()) as { content?: { blocks?: Block[] } };
        if (!cancelled) setBlocks(body.content?.blocks ?? null);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) return <div style={{padding:"24px",fontSize:14,color:"#7c2d12",background:"#fef3c7",borderRadius:8}}>Failed to load <code>{SLUG}</code>: {error}</div>;
  if (!blocks) return <div style={{padding:"24px",fontSize:14,color:"#78716c"}}>Loading…</div>;
  return <BlockRenderer config={architectureConfig} blocks={blocks} />;
}

(AgentFeedTicketPage as any).path = "/t/agent-feed";
