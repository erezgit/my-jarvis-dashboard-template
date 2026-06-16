// Pitch-deck → landscape PDF, one slide per page.
//
// Unlike `download-pdf.ts` (a single tall portrait page — right for a KB doc
// that scrolls), a pitch deck is a set of fixed-frame landscape slides. Only
// one slide is visible on screen at a time (the others are absolutely stacked
// at opacity 0), so we can't screenshot the live element once and get the
// whole deck. Instead we:
//
//   1. Clone the deck container OFFSCREEN. The clone is detached from React,
//      so revealing slides imperatively won't fight the <Deck> render effect
//      that toggles active/inactive styles on every re-render.
//   2. Hide the bottom nav bar in the clone (it shouldn't print on every page).
//   3. For each `[data-slide]` section: reveal just that one, capture the
//      whole clone to a high-DPI canvas, and add it as one landscape PDF page
//      sized to the deck's on-screen aspect ratio.
//
// Captured at the deck's live pixel dimensions, so vw/vh-based font sizes and
// padding resolve to exactly what's on screen.

const DECK_BG = "#F2F7FD"; // PitchDeckBlocks T.bg — the slide canvas color.

export async function downloadDeckAsPdf(element: HTMLElement, filename: string) {
  const [{ toCanvas }, { default: jsPDF }] = await Promise.all([
    import("html-to-image"),
    import("jspdf"),
  ]);

  await document.fonts.ready;

  const rect = element.getBoundingClientRect();
  const W = Math.max(1, Math.round(rect.width));
  const H = Math.max(1, Math.round(rect.height));

  // Offscreen host at the deck's exact size.
  const host = document.createElement("div");
  host.style.cssText = `position:fixed; left:-100000px; top:0; width:${W}px; height:${H}px; overflow:hidden; pointer-events:none; z-index:-1;`;

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = `${W}px`;
  clone.style.height = `${H}px`;
  clone.style.position = "relative";
  clone.style.inset = "auto";
  host.appendChild(clone);
  document.body.appendChild(host);

  try {
    // Hide the deck's bottom nav bar (absolute inset-x-0 bottom-0) and any
    // audio elements — they're chrome, not slide content.
    clone
      .querySelectorAll<HTMLElement>('[class*="bottom-0"]')
      .forEach((el) => {
        el.style.display = "none";
      });

    const slides = Array.from(
      clone.querySelectorAll<HTMLElement>("[data-slide]"),
    );
    if (slides.length === 0) {
      throw new Error("No slides found in deck.");
    }

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [W, H],
      compress: true,
    });

    for (let i = 0; i < slides.length; i++) {
      slides.forEach((s, j) => {
        const active = j === i;
        s.style.transition = "none";
        s.style.transform = "none";
        s.style.opacity = active ? "1" : "0";
        s.style.visibility = active ? "visible" : "hidden";
        s.style.pointerEvents = "none";
      });

      const canvas = await toCanvas(clone, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: DECK_BG,
        width: W,
        height: H,
      });
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

      if (i > 0) pdf.addPage([W, H], "landscape");
      pdf.addImage(dataUrl, "JPEG", 0, 0, W, H, undefined, "FAST");
    }

    pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
  } finally {
    document.body.removeChild(host);
  }
}
