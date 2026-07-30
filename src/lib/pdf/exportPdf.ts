"use client";
/**
 * Convert a bill DOM node to a paginated A4 PDF using html2canvas + jsPDF.
 * Returns a Blob so it can be downloaded or shared via Web Share API.
 */
export async function generatePdfBlob(node: HTMLElement, options: { fileName?: string } = {}): Promise<Blob> {
  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");

  // A4 canvas: 794 x 1123 px at 96dpi (matches .bill-a4)
  const canvas = await html2canvas(node, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
    windowWidth: node.scrollWidth,
    windowHeight: node.scrollHeight,
  });

  const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgProps = { width: canvas.width, height: canvas.height };
  const ratio = pageW / imgProps.width;
  const imgHeightPt = imgProps.height * ratio;

  // If content taller than one page, slice it.
  if (imgHeightPt <= pageH) {
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, pageW, imgHeightPt);
  } else {
    const sliceHeightPx = Math.floor((pageH / ratio));
    let y = 0;
    let page = 0;
    while (y < canvas.height) {
      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = Math.min(sliceHeightPx, canvas.height - y);
      const ctx = sliceCanvas.getContext("2d");
      if (!ctx) break;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
      ctx.drawImage(canvas, 0, y, canvas.width, sliceCanvas.height, 0, 0, canvas.width, sliceCanvas.height);
      if (page > 0) pdf.addPage("a4", "portrait");
      pdf.addImage(sliceCanvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, pageW, sliceCanvas.height * ratio);
      y += sliceCanvas.height;
      page++;
    }
  }

  const blob = pdf.output("blob");
  if (options.fileName) {
    (blob as Blob & { name?: string }).name = options.fileName;
  }
  return blob;
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
