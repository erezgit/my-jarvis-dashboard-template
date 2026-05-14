// DashboardArchitecturePage.tsx — MJOS-028
//
// The dashboard architecture page. Living document — when reality drifts,
// fix the page_content row in the same commit.
//
// Doctrine:
//   Content is a flat { blocks: [...] } payload in page_content.content,
//   stored at page_slug = 'kb-doc/mj-os/dashboard-architecture'. The 17
//   block components live in code (architectureConfig); the recipe lives
//   in the DB. See BlockRenderer.tsx for the renderer and the
//   myjarvis-dashboard skill for the doctrine.

import { useEffect, useState } from "react";
import { BlockRenderer, type Block } from "./BlockRenderer";
import { architectureConfig } from "./ArchitectureBlocks";
import { useApi } from "../../../lib/api";

const SLUG = "kb-doc/mj-os/dashboard-architecture";

export const DashboardArchitecturePage = () => {
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
          if (!cancelled) {
            setError(`fetch failed: ${res.status} ${detail.slice(0, 200)}`);
          }
          return;
        }
        const body = (await res.json()) as { content?: { blocks?: Block[] } };
        if (!cancelled) setBlocks(body.content?.blocks ?? null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // `api` is stable from useApi; we only run once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Layout owns chrome (max-w-[1000px], responsive padding, sky-blue bg via
  // NARROW_ROUTES + SKY_BLUE_ROUTES). Page just renders content.
  if (error) {
    return (
      <div
        style={{
          padding: "24px",
          fontSize: 14,
          color: "#7c2d12",
          background: "#fef3c7",
          borderRadius: 8,
        }}
      >
        Failed to load architecture content from <code>{SLUG}</code>: {error}
      </div>
    );
  }
  if (!blocks) {
    return (
      <div style={{ padding: "24px", fontSize: 14, color: "#78716c" }}>
        Loading architecture…
      </div>
    );
  }
  return <BlockRenderer config={architectureConfig} blocks={blocks} />;
};

(DashboardArchitecturePage as unknown as { path: string }).path =
  "/dashboard-architecture";
