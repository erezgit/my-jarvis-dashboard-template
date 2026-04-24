/**
 * Normalize a session/methodology/guide markdown body before rendering.
 *
 * Strips two patterns that leak in from the import pipeline and would
 * otherwise show up as raw characters in the UI:
 *
 *   1. HTML comment breadcrumbs like `<!-- מקור: לקוחות/.../x.md -->` —
 *      these are source-path hints from the Fly.io import, not content.
 *   2. A leading `# title` header that duplicates the session heading /
 *      breadcrumb shown above the body by the page itself.
 *
 * Returns the cleaned markdown string, safe to hand to <GuideMarkdown>.
 */
export function cleanMarkdownBody(body: string | null | undefined): string {
  if (!body) return "";
  let s = body.replace(/\r\n/g, "\n");

  // Strip HTML comments (non-greedy, multi-line)
  s = s.replace(/<!--[\s\S]*?-->/g, "");

  // Trim leading blank space produced by the comment strip.
  s = s.replace(/^\s+/, "");

  // If the first non-blank line is an H1, drop it (the page already
  // shows the title in its own header). We only strip ONE such line.
  s = s.replace(/^#[ \t]+[^\n]*\n+/, "");

  return s.trim();
}

/**
 * Extract two-letter initials from a Hebrew or English name.
 * "אור" → "א", "סיון ואורי" → "סו" (first letter of first two words),
 * "Smoke Lilach Client" → "SL".
 */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1);
  return (parts[0].slice(0, 1) + parts[parts.length - 1].slice(0, 1)).trim();
}
