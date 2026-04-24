# KB renderer — preview components

Tenant-agnostic renderer for the `page_content` table. Lifts cleanly into the Dashboard template once Atlas provisions it; runs identically against Daniel (0 rows), Flame King (7 rows), and OS-merged (251 rows).

## Files

```
preview-components/kb/
├── types.ts                        # PageContent + 13 Section unions
├── SectionRenderer.tsx             # switch on section.type
├── KbPage.tsx                      # <KbPage slug> — queries /api/kb/:slug
├── KnowledgeBasePage.tsx           # /knowledge-base — searchable list
├── sections/
│   ├── MarkdownSection.tsx         # v1 preformatted; v2 react-markdown
│   ├── KeyValueSection.tsx
│   ├── ChecklistSection.tsx
│   ├── TableSection.tsx
│   ├── TimelineSection.tsx
│   ├── ContactsSection.tsx
│   ├── DecisionsSection.tsx
│   ├── ActionItemsSection.tsx
│   ├── OpenQuestionsSection.tsx
│   ├── KpiCardsSection.tsx
│   ├── DeepDivesSection.tsx
│   ├── DebatesSection.tsx
│   ├── TranscriptSection.tsx
│   └── UnknownSection.tsx          # safety net — renders warning for unregistered types
└── fixtures/
    └── all-section-types.json      # one row covering all 13 types + an unknown type
```

## Design principles

- **Zero new deps**. Uses only `lucide-react`, Tailwind, `@tanstack/react-query`, `react-router-dom` — all already in the Erez template.
- **No tenant coupling**. No references to Daniel / Flame King / OS paths.
- **Safety-first switch**. Unknown `section.type` renders a yellow warning card with JSON dump, never crashes the page.
- **Semantic HTML**. `<article>` / `<section>` / `<h2>` / `<dl>` — a11y-friendly.
- **Dark-mode-ready**. Every color uses Tailwind tokens (`text-foreground`, `bg-muted`, etc.) — respects the template's theme.

## Expected backend contract

`GET /api/kb/:slug` → `{ content: PageContent }`
`GET /api/kb` → `PageContentListItem[]`

CF Pages Function reads `page_content` from Neon. The renderer is backend-agnostic — any endpoint that returns the right shape works.

## Fixture for isolated dev

`fixtures/all-section-types.json` — one synthetic page covering every renderer + a deliberate unknown type. Import in a dev route / Storybook to verify visual parity without a backend:

```tsx
import fixture from './fixtures/all-section-types.json';
<KbPage slug={fixture.page_slug} />
// OR for pure render (no fetch):
<KbLayout content={fixture.content} />
```

## Hoist plan

When Atlas's template lands:

1. Copy `preview-components/kb/` -> `src/components/kb/` in the template repo.
2. Add `/kb/*` and `/knowledge-base` routes in the template's `CRM.tsx`.
3. Add CF Pages Functions for `GET /api/kb/:slug` and `GET /api/kb` hitting Neon.
4. Delete this `preview-components/` directory.

Zero code changes needed during the lift.

## Not included (deferred to phase 2)

- **Inline editing** — for v1, renderer is read-only. Editing comes from `EditableText` + `useContentPage` hooks ported from Daniel.
- **Real markdown parsing** — `MarkdownSection` renders as preformatted text. Add `react-markdown` when needed.
- **Server-side search** — list page does client-side filter for now. Swap to SQL search when OS-merged's 251 rows demand it.
