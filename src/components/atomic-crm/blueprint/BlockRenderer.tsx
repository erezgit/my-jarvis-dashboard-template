// BlockRenderer.tsx — MJOS-028
//
// The dashboard's self-owned content composition layer. Replaces @measured/puck.
//
// Doctrine (locked):
//   • Page content lives in `page_content.content` as a flat object:
//       { blocks: [ { type, props, children? }, ... ] }
//   • The TYPE is a string key into a `BlockConfig.components` map
//     (e.g. "Hero", "SectionHeader", "Deck", "CoverSlide").
//   • The PROPS are the React props for that component, verbatim.
//   • CHILDREN are nested blocks — used by slot/wrapper components
//     (e.g. <Deck> → slides). Children are passed to the parent component
//     as its React `children` prop, recursively rendered by BlockRenderer.
//
// This file is intentionally tiny. The complexity of the doctrine lives in
// the per-domain block libraries (ArchitectureBlocks.tsx, PitchDeckBlocks.tsx)
// — not in the renderer.

import type { ComponentType } from "react";

// ── Schema types ───────────────────────────────────────────────────────────
export type Block = {
  type: string;
  props: Record<string, unknown>;
  children?: Block[];
};

export type PageBlocks = { blocks: Block[] };

export type BlockConfig = {
  components: Record<string, ComponentType<Record<string, unknown> & { children?: React.ReactNode }>>;
};

// ── Renderer ───────────────────────────────────────────────────────────────
export function BlockRenderer({
  config,
  blocks,
}: {
  config: BlockConfig;
  blocks: Block[];
}) {
  return (
    <>
      {blocks.map((b, i) => {
        const Component = config.components[b.type];
        if (!Component) return null;
        const childrenEl = b.children?.length ? (
          <BlockRenderer config={config} blocks={b.children} />
        ) : undefined;
        const key = (b.props?.id as string | undefined) ?? `${b.type}-${i}`;
        return (
          <Component key={key} {...b.props}>
            {childrenEl}
          </Component>
        );
      })}
    </>
  );
}
