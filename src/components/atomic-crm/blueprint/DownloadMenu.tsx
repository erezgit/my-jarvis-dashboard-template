// DownloadMenu — top-right dropdown on KB detail pages.
//
// Two actions:
//   • PDF — html-to-image screenshot of pageRef, embedded into a jsPDF
//     document that matches the element's exact dimensions. Looks identical
//     to what the user sees on screen.
//   • Markdown — clean per-block serializer over the BlockRenderer recipe
//     in `blocks`. No DOM walking — the recipe is canonical.
//
// Wired into KbBlueprintPage so every /kb-doc/* page gets it for free.
// mode="deck" (PitchDocBlueprintPage): landscape one-page-per-slide PDF +
// pitch-deck slide markdown instead of the portrait KB variants.

import { useState, type RefObject } from "react";
import { Download, FileText, FileType2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { downloadAsPdf } from "@/lib/download-pdf";
import { downloadAsMarkdown } from "@/lib/download-md";
import { downloadDeckAsPdf } from "@/lib/download-deck-pdf";
import { downloadDeckAsMarkdown } from "@/lib/download-deck-md";
import type { Block } from "./BlockRenderer";

interface DownloadMenuProps {
  pageRef: RefObject<HTMLElement | null>;
  blocks: Block[];
  /** Used for the saved filename (without extension). */
  filename: string;
  /**
   * "doc" (default) — KB detail page: single tall portrait PDF + architecture
   * markdown. "deck" — pitch deck: one landscape page per slide + slide
   * markdown.
   */
  mode?: "doc" | "deck";
}

export function DownloadMenu({
  pageRef,
  blocks,
  filename,
  mode = "doc",
}: DownloadMenuProps) {
  const [busy, setBusy] = useState<"pdf" | null>(null);

  async function handlePdf() {
    if (!pageRef.current || busy) return;
    setBusy("pdf");
    try {
      if (mode === "deck") {
        await downloadDeckAsPdf(pageRef.current, `${filename}.pdf`);
      } else {
        await downloadAsPdf(pageRef.current, `${filename}.pdf`);
      }
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setBusy(null);
    }
  }

  function handleMarkdown() {
    try {
      if (mode === "deck") {
        downloadDeckAsMarkdown(blocks, filename);
      } else {
        downloadAsMarkdown(blocks, filename);
      }
    } catch (err) {
      console.error("Markdown export failed:", err);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={busy !== null}>
          <Download className="mr-1.5 h-3.5 w-3.5" />
          {busy === "pdf" ? "Building PDF…" : "Download"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={handlePdf} disabled={busy !== null}>
          <FileType2 className="mr-2 h-4 w-4" />
          PDF
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleMarkdown}>
          <FileText className="mr-2 h-4 w-4" />
          Markdown
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
