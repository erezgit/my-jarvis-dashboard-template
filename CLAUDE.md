# MyJarvis OS

At session start, read the OS Guide from the Knowledge Base:

```sql
SELECT content FROM page_content WHERE page_slug = 'kb-doc/os-guide';
```

This is the complete guide for developing on MyJarvis OS — architecture, page types, section data shapes, coding standards, database patterns, and safety rules.

Use the Supabase MCP to run this query. The result is a JSON object with title, subtitle, and sections array. Read each section to understand the system before making changes.

## Quick Reference

- **Supabase project:** xtkfuchjmeekofeuplfu
- **GitHub:** https://github.com/erezgit/my-jarvis-os.git
- **Live site:** https://my-jarvis-os.vercel.app
- **Two page types:** Structure Pages (custom TSX) + Content Pages (kb-doc/* sections in page_content)
- **13 section types:** decisions, action_items, timeline, debates, deep_dives, open_questions, contacts, key_value, markdown, table, checklist, kpi_cards, transcript

## Sidebar Philosophy

**The sidebar is the Kanban board.** It shows what matters right now — not everything that exists.

### Tiers (top to bottom)

1. **Golden Image** — Pages Erez + Yaron both reviewed and agreed on. Represents the business. Nobody adds or removes without both signing off.
2. **Yaron's Area** — Up to 6 pages. Yaron's active workstreams.
3. **Erez's Area** — Up to 6 pages. Erez's active workstreams.
4. **Project Sections** — Side projects (e.g., MyJarvis Voice under Erez). Each person can create project sections under their area.
5. **Knowledge Base** — Always the last entry. The archive. When a page is done and no longer actively worked on, move it here.

### Rules

- **Max 6 pages per person** in their area. If you need a 7th, move something to the Knowledge Base first.
- **Sidebar = what we're working on NOW.** If it's not active, it doesn't belong in the sidebar.
- **Knowledge Base is the filing cabinet.** Done pages, reference docs, old tickets — they all live there. Searchable, browsable, but out of the way.
- **Don't add pages to the sidebar without asking.** Always confirm with the user before adding a new sidebar entry. The sidebar is sacred.

### Adding a page to the sidebar

Follow the three-file recipe:
1. Create the TSX component with `(Component as any).path = "/route"`
2. Register the route in `CRM.tsx`
3. Add to the correct array in `CrmSidebar.tsx`: `sharedItems` (golden image), `yaronItems`, `erezItems`, or a project section

### Moving a page to Knowledge Base

1. Remove from the sidebar array in `CrmSidebar.tsx`
2. Keep the route in `CRM.tsx` (pages remain accessible by URL)
3. The KB list page at `/knowledge-base` shows all `page_content` entries automatically
