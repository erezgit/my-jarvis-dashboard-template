import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SectionCard } from "./SectionCard";

/**
 * Lightweight Hebrew-safe markdown renderer for Lilach's guide pages.
 *
 * Source content is embedded in GUIDE_*.tsx files as a single markdown
 * string (body). This renderer parses that markdown into structured React
 * — headings, bold/italic/code inlines, bullets, numbered lists, and
 * blockquotes — so the page reads as polished typography instead of a
 * wall of <pre>.
 *
 * The markdown is Hebrew-verbatim — we never translate or edit content.
 *
 * The renderer splits the body on horizontal rules (`---`), turning each
 * chunk into a <SectionCard>. That gives every guide the "section cards"
 * feel with zero per-guide work.
 */

export type GuideMarkdownProps = {
  /** The raw markdown body, as it appears in each guide's SECTIONS[0].body. */
  body: string;
  /** Optional className applied to the outer stack. */
  className?: string;
};

export function GuideMarkdown({ body, className }: GuideMarkdownProps) {
  // Split on horizontal-rule lines. A HR is a line containing only `---`
  // (optionally surrounded by whitespace).
  const chunks = splitOnHr(body)
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  return (
    <div className={cn("space-y-4", className)}>
      {chunks.map((chunk, idx) => (
        <SectionCard key={idx}>
          <MarkdownChunk text={chunk} />
        </SectionCard>
      ))}
    </div>
  );
}

/**
 * Render a single chunk of markdown (no horizontal rules inside). Used by
 * <GuideMarkdown> and available for pages that want to render markdown
 * inside a custom wrapper.
 */
export function MarkdownChunk({ text }: { text: string }) {
  const blocks = parseBlocks(text);
  return <>{blocks.map((b, i) => renderBlock(b, i))}</>;
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

type Block =
  | { kind: "h1"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "h4"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "quote"; text: string }
  | { kind: "code"; text: string };

function splitOnHr(text: string): string[] {
  return text.split(/\n[ \t]*-{3,}[ \t]*\n/);
}

function parseBlocks(text: string): Block[] {
  const lines = text.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      i++;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++;
      blocks.push({ kind: "code", text: codeLines.join("\n") });
      continue;
    }

    const headingMatch = /^(#{1,4})\s+(.*)$/.exec(trimmed);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      if (level === 1) blocks.push({ kind: "h1", text });
      else if (level === 2) blocks.push({ kind: "h2", text });
      else if (level === 3) blocks.push({ kind: "h3", text });
      else blocks.push({ kind: "h4", text });
      i++;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        const m = /^[-*]\s+(.*)$/.exec(lines[i].trim());
        if (m) items.push(m[1]);
        i++;
      }
      blocks.push({ kind: "ul", items });
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        const m = /^\d+\.\s+(.*)$/.exec(lines[i].trim());
        if (m) items.push(m[1]);
        i++;
      }
      blocks.push({ kind: "ol", items });
      continue;
    }

    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ kind: "quote", text: quoteLines.join("\n") });
      continue;
    }

    const paraLines: string[] = [];
    while (i < lines.length) {
      const t = lines[i].trim();
      if (t === "") break;
      if (/^(#{1,4})\s+/.test(t)) break;
      if (/^[-*]\s+/.test(t)) break;
      if (/^\d+\.\s+/.test(t)) break;
      if (t.startsWith(">")) break;
      if (t.startsWith("```")) break;
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push({ kind: "p", text: paraLines.join("\n") });
  }

  return blocks;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function renderBlock(block: Block, key: number): ReactNode {
  switch (block.kind) {
    case "h1":
      return (
        <h2
          key={key}
          className="text-xl font-bold text-foreground mt-6 mb-3 first:mt-0"
        >
          {renderInline(block.text)}
        </h2>
      );
    case "h2":
      return (
        <h3
          key={key}
          className="text-lg font-semibold text-foreground mt-5 mb-2 first:mt-0"
        >
          {renderInline(block.text)}
        </h3>
      );
    case "h3":
      return (
        <h4
          key={key}
          className="text-base font-semibold text-foreground mt-4 mb-2 first:mt-0"
        >
          {renderInline(block.text)}
        </h4>
      );
    case "h4":
      return (
        <h5
          key={key}
          className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mt-4 mb-2 first:mt-0"
        >
          {renderInline(block.text)}
        </h5>
      );
    case "p":
      return (
        <p
          key={key}
          className="text-[15px] leading-[1.85] text-foreground/90 my-3 first:mt-0 last:mb-0 whitespace-pre-wrap"
        >
          {renderInline(block.text)}
        </p>
      );
    case "ul":
      return (
        <ul
          key={key}
          className="list-disc ps-6 space-y-1.5 text-[15px] leading-[1.8] text-foreground/90 my-3 marker:text-muted-foreground"
        >
          {block.items.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol
          key={key}
          className="list-decimal ps-6 space-y-1.5 text-[15px] leading-[1.8] text-foreground/90 my-3 marker:text-muted-foreground"
        >
          {block.items.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ol>
      );
    case "quote":
      return (
        <blockquote
          key={key}
          className="my-3 border-s-4 border-amber-400/70 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-800 ps-4 pe-3 py-2 text-[15px] leading-[1.8] text-foreground/90 rounded-e-md whitespace-pre-wrap"
        >
          {renderInline(block.text)}
        </blockquote>
      );
    case "code":
      return (
        <pre
          key={key}
          className="my-3 rounded-lg border bg-muted/60 p-3 text-xs leading-relaxed font-mono text-foreground/90 overflow-x-auto whitespace-pre"
          dir="ltr"
        >
          <code>{block.text}</code>
        </pre>
      );
  }
}

function renderInline(text: string): ReactNode {
  const nodes: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  const tokenRe =
    /(\*\*[^*\n]+\*\*)|(__[^_\n]+__)|(\*[^*\n]+\*)|(_[^_\n]+_)|(`[^`\n]+`)|(\[[^\]\n]+\]\([^)\n]+\))/;

  while (remaining.length > 0) {
    const m = tokenRe.exec(remaining);
    if (!m) {
      nodes.push(remaining);
      break;
    }
    const idx = m.index;
    if (idx > 0) nodes.push(remaining.slice(0, idx));
    const token = m[0];

    if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(
        <strong key={key++} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("__") && token.endsWith("__")) {
      nodes.push(
        <strong key={key++} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(
        <code
          key={key++}
          className="rounded bg-muted px-1.5 py-0.5 text-[0.85em] font-mono text-foreground/90"
          dir="ltr"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("[")) {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (linkMatch) {
        nodes.push(
          <a
            key={key++}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dotted underline-offset-2 text-foreground hover:text-amber-700"
          >
            {linkMatch[1]}
          </a>,
        );
      } else {
        nodes.push(token);
      }
    } else if (
      (token.startsWith("*") && token.endsWith("*")) ||
      (token.startsWith("_") && token.endsWith("_"))
    ) {
      nodes.push(
        <em key={key++} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    } else {
      nodes.push(token);
    }

    remaining = remaining.slice(idx + token.length);
  }

  return nodes;
}
