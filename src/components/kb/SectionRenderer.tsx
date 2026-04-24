import type { Section, SectionWithHeading } from "./types";
import { MarkdownSection } from "./sections/MarkdownSection";
import { KeyValueSection } from "./sections/KeyValueSection";
import { ChecklistSection } from "./sections/ChecklistSection";
import { TableSection } from "./sections/TableSection";
import { TimelineSection } from "./sections/TimelineSection";
import { ContactsSection } from "./sections/ContactsSection";
import { DecisionsSection } from "./sections/DecisionsSection";
import { ActionItemsSection } from "./sections/ActionItemsSection";
import { OpenQuestionsSection } from "./sections/OpenQuestionsSection";
import { KpiCardsSection } from "./sections/KpiCardsSection";
import { DeepDivesSection } from "./sections/DeepDivesSection";
import { DebatesSection } from "./sections/DebatesSection";
import { TranscriptSection } from "./sections/TranscriptSection";
import { UnknownSection } from "./sections/UnknownSection";

function renderBody(section: Section) {
  switch (section.type) {
    case "markdown":        return <MarkdownSection section={section} />;
    case "key_value":       return <KeyValueSection section={section} />;
    case "checklist":       return <ChecklistSection section={section} />;
    case "table":           return <TableSection section={section} />;
    case "timeline":        return <TimelineSection section={section} />;
    case "contacts":        return <ContactsSection section={section} />;
    case "decisions":       return <DecisionsSection section={section} />;
    case "action_items":    return <ActionItemsSection section={section} />;
    case "open_questions":  return <OpenQuestionsSection section={section} />;
    case "kpi_cards":       return <KpiCardsSection section={section} />;
    case "deep_dives":      return <DeepDivesSection section={section} />;
    case "debates":         return <DebatesSection section={section} />;
    case "transcript":      return <TranscriptSection section={section} />;
    default:                return <UnknownSection section={section as { type: string }} />;
  }
}

export function SectionRenderer({ section }: { section: SectionWithHeading }) {
  return (
    <section className="space-y-2">
      {section.heading && (
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {section.heading}
        </h2>
      )}
      {renderBody(section)}
    </section>
  );
}
