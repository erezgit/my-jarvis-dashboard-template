import { Mail, Phone, UserCircle2 } from "lucide-react";
import type { ContactsSection } from "../types";

export function ContactsSection({ section }: { section: ContactsSection }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {section.items.map((item, i) => (
        <div key={i} className="rounded-lg border p-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <UserCircle2 className="h-4 w-4 text-muted-foreground" />
            {item.name}
          </div>
          {item.role && <div className="mt-0.5 text-xs text-muted-foreground">{item.role}</div>}
          {item.phone && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-foreground">
              <Phone className="h-3 w-3 text-muted-foreground" />
              {item.phone}
            </div>
          )}
          {item.email && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-foreground">
              <Mail className="h-3 w-3 text-muted-foreground" />
              {item.email}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
