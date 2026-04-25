import { useState, type ReactNode } from "react";
import { CrmSidebar } from "./CrmSidebar";
import { VoicePanel, VoicePanelToggle } from "@/components/voice/VoicePanel";

// Shell layout: left sidebar (nav), main content, right voice panel. The
// panel is a real layout column that grows from 0 to 400px instead of
// overlaying — content naturally reflows. The floating MessageCircle
// trigger only renders when the panel is closed; the panel's own close
// button handles the other direction.
export const Layout = ({ children }: { children: ReactNode }) => {
  const [voicePanelOpen, setVoicePanelOpen] = useState(true);
  return (
    <div className="flex h-svh">
      <CrmSidebar />
      <main className="relative flex-1 overflow-auto bg-background">
        {!voicePanelOpen && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-end px-6 py-4">
            <div className="pointer-events-auto">
              <VoicePanelToggle onClick={() => setVoicePanelOpen(true)} />
            </div>
          </div>
        )}
        <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
      </main>
      <VoicePanel open={voicePanelOpen} onClose={() => setVoicePanelOpen(false)} />
    </div>
  );
};
