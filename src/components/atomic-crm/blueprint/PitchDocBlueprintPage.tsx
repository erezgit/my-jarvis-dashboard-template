// PitchDocBlueprintPage.tsx — MJOS-055
//
// Generic renderer for any page_content row at slug `pitch-doc/...` whose
// content is the BlockRenderer recipe shape ({ blocks: [...] }) using the
// pitchDeckConfig block library (Deck + slide types).
//
// Mirrors KbBlueprintPage exactly, with two swaps:
//   - URL prefix `/pitch-doc/*` (slug stored as `pitch-doc/...`)
//   - BlockRenderer config = pitchDeckConfig (slide blocks) instead of
//     architectureConfig (knowledge-base blocks)
//
// The result: drop a Deck-shaped recipe into page_content, link it from the
// KB list, and it renders as a full-screen slide deck with the same data-in-DB
// doctrine the rest of the dashboard uses. No bespoke wrapper page per deck.

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { BlockRenderer, type Block } from "./BlockRenderer";
import { pitchDeckConfig } from "./PitchDeckBlocks";
import { useApi } from "../../../lib/api";

export const PitchDocBlueprintPage = () => {
  const api = useApi();
  const params = useParams();
  const tail = params["*"] ?? "";
  const slug = tail ? `pitch-doc/${tail}` : "";

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

  if (error) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center text-sm text-stone-500 gap-3 p-8">
        <Link to="/knowledge-base" className="text-xs text-stone-500 inline-flex items-center gap-1 hover:text-stone-700">
          <ChevronLeft className="w-3 h-3" /> Knowledge base
        </Link>
        <div className="font-bold text-red-700">Failed to load deck</div>
        <code className="text-xs">{slug || "(no slug)"}</code>
        <div className="text-xs">{error}</div>
      </div>
    );
  }

  if (!blocks) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-sm text-stone-500">
        Loading deck…
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <BlockRenderer config={pitchDeckConfig} blocks={blocks} />
    </div>
  );
};

(PitchDocBlueprintPage as unknown as { path: string }).path = "/pitch-doc/*";
