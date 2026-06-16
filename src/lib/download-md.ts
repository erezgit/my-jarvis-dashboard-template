// Per-block markdown serializer for BlockRenderer recipes.
//
// Each block in `architectureConfig` maps to its closest markdown primitive.
// Inline rich text (**bold**, *italic*, `code`, [link](href)) is already
// standard markdown — it passes through verbatim. Card bodies that mix a lead
// paragraph + `* ` / `- ` bullet lines are split the same way `CardBlock`
// splits them at render time.

import type { Block } from "@/components/atomic-crm/blueprint/BlockRenderer";

type Props = Record<string, unknown>;

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function asCardArray(v: unknown): Props[] {
  return Array.isArray(v) ? v.filter((x): x is Props => typeof x === "object" && x !== null) : [];
}

function blockMd(block: Block): string {
  const type = block.type;
  const p = (block.props ?? {}) as Props;

  switch (type) {
    case "Hero": {
      const title = asString(p.title);
      const lede = asString(p.lede);
      const eyebrow = asString(p.eyebrow);
      const subEyebrow = asString(p.subEyebrow);
      const parts: string[] = [];
      if (eyebrow) parts.push(`*${eyebrow}*`);
      if (subEyebrow) parts.push(`*${subEyebrow}*`);
      if (title) parts.push(`# ${title}`);
      if (lede) parts.push(lede);
      return parts.join("\n\n");
    }

    case "LivingBanner": {
      const pillLabel = asString(p.pillLabel);
      const message = asString(p.message);
      return `> **${pillLabel}** — ${message}`;
    }

    case "TOC": {
      const items = asStringArray(p.items);
      if (items.length === 0) return "";
      const list = items.map((it, i) => `${i + 1}. ${it}`).join("\n");
      return `**On this page**\n\n${list}`;
    }

    case "ImageBlock": {
      const src = asString(p.src);
      const alt = asString(p.alt);
      const caption = asString(p.caption);
      if (!src) return "";
      const img = `![${alt}](${src})`;
      return caption ? `${img}\n\n*${caption}*` : img;
    }

    case "SectionHeader": {
      const eyebrow = asString(p.eyebrow);
      const title = asString(p.title);
      const heading = title ? `## ${title}` : "";
      return eyebrow ? `*${eyebrow}*\n\n${heading}` : heading;
    }

    case "Lede":
      return `*${asString(p.body)}*`;

    case "P":
      return asString(p.body);

    case "H3":
      return `### ${asString(p.text)}`;

    case "H4":
      return `#### ${asString(p.text)}`;

    case "UL": {
      const items = asStringArray(p.items);
      return items.map((it) => `- ${it}`).join("\n");
    }

    case "QuoteBlock":
      return asString(p.body)
        .split(/\n/)
        .map((line) => `> ${line}`)
        .join("\n");

    case "Divider":
      return "---";

    case "Footer": {
      const line1 = asString(p.line1);
      const line2 = asString(p.line2);
      const parts: string[] = ["---"];
      if (line1) parts.push(`_${line1}_`);
      if (line2) parts.push(`_${line2}_`);
      return parts.join("\n\n");
    }

    case "Card":
      return cardMd(p);

    case "Grid2":
    case "Grid3": {
      const cards = asCardArray(p.cards);
      return cards.map(cardMd).join("\n\n");
    }

    case "DataTable":
      return tableMd(p);

    default:
      // Unknown block — preserve some signal rather than dropping silently.
      // Prefer a known text-bearing prop if present; otherwise note the type.
      for (const key of ["body", "text", "title"]) {
        const v = p[key];
        if (typeof v === "string" && v.length > 0) return v;
      }
      return `<!-- unsupported block: ${type} -->`;
  }
}

function cardMd(card: Props): string {
  const h4 = asString(card.h4);
  const body = asString(card.body);

  const lines = body.split(/\n/);
  const bulletStart = lines.findIndex((l) => /^\s*[*-]\s+/.test(l));

  let lead = body;
  let bullets: string[] = [];
  if (bulletStart >= 0) {
    lead = lines.slice(0, bulletStart).join("\n").trim();
    bullets = lines
      .slice(bulletStart)
      .filter((l) => /^\s*[*-]\s+/.test(l))
      .map((l) => l.replace(/^\s*[*-]\s+/, ""));
  }

  const parts: string[] = [];
  if (h4) parts.push(`**${h4}**`);
  if (lead) parts.push(lead);
  if (bullets.length > 0) parts.push(bullets.map((b) => `- ${b}`).join("\n"));
  return parts.join("\n\n");
}

function tableMd(p: Props): string {
  const headers = asStringArray(p.headers);
  const rows = (Array.isArray(p.rows) ? p.rows : []).filter(
    (r): r is string[] => Array.isArray(r) && r.every((c) => typeof c === "string"),
  );

  if (headers.length === 0 && rows.length === 0) return "";
  // Markdown tables collapse newlines inside cells — replace with a space so
  // the table still parses cleanly downstream.
  const cleanCell = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");

  const headerLine = `| ${headers.map(cleanCell).join(" | ")} |`;
  const sepLine = `| ${headers.map(() => "---").join(" | ")} |`;
  const rowLines = rows.map(
    (r) => `| ${r.map(cleanCell).join(" | ")} |`,
  );
  return [headerLine, sepLine, ...rowLines].join("\n");
}

/** Serialize a Block[] recipe to a clean markdown document. */
export function blocksToMarkdown(blocks: Block[]): string {
  return blocks
    .map(blockMd)
    .filter((s) => s.length > 0)
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n");
}

/** Trigger a browser download of the given markdown text as `<filename>.md`. */
export function downloadAsMarkdown(blocks: Block[], filename: string) {
  const md = blocksToMarkdown(blocks);
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
