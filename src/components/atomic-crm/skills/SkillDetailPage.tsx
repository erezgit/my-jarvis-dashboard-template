// SkillDetailPage.tsx — MJOS-043
//
// Renders a single skill from the `skills` table using the SAME architecture
// as /dashboard-architecture: a block recipe stored as JSON in `skills.body`,
// rendered with <BlockRenderer config={architectureConfig} ... />.
//
// `/skills/:slug` is registered in Layout's SKY_BLUE_ROUTES so <main> is
// painted sky-blue at the layout level.

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useApi } from "@/lib/api";
import {
  architectureConfig,
  architectureT as T,
} from "../blueprint/ArchitectureBlocks";
import { BlockRenderer, type Block } from "../blueprint/BlockRenderer";

type Skill = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  body: string;
  status: "draft" | "active" | "archived";
  created_at: string;
  updated_at: string;
};

const STATUS_TONE: Record<Skill["status"], { fg: string; bg: string; bd: string }> = {
  draft:    { fg: T.amber, bg: T.amberSoft, bd: T.amber },
  active:   { fg: T.green, bg: T.greenSoft, bd: T.green },
  archived: { fg: T.ink3,  bg: T.bg2,       bd: T.line },
};

// Parse a skill body — every body is a BlockRenderer recipe `{ blocks: [...] }`.
function parseRecipe(body: string): Block[] | null {
  try {
    const parsed = JSON.parse(body);
    if (parsed && Array.isArray(parsed.blocks)) return parsed.blocks as Block[];
  } catch {
    return null;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero (KB-style, copied 1:1 from ArchitectureBlocks for visual parity)
// ─────────────────────────────────────────────────────────────────────────────

function Hero({
  eyebrow, subEyebrow, title, lede,
}: { eyebrow: string; subEyebrow?: string; title: string; lede: string }) {
  return (
    <div style={{ textAlign: "center", padding: "32px 20px 40px", marginBottom: 28 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
        color: T.skyDark, textTransform: "uppercase",
        fontFamily: "Inter, sans-serif", marginBottom: 14,
      }}>
        {eyebrow}
      </div>
      {subEyebrow ? (
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
          color: T.skyDark, textTransform: "uppercase",
          fontFamily: "Inter, sans-serif", marginBottom: 10,
        }}>
          {subEyebrow}
        </div>
      ) : null}
      <h1 style={{
        fontSize: 34, fontWeight: 800, color: T.ink,
        fontFamily: "Inter, sans-serif",
        margin: "0 0 14px",
        letterSpacing: "-0.02em", lineHeight: 1.15,
      }}>
        {title}
      </h1>
      <p style={{
        fontSize: 16, color: T.ink2, fontFamily: "Inter, sans-serif",
        lineHeight: 1.65, maxWidth: 720, margin: "0 auto",
      }}>
        {lede}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export function SkillDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const api = useApi();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!slug) return;
    setError(null);
    setSkill(null);
    (async () => {
      try {
        const res = await api(`/api/skills/${slug}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Skill;
        if (!cancelled) setSkill(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const recipe = useMemo(() => skill ? parseRecipe(skill.body) : null, [skill]);

  return (
    <div style={{
      fontFamily: "Inter, sans-serif",
      boxSizing: "border-box",
      padding: "40px 48px 80px",
    }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <Link
            to="/skills"
            style={{
              color: T.accent, fontSize: 13, textDecoration: "none",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}
          >
            <ChevronLeft style={{ width: 14, height: 14 }} /> Skills
          </Link>
        </div>

        {error ? (
          <div style={{
            padding: "16px 20px", color: T.red, background: T.redSoft,
            border: `1px solid ${T.red}`, borderRadius: 8, fontSize: 13,
          }}>
            Failed to load skill: <code>{slug}</code> — {error}
          </div>
        ) : skill === null ? (
          <div style={{
            padding: 24, fontSize: 14, color: T.ink3,
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            <Loader2 className="animate-spin" style={{ width: 14, height: 14 }} />
            Loading…
          </div>
        ) : (
          <>
            <Hero
              eyebrow={`SKILL · ${skill.slug}`}
              subEyebrow={`${skill.status.toUpperCase()} · UPDATED ${new Date(skill.updated_at).toLocaleDateString()}`}
              title={skill.name}
              lede={skill.description ?? ""}
            />

            {recipe ? (
              <BlockRenderer config={architectureConfig} blocks={recipe} />
            ) : (
              <div style={{
                padding: "16px 20px", color: T.red, background: T.redSoft,
                border: `1px solid ${T.red}`, borderRadius: 8, fontSize: 13,
              }}>
                Skill body is not a valid BlockRenderer recipe (expected JSON {"{ blocks: [...] }"}).
              </div>
            )}

            <div style={{
              fontSize: 11, color: T.ink3, paddingTop: 24,
              borderTop: `1px dashed ${T.line}`, marginTop: 48,
              textAlign: "center", letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}>
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                color: STATUS_TONE[skill.status].fg,
                background: STATUS_TONE[skill.status].bg,
                border: `1px solid ${STATUS_TONE[skill.status].bd}`,
                padding: "3px 10px", borderRadius: 999, marginRight: 10,
              }}>
                {skill.status}
              </span>
              Updated {new Date(skill.updated_at).toLocaleString()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

(SkillDetailPage as unknown as { path: string }).path = "/skills/:slug";
