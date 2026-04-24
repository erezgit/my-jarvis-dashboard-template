import type { ComponentType } from "react";

type PageEntry = {
  path: string;
  label: string;
  component: ComponentType;
  sortKey: number;
  slug: string;
};

/**
 * Auto-discovers all methodology/theory-album/guides pages via Vite's
 * `import.meta.glob`. Each imported module exports exactly one React
 * component, and that component has a `.path` property attached (e.g.
 * `/methodology/001`). We use `.path` for routing and derive a short
 * label from the filename for display on the methodology index.
 *
 * To add a new page: drop a .tsx file into the appropriate folder —
 * no code changes here.
 */
function collect(
  modules: Record<string, unknown>,
  pathRegex: RegExp,
  numberRegex: RegExp,
  labelSlugRegex: RegExp,
  labelPrefix: (n: number, slug: string) => string,
): PageEntry[] {
  const entries: PageEntry[] = [];
  for (const [file, mod] of Object.entries(modules)) {
    const modObj = mod as Record<string, unknown>;
    const component = Object.values(modObj).find(
      (v) => typeof v === "function",
    ) as ComponentType | undefined;
    if (!component) continue;
    const path = (component as unknown as { path?: string }).path;
    if (!path || !pathRegex.test(path)) continue;
    const numMatch = file.match(numberRegex);
    const slugMatch = file.match(labelSlugRegex);
    const num = numMatch ? Number.parseInt(numMatch[1], 10) : 0;
    const slug = slugMatch ? slugMatch[1] : file;
    entries.push({
      path,
      component,
      sortKey: num,
      slug,
      label: labelPrefix(num, slug),
    });
  }
  return entries.sort((a, b) => a.sortKey - b.sortKey);
}

function humanize(slug: string): string {
  return slug.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim();
}

// ── Methodology cards ────────────────────────────────────────────────
const methodologyModules = import.meta.glob(
  "../../../pages/methodology/CARD_*.tsx",
  { eager: true },
);

export const methodologyCards = collect(
  methodologyModules,
  /^\/methodology\/\d+$/,
  /CARD_(\d+)_/,
  /CARD_\d+_([^.]+)\.tsx$/,
  (n, slug) => `כרטיסייה ${String(n).padStart(3, "0")} · ${humanize(slug)}`,
);

// ── Theory album chapters ────────────────────────────────────────────
const theoryAlbumModules = import.meta.glob(
  "../../../pages/theory-album/CHAPTER_*.tsx",
  { eager: true },
);

export const theoryAlbumChapters = collect(
  theoryAlbumModules,
  /^\/theory-album\/\d+$/,
  /CHAPTER_(\d+)\.tsx$/,
  /CHAPTER_(\d+)\.tsx$/,
  (n) => `פרק ${n}`,
);

// ── Guides ───────────────────────────────────────────────────────────
const guideModules = import.meta.glob(
  "../../../pages/guides/GUIDE_*.tsx",
  { eager: true },
);

export const guides = collect(
  guideModules,
  /^\/guides\/[\w-]+$/,
  /GUIDE_(\d+)_/,
  /GUIDE_\d+_([^.]+)\.tsx$/,
  (n, slug) => `מדריך ${String(n).padStart(3, "0")} · ${humanize(slug)}`,
);

/** Flat list of every importable content route. */
export const allContentRoutes: PageEntry[] = [
  ...methodologyCards,
  ...theoryAlbumChapters,
  ...guides,
];
