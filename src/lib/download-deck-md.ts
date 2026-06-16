// Per-slide markdown serializer for pitch-deck BlockRenderer recipes.
//
// The counterpart to `download-md.ts` (which serializes architectureConfig
// knowledge-base blocks). Pitch decks use the pitchDeckConfig block library:
// a single `Deck` root whose `children` are slide blocks (CoverSlide,
// ContentSlide, CompareSlide, …). Each slide maps to its closest markdown
// primitive; slides are separated by a horizontal rule so the export reads
// like a deck handout.
//
// Slide titles use "|" as an internal line break (renderTitleLines splits on
// it). For markdown we flatten it to a single space — a heading is one line.

import type { Block } from "@/components/atomic-crm/blueprint/BlockRenderer";

type Props = Record<string, unknown>;

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function asArray(v: unknown): Props[] {
  return Array.isArray(v)
    ? v.filter((x): x is Props => typeof x === "object" && x !== null)
    : [];
}

/** Flatten a "Line one|Line two" slide title to a single heading line. */
function flatTitle(v: unknown): string {
  return asString(v)
    .split("|")
    .map((l) => l.trim())
    .filter(Boolean)
    .join(" ");
}

/** Render a list of { title, body? } records as markdown bullets. */
function bulletsMd(items: Props[]): string {
  return items
    .map((b) => {
      const title = asString(b.title);
      const body = asString(b.body);
      if (title && body) return `- **${title}** — ${body}`;
      return `- ${title || body}`;
    })
    .filter((l) => l !== "- ")
    .join("\n");
}

function eyebrowMd(p: Props): string {
  const chip = asString(p.chipText);
  return chip ? `*${chip}*\n\n` : "";
}

function slideMd(block: Block): string {
  const type = block.type;
  const p = (block.props ?? {}) as Props;

  switch (type) {
    case "CoverSlide": {
      const parts: string[] = [];
      if (asString(p.mark)) parts.push(`*${asString(p.mark)}*`);
      const title = [asString(p.titleLine1), asString(p.titleAccent)]
        .filter(Boolean)
        .join(" ");
      if (title) parts.push(`# ${title}`);
      if (asString(p.sub)) parts.push(asString(p.sub));
      if (asString(p.micro)) parts.push(`*${asString(p.micro)}*`);
      return parts.join("\n\n");
    }

    case "ContentSlide": {
      const parts = [`${eyebrowMd(p)}## ${flatTitle(p.title)}`];
      if (asString(p.lede)) parts.push(`*${asString(p.lede)}*`);
      const bullets = bulletsMd(asArray(p.bullets));
      if (bullets) parts.push(bullets);
      return parts.join("\n\n");
    }

    case "StackSlide": {
      const parts = [`${eyebrowMd(p)}## ${flatTitle(p.title)}`];
      if (asString(p.lede)) parts.push(`*${asString(p.lede)}*`);
      const items = asArray(p.items)
        .map((it, i) => {
          const title = asString(it.title);
          const body = asString(it.body);
          return `${i + 1}. **${title}**${body ? ` — ${body}` : ""}`;
        })
        .join("\n");
      if (items) parts.push(items);
      return parts.join("\n\n");
    }

    case "FlowDiagramSlide": {
      const parts = [`${eyebrowMd(p)}## ${flatTitle(p.title)}`];
      if (asString(p.lede)) parts.push(`*${asString(p.lede)}*`);
      const steps = asArray(p.steps)
        .map((st, i) => {
          const title = asString(st.title);
          const body = asString(st.body);
          return `${i + 1}. **${title}**${body ? ` — ${body}` : ""}`;
        })
        .join("\n");
      if (steps) parts.push(steps);
      return parts.join("\n\n");
    }

    case "CompareSlide": {
      const parts = [`${eyebrowMd(p)}## ${flatTitle(p.title)}`];
      const col = (c: unknown): string => {
        const cp = (typeof c === "object" && c !== null ? c : {}) as Props;
        const lines = [`### ${asString(cp.heading)}`];
        const bullets = bulletsMd(asArray(cp.bullets));
        if (bullets) lines.push(bullets);
        return lines.join("\n\n");
      };
      if (p.left) parts.push(col(p.left));
      if (p.right) parts.push(col(p.right));
      return parts.join("\n\n");
    }

    case "QuoteSlide": {
      const parts: string[] = [];
      if (asString(p.chipText)) parts.push(`*${asString(p.chipText)}*`);
      if (asString(p.quote)) parts.push(`> ${asString(p.quote)}`);
      if (asString(p.attribution)) parts.push(`— ${asString(p.attribution)}`);
      if (asString(p.caption)) parts.push(`*${asString(p.caption)}*`);
      return parts.join("\n\n");
    }

    case "ImageSlide": {
      const parts = [`${eyebrowMd(p)}## ${flatTitle(p.title)}`];
      if (asString(p.lede)) parts.push(`*${asString(p.lede)}*`);
      const src = asString(p.imageUrl);
      if (src) parts.push(`![${asString(p.imageAlt) || flatTitle(p.title)}](${src})`);
      if (asString(p.caption)) parts.push(`*${asString(p.caption)}*`);
      return parts.join("\n\n");
    }

    case "UseCaseSlide": {
      const parts = [`${eyebrowMd(p)}## ${flatTitle(p.title)}`];
      const nodes = asArray(p.flowNodes)
        .map((n) => asString(n.label))
        .filter(Boolean);
      if (nodes.length) parts.push(nodes.join(" → "));
      const cards = asArray(p.cards)
        .map((c) => {
          const tag = asString(c.tag);
          const ttl = asString(c.ttl);
          const body = asString(c.body);
          const head = tag && ttl ? `**${tag}** — ${ttl}` : `**${tag || ttl}**`;
          return `- ${head}${body ? ` (${body})` : ""}`;
        })
        .join("\n");
      if (cards) parts.push(cards);
      return parts.join("\n\n");
    }

    case "ArchitectureSlide": {
      const parts = [`${eyebrowMd(p)}## ${flatTitle(p.title)}`];
      const box = (b: Props): string =>
        `- **${asString(b.tag)}: ${asString(b.name)}** — ${asString(b.desc)}`;
      const sources = asArray(p.sources);
      if (sources.length) parts.push(`**Sources**\n\n${sources.map(box).join("\n")}`);
      const middle = (typeof p.middle === "object" && p.middle !== null
        ? p.middle
        : null) as Props | null;
      if (middle) parts.push(`**Intelligence layer**\n\n${box(middle)}`);
      const outputs = asArray(p.outputs);
      if (outputs.length) parts.push(`**Outputs**\n\n${outputs.map(box).join("\n")}`);
      return parts.join("\n\n");
    }

    default: {
      // Unknown slide — preserve a heading if there's a title, else note type.
      const title = flatTitle(p.title) || asString(p.text);
      return title ? `## ${title}` : `<!-- unsupported slide: ${type} -->`;
    }
  }
}

/** Serialize a pitch-deck Block[] recipe to a clean markdown handout. */
export function deckToMarkdown(blocks: Block[]): string {
  // The recipe is a single `Deck` root whose children are the slides. Fall
  // back to treating top-level blocks as slides if no Deck wrapper is present.
  const deck = blocks.find((b) => b.type === "Deck");
  const slides = deck?.children ?? blocks;
  return slides
    .map(slideMd)
    .filter((s) => s.length > 0)
    .join("\n\n---\n\n")
    .replace(/\n{3,}/g, "\n\n");
}

/** Trigger a browser download of the deck markdown as `<filename>.md`. */
export function downloadDeckAsMarkdown(blocks: Block[], filename: string) {
  const md = deckToMarkdown(blocks);
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".md") ? filename : `${filename}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
