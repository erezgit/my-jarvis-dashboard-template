import type { MarkdownSection } from "../types";

// v1: render as preformatted text. v2: add `react-markdown` dep for real rendering.
// This choice is deliberate — zero new deps needed to land the renderer,
// and all 251 OS KB rows have markdown that reads fine monospaced.
export function MarkdownSection({ section }: { section: MarkdownSection }) {
  return (
    <div className="prose prose-sm max-w-none">
      <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-foreground">
        {section.body}
      </pre>
    </div>
  );
}
