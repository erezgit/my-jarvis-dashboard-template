// Content types for the KB / page_content renderer.
// These mirror OS's 13 section types and stay tenant-agnostic.

export type MarkdownSection = { type: "markdown"; body: string };

export type KeyValueSection = {
  type: "key_value";
  items: { label: string; value: string }[];
};

export type ChecklistSection = {
  type: "checklist";
  items: { text: string; done: boolean }[];
};

export type TableSection = {
  type: "table";
  headers: string[];
  rows: (string | number | null)[][];
};

export type TimelineSection = {
  type: "timeline";
  items: { date: string; title: string; body?: string }[];
};

export type ContactsSection = {
  type: "contacts";
  items: { name: string; role?: string; phone?: string; email?: string }[];
};

export type DecisionsSection = {
  type: "decisions";
  items: { q: string; decision: string; rationale?: string }[];
};

export type ActionItemsSection = {
  type: "action_items";
  items: { text: string; status?: "todo" | "done" | "in_progress" }[];
};

export type OpenQuestionsSection = {
  type: "open_questions";
  items: string[];
};

export type KpiCardsSection = {
  type: "kpi_cards";
  items: { label: string; value: string; trend?: "up" | "down" | "flat" }[];
};

export type DeepDivesSection = {
  type: "deep_dives";
  items: { title: string; body: string }[];
};

export type DebatesSection = {
  type: "debates";
  items: { position: string; for: string; against: string }[];
};

export type TranscriptSection = {
  type: "transcript";
  speakers: { name: string; line: string }[];
};

export type Section =
  | MarkdownSection
  | KeyValueSection
  | ChecklistSection
  | TableSection
  | TimelineSection
  | ContactsSection
  | DecisionsSection
  | ActionItemsSection
  | OpenQuestionsSection
  | KpiCardsSection
  | DeepDivesSection
  | DebatesSection
  | TranscriptSection;

// Each section gets an optional heading that renders above it.
export type SectionWithHeading = Section & { heading?: string };

export type PageContent = {
  title: string;
  subtitle?: string;
  sections: SectionWithHeading[];
};

// DB row shape in Neon `page_content`.
export type PageContentRow = {
  id: number;
  page_slug: string;
  content: PageContent;
  updated_at: string;
};

// List-page row (lighter)
export type PageContentListItem = {
  page_slug: string;
  title: string;
  updated_at: string;
};
