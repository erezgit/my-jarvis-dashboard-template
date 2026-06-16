// DOM → PDF export, single tall page.
//
// Strategy: render the element to a high-DPI canvas via html-to-image
// (pixelRatio 2 for crisp text on retina + print), then drop the entire
// canvas onto ONE PDF page sized to fit the full height. The page width
// stays A4 (210 mm) with 12 mm margins; the page height grows to whatever
// the content needs.
//
// MJ-128 follow-up: meeting-prep and KB docs read better as one continuous
// page (matching the live page) than as 2–3 A4 pages with whitespace gaps
// and hard breaks. The smart-pagination slicer was the right primitive for
// truly print-bound output, but for the actual KB use case the single tall
// page wins on legibility and on share / scroll ergonomics.
//
// Caller signature is unchanged: `downloadAsPdf(element, filename)`.

export async function downloadAsPdf(
  element: HTMLElement,
  filename: string,
) {
  const [{ toCanvas }, { default: jsPDF }] = await Promise.all([
    import("html-to-image"),
    import("jspdf"),
  ]);

  await document.fonts.ready;

  const fullCanvas = await toCanvas(element, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: "#FFFFFF",
  });
  const fullW = fullCanvas.width;
  const fullH = fullCanvas.height;

  // A4-width page, mm.
  const PAGE_W = 210;
  const MARGIN = 12;
  const printableW = PAGE_W - MARGIN * 2;

  // Map captured canvas pixels to printable-area millimetres at the chosen
  // pixel ratio, then size the page so the full canvas lands on it intact.
  const canvasPxPerMm = fullW / printableW;
  const contentHeightMm = fullH / canvasPxPerMm;
  const pageHeightMm = contentHeightMm + MARGIN * 2;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [PAGE_W, pageHeightMm],
    compress: true,
  });

  const dataUrl = fullCanvas.toDataURL("image/jpeg", 0.92);
  pdf.addImage(
    dataUrl,
    "JPEG",
    MARGIN,
    MARGIN,
    printableW,
    contentHeightMm,
    undefined,
    "FAST",
  );

  pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}
