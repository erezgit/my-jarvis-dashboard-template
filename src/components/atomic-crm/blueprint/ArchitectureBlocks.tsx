// ArchitectureBlocks.tsx — MJOS-028
// Block library for the dashboard architecture page. Each component below
// is one block-type registered in `architectureConfig`.
//
// Doctrine (locked):
//   * Page content lives in page_content.content as { blocks: [...] }.
//   * Each block is { type, props, children? }. The TYPE keys into this
//     config; the PROPS are the React props for that component.
//   * Visual styling is COPIED 1:1 from the original
//     DashboardArchitecturePage.tsx — the recipe (which blocks, in what
//     order, with what props) is the only thing the DB carries.
//   * Inline rich-text rendering: a tiny `renderRich` helper turns
//     `**bold**`, `*italic*`, and `` `code` `` into matching <strong>/<em>/
//     <code> nodes so DB-stored prose can carry inline emphasis without
//     forcing nested blocks.

import React from "react";
import { Link } from "react-router-dom";
import type { BlockConfig } from "./BlockRenderer";

// ── Palette — sky-blue, copied 1:1 from the original DashboardArchitecturePage ──
const T = {
  bg: "#F2F7FD",
  bg2: "#E5EEF9",
  ink: "#1C1917",
  ink2: "#57534E",
  ink3: "#A8A29E",
  sky: "#7AB4F4",
  skyDark: "#3B82C8",
  skySoft: "#D2E4FC",
  line: "#D0DEF0",
  accent: "#2A6AAC",
  green: "#2A7A4B",
  greenSoft: "#E8F3EC",
  amber: "#B87333",
  amberSoft: "#FCEFD9",
  plum: "#8E4585",
  plumSoft: "#F3E6F2",
  white: "#FFFFFF",
  red: "#C0392B",
  redSoft: "#FDECEA",
} as const;

type PaletteToken = keyof typeof T;

function tokenToColor(token?: string): string | undefined {
  if (!token) return undefined;
  return (T as Record<string, string>)[token];
}

// ── Inline rich-text helper ────────────────────────────────────────────────
// Lightweight subset: **bold**, `code`, *italic*. Lets jsonb props carry
// the same emphasis the original page uses without nested blocks.
function renderRich(text?: string): React.ReactNode {
  if (!text) return null;
  const parts: React.ReactNode[] = [];
  // Order matters: link pattern is greediest, must come before bold/italic.
  const re = /(\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("[")) {
      const link = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok);
      if (link) {
        const [, label, href] = link;
        const isExternal = /^https?:\/\//.test(href);
        if (isExternal) {
          parts.push(
            <a key={key++} href={href} target="_blank" rel="noreferrer"
               style={{ color: T.accent, fontWeight: 600, textDecoration: "none" }}>
              {label}
            </a>
          );
        } else {
          parts.push(
            <Link key={key++} to={href}
                  style={{ color: T.accent, fontWeight: 600, textDecoration: "none" }}>
              {label}
            </Link>
          );
        }
      }
    } else if (tok.startsWith("`")) {
      parts.push(<CodeInline key={key++}>{tok.slice(1, -1)}</CodeInline>);
    } else if (tok.startsWith("**")) {
      parts.push(<strong key={key++}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith("*")) {
      parts.push(<em key={key++}>{tok.slice(1, -1)}</em>);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function CodeInline({ children }: { children: React.ReactNode }) {
  return (
    <code
      style={{
        background: T.skySoft,
        color: T.accent,
        fontFamily: "ui-monospace, Menlo, Monaco, monospace",
        fontSize: 13,
        padding: "1px 6px",
        borderRadius: 4,
      }}
    >
      {children}
    </code>
  );
}

// ── Block prop shapes ──────────────────────────────────────────────────────
type CardProps = {
  h4: string;
  h4ColorToken?: PaletteToken | string;
  body: string;
  accentColorToken?: PaletteToken | string;
  bgToken?: PaletteToken | string;
};

// ── Per-block components ───────────────────────────────────────────────────

function Hero({
  eyebrow,
  subEyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  subEyebrow: string;
  title: string;
  lede: string;
}) {
  return (
    <div style={{ textAlign: "center", padding: "32px 20px 40px", marginBottom: 28 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: T.skyDark,
          textTransform: "uppercase",
          fontFamily: "Inter, sans-serif",
          marginBottom: 14,
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: T.skyDark,
          textTransform: "uppercase",
          fontFamily: "Inter, sans-serif",
          marginBottom: 10,
        }}
      >
        {subEyebrow}
      </div>
      <h1
        style={{
          fontSize: 34,
          fontWeight: 800,
          color: T.ink,
          fontFamily: "Inter, sans-serif",
          margin: "0 0 14px",
          letterSpacing: "-0.02em",
          lineHeight: 1.15,
        }}
      >
        {title}
      </h1>
      <p
        style={{
          fontSize: 16,
          color: T.ink2,
          fontFamily: "Inter, sans-serif",
          lineHeight: 1.65,
          maxWidth: 720,
          margin: "0 auto",
        }}
      >
        {renderRich(lede)}
      </p>
    </div>
  );
}

function LivingBanner({ pillLabel, message }: { pillLabel: string; message: string }) {
  return (
    <div
      style={{
        background: T.skySoft,
        border: `1px dashed ${T.skyDark}`,
        borderRadius: 8,
        padding: "12px 18px",
        margin: "0 0 28px",
        fontFamily: "Inter, sans-serif",
        fontSize: 13,
        color: T.ink2,
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          background: T.skyDark,
          color: T.white,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          padding: "3px 10px",
          borderRadius: 999,
          textTransform: "uppercase",
        }}
      >
        {pillLabel}
      </span>
      <span>{renderRich(message)}</span>
    </div>
  );
}

function TOC({ items }: { items: string[] }) {
  return (
    <div
      style={{
        background: T.bg2,
        border: `1px solid ${T.line}`,
        borderRadius: 10,
        padding: "20px 28px",
        marginBottom: 48,
      }}
    >
      <p
        style={{
          margin: "0 0 14px",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: T.skyDark,
          fontFamily: "Inter, sans-serif",
        }}
      >
        On this page
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "4px 24px",
        }}
      >
        {(items || []).map((item: string, i: number) => (
          <div
            key={i}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              color: T.ink2,
              padding: "4px 0",
            }}
          >
            <span style={{ color: T.skyDark, fontWeight: 600, marginRight: 8 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: T.skyDark,
          textTransform: "uppercase",
          margin: "0 0 6px 0",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {eyebrow}
      </p>
      <h2
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: T.ink,
          margin: 0,
          fontFamily: "Inter, sans-serif",
          lineHeight: 1.2,
        }}
      >
        {title}
      </h2>
    </div>
  );
}

function Lede({ body }: { body: string }) {
  return (
    <p
      style={{
        fontSize: 16,
        color: T.ink2,
        fontFamily: "Inter, sans-serif",
        lineHeight: 1.7,
        marginBottom: 28,
        maxWidth: 760,
      }}
    >
      {renderRich(body)}
    </p>
  );
}

function P({ body }: { body: string }) {
  return (
    <p
      style={{
        fontSize: 15,
        color: T.ink,
        fontFamily: "Inter, sans-serif",
        lineHeight: 1.65,
        marginTop: 0,
        marginBottom: 14,
      }}
    >
      {renderRich(body)}
    </p>
  );
}

function H3({ text, colorToken }: { text: string; colorToken?: string }) {
  return (
    <h3
      style={{
        fontSize: 18,
        fontWeight: 700,
        color: tokenToColor(colorToken) || T.skyDark,
        fontFamily: "Inter, sans-serif",
        margin: "28px 0 10px",
      }}
    >
      {text}
    </h3>
  );
}

function H4({ text, colorToken }: { text: string; colorToken?: string }) {
  return (
    <h4
      style={{
        fontSize: 14,
        fontWeight: 700,
        color: tokenToColor(colorToken) || T.skyDark,
        fontFamily: "Inter, sans-serif",
        margin: "0 0 8px",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {text}
    </h4>
  );
}

function UL({ items }: { items: string[] }) {
  return (
    <ul
      style={{
        paddingLeft: 22,
        margin: "8px 0 14px",
        fontFamily: "Inter, sans-serif",
        fontSize: 14,
        color: T.ink,
        lineHeight: 1.65,
      }}
    >
      {(items || []).map((it: string, i: number) => (
        <li key={i} style={{ marginBottom: 6 }}>
          {renderRich(it)}
        </li>
      ))}
    </ul>
  );
}

function QuoteBlock({ body }: { body: string }) {
  return (
    <div
      style={{
        borderLeft: `3px solid ${T.skyDark}`,
        padding: "12px 20px",
        margin: "24px 0",
        background: T.bg2,
        fontStyle: "italic",
        color: T.ink2,
        borderRadius: "0 8px 8px 0",
        fontFamily: "Inter, sans-serif",
        fontSize: 15,
        lineHeight: 1.6,
      }}
    >
      {renderRich(body)}
    </div>
  );
}

// The original page wraps each section in <section style={{ marginBottom: 60 }}>
// and inserts <Divider /> (margin: 48px 0) between sections. With a flat blocks
// array (no <section> wrapper), we fold the section-bottom 60 into the divider's
// top margin directly. This restores byte-identical inter-section spacing.
function Divider() {
  return <div style={{ borderTop: `1px solid ${T.line}`, margin: "60px 0 48px" }} />;
}

function Footer({ line1, line2 }: { line1: string; line2: string }) {
  return (
    <div
      style={{
        borderTop: `1px solid ${T.line}`,
        marginTop: 60,
        paddingTop: 28,
        fontFamily: "Inter, sans-serif",
        fontSize: 13,
        color: T.ink2,
        textAlign: "center",
      }}
    >
      <p style={{ margin: "0 0 8px" }}>{line1}</p>
      <p style={{ margin: 0, color: T.ink3, fontSize: 12 }}>{renderRich(line2)}</p>
    </div>
  );
}

function Card(props: CardProps) {
  return <CardBlock {...props} />;
}

function Grid2({ cards }: { cards: CardProps[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 16,
        margin: "20px 0",
      }}
    >
      {(cards || []).map((c, i) => (
        <CardBlock key={i} {...c} />
      ))}
    </div>
  );
}

function Grid3({ cards }: { cards: CardProps[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 16,
        margin: "20px 0",
      }}
    >
      {(cards || []).map((c, i) => (
        <CardBlock key={i} {...c} />
      ))}
    </div>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div
      style={{
        overflowX: "auto",
        margin: "20px 0",
        borderRadius: 10,
        border: `1px solid ${T.line}`,
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "Inter, sans-serif",
          fontSize: 14,
          background: T.white,
        }}
      >
        <thead>
          <tr>
            {(headers || []).map((h, i) => (
              <th
                key={i}
                style={{
                  background: T.bg2,
                  color: T.skyDark,
                  fontWeight: 700,
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  padding: "10px 14px",
                  textAlign: "left",
                  borderBottom: `1px solid ${T.line}`,
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(rows || []).map((row, ri) => (
            <tr key={ri}>
              {(row || []).map((cell, ci) => (
                <td
                  key={ci}
                  style={{
                    padding: "10px 14px",
                    borderBottom:
                      ri < rows.length - 1 ? `1px solid ${T.line}` : "none",
                    verticalAlign: "top",
                    color: T.ink,
                    lineHeight: 1.55,
                  }}
                >
                  {renderRich(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Card subcomponent — shared by Card/Grid2/Grid3 ─────────────────────────
// `body` may contain plain prose OR a list. Lists are encoded as one item
// per `\n* ` (or `\n- `) prefix so the jsonb stays human-readable. The
// component splits the body into a paragraph head + a UL of items, mirroring
// the original page's `<P>...<UL><LI>...</LI></UL></P>` shape.
function CardBlock({
  h4,
  h4ColorToken,
  body,
  accentColorToken,
  bgToken,
}: CardProps) {
  const accent = tokenToColor(accentColorToken);
  const bg = tokenToColor(bgToken) || T.white;

  const lines = (body || "").split(/\n/);
  const bulletStart = lines.findIndex((l) => /^\s*[*-]\s+/.test(l));
  let leadParagraph = body;
  let bullets: string[] = [];
  if (bulletStart >= 0) {
    leadParagraph = lines.slice(0, bulletStart).join("\n").trim();
    bullets = lines
      .slice(bulletStart)
      .filter((l) => /^\s*[*-]\s+/.test(l))
      .map((l) => l.replace(/^\s*[*-]\s+/, ""));
  }

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${T.line}`,
        borderRadius: 10,
        padding: "18px 22px",
        borderLeft: accent ? `4px solid ${accent}` : undefined,
      }}
    >
      <h4
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: tokenToColor(h4ColorToken) || T.skyDark,
          fontFamily: "Inter, sans-serif",
          margin: "0 0 8px",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {h4}
      </h4>
      {leadParagraph && (
        <p
          style={{
            fontSize: 15,
            color: T.ink,
            fontFamily: "Inter, sans-serif",
            lineHeight: 1.65,
            marginTop: 0,
            // Match the original: <P> always carries 14px bottom margin
            // (even when it's the last child of <Card>); the Card's own
            // padding-bottom then accumulates on top of that.
            marginBottom: 14,
          }}
        >
          {renderRich(leadParagraph)}
        </p>
      )}
      {bullets.length > 0 && (
        <ul
          style={{
            paddingLeft: 22,
            margin: "8px 0 14px",
            fontFamily: "Inter, sans-serif",
            fontSize: 14,
            color: T.ink,
            lineHeight: 1.65,
          }}
        >
          {bullets.map((it, i) => (
            <li key={i} style={{ marginBottom: 6 }}>
              {renderRich(it)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── ImageBlock — for diagrams, screenshots, system maps ────────────────────
// Used by KB pages that need to embed a hosted image (R2-uploaded usually).
// Caption renders below in muted text. Width clamps to the content column.
function ImageBlock({
  src,
  alt,
  caption,
  maxWidth,
}: {
  src: string;
  alt?: string;
  caption?: string;
  maxWidth?: number;
}) {
  return (
    <figure
      style={{
        margin: "12px 0 18px",
        textAlign: "center",
      }}
    >
      <img
        src={src}
        alt={alt ?? ""}
        style={{
          display: "block",
          maxWidth: maxWidth ? `${maxWidth}px` : "100%",
          width: "100%",
          height: "auto",
          margin: "0 auto",
          borderRadius: 8,
          border: `1px solid ${T.line}`,
          background: T.bg2,
        }}
        loading="lazy"
      />
      {caption ? (
        <figcaption
          style={{
            marginTop: 8,
            fontSize: 12,
            color: T.ink3,
            fontFamily: "Inter, sans-serif",
            fontStyle: "italic",
          }}
        >
          {renderRich(caption)}
        </figcaption>
      ) : null}
    </figure>
  );
}

// ── BlockConfig — the single export consumed by BlockRenderer ──────────────
// Each entry maps a block-type string to its React component. Components
// receive their props verbatim from the page_content row.
//
// The cast is at the boundary: the runtime contract is "props from JSON",
// inherently `Record<string, unknown>`. Concrete components are typed for
// IDE/intellisense but registered through the boundary cast.
export const architectureConfig: BlockConfig = {
  components: {
    Hero,
    LivingBanner,
    TOC,
    ImageBlock,
    SectionHeader,
    Lede,
    P,
    H3,
    H4,
    UL,
    QuoteBlock,
    Divider,
    Footer,
    Card,
    Grid2,
    Grid3,
    DataTable,
  } as unknown as BlockConfig["components"],
};

// Re-export palette for the page wrapper
export { T as architectureT };
