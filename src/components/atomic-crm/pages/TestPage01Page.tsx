import { PageShell, SectionCard } from "@/components/page";
import { FlaskConical } from "lucide-react";

export function TestPage01Page() {
  return (
    <PageShell
      icon={FlaskConical}
      iconColor="violet"
      title="Test Page 01"
      subtitle="Demo page with three sections of placeholder content."
    >
      <SectionCard
        title="Section One — Overview"
        subtitle="A high-level summary of what this section covers."
      >
        <p className="text-sm text-muted-foreground leading-relaxed">
          This is demo content for section one. It gives a broad overview of the
          topic at hand. In a real page, this area would contain meaningful data,
          summaries, or actionable information relevant to the user's workflow.
          For now it serves as a visual placeholder so you can see how the layout
          and typography feel in context.
        </p>
      </SectionCard>

      <SectionCard
        title="Section Two — Details"
        subtitle="A closer look at specific items or metrics."
      >
        <ul className="divide-y divide-border/60">
          {[
            { label: "Item Alpha", value: "Demo value for item alpha" },
            { label: "Item Beta", value: "Demo value for item beta" },
            { label: "Item Gamma", value: "Demo value for item gamma" },
          ].map(({ label, value }) => (
            <li key={label} className="flex justify-between py-2 text-sm">
              <span className="font-medium text-foreground">{label}</span>
              <span className="text-muted-foreground">{value}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard
        title="Section Three — Notes"
        subtitle="Free-form observations or next steps."
      >
        <p className="text-sm text-muted-foreground leading-relaxed">
          This is demo content for section three. Use this area for notes,
          reflections, or any open-ended information that doesn't fit neatly
          into the structured sections above. Content here can be replaced with
          real data at any time — the layout will adapt automatically.
        </p>
      </SectionCard>
    </PageShell>
  );
}
