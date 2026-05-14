// KbBlueprintPage.tsx — MJOS-040
//
// Generic renderer for any page_content row at slug `kb-doc/...` whose content
// is the BlockRenderer recipe shape ({ blocks: [...] }).
//
// Used by the catch-all route `/kb-doc/*` in CRM.tsx so authors can drop a
// new row in page_content and have it instantly reachable, without registering
// a bespoke React route per page. The architecture page at /dashboard-architecture
// remains its own dedicated component (kept for stability + the named entry in
// the sidebar); this page handles every other kb-doc/* slug.
//
// Doctrine ref: kb-doc/mj-os/dashboard-discipline (the artifact that motivated
// adding generic kb-doc rendering — without this route, beautiful BlockRenderer
// pages were unreachable).

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { BlockRenderer, type Block } from "./BlockRenderer";
import { architectureConfig, architectureT as T } from "./ArchitectureBlocks";
import { useApi } from "../../../lib/api";

// `T` is kept for the inline "Back to Knowledge base" link + error/loading
// palette references. Layout owns the page chrome (max-w-[1000px],
// responsive padding, sky-blue bg via NARROW_ROUTES + SKY_BLUE_ROUTES).

export const KbBlueprintPage = () => {
  const api = useApi();
  const params = useParams();
  // React Router v6 wildcard match: params['*'] holds the path tail.
  const tail = params["*"] ?? "";
  const slug = tail ? `kb-doc/${tail}` : "";

  const [blocks, setBlocks] = useState<Block[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setBlocks(null);
    setError(null);
    (async () => {
      try {
        const res = await api(`/api/kb/${slug}`);
        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          if (!cancelled) {
            setError(`fetch failed: ${res.status} ${detail.slice(0, 200)}`);
          }
          return;
        }
        const body = (await res.json()) as { content?: { blocks?: Block[] } };
        if (!cancelled) {
          if (Array.isArray(body.content?.blocks)) {
            setBlocks(body.content?.blocks ?? null);
          } else {
            setError(
              `Page content at slug ${slug} is not a BlockRenderer recipe. Expected { blocks: [...] }.`,
            );
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Link
          to="/knowledge-base"
          style={{
            color: T.accent,
            fontSize: 13,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <ChevronLeft style={{ width: 14, height: 14 }} /> Knowledge base
        </Link>
      </div>

      {error ? (
        <div
          style={{
            padding: "20px 24px",
            fontSize: 14,
            color: T.red,
            background: T.redSoft,
            borderRadius: 8,
            border: `1px solid ${T.red}`,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Failed to load</div>
          <div style={{ fontSize: 13 }}>
            <code>{slug || "(no slug)"}</code>: {error}
          </div>
        </div>
      ) : blocks ? (
        <BlockRenderer config={architectureConfig} blocks={blocks} />
      ) : (
        <div style={{ padding: 24, fontSize: 14, color: T.ink3 }}>Loading…</div>
      )}
    </>
  );
};

(KbBlueprintPage as unknown as { path: string }).path = "/kb-doc/*";
