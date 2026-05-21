import type { jsPDF } from 'jspdf'

/**
 * Renders a canvas into a jsPDF document, spanning multiple pages when needed.
 * Uses the PDF's own page dimensions so the page-break offset is always exact.
 *
 * Two thresholds prevent ghost pages:
 *
 * SINGLE_PAGE_TOLERANCE_MM (2 mm) — if the image is only marginally taller than
 * one A4 page (e.g. 297.3 mm), it is scaled down uniformly to fit rather than
 * opening a second page that would be almost entirely blank.
 *
 * MIN_REMAINING_MM (0.5 mm) — in multi-page mode the while-loop stops when the
 * remaining strip is shorter than this value, avoiding a last page that contains
 * only a sub-millimetre sliver of content (invisible / white in JPEG).
 */

const SINGLE_PAGE_TOLERANCE_MM = 2
const MIN_REMAINING_MM = 0.5

export function canvasToPdfPages(
  pdf: jsPDF,
  canvas: HTMLCanvasElement,
  imageQuality = 0.98
): void {
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  const imgData = canvas.toDataURL('image/jpeg', imageQuality)
  const imgHeight = (canvas.height * pageWidth) / canvas.width

  // Single-page: fits exactly, or overflows by less than the tolerance — scale
  // down uniformly so the content fills one page without a phantom second page.
  if (imgHeight <= pageHeight + SINGLE_PAGE_TOLERANCE_MM) {
    const scale = imgHeight > pageHeight ? pageHeight / imgHeight : 1
    const drawWidth = pageWidth * scale
    const drawHeight = imgHeight * scale
    const xOffset = (pageWidth - drawWidth) / 2
    pdf.addImage(imgData, 'JPEG', xOffset, 0, drawWidth, drawHeight)
    return
  }

  // Multi-page: render the full image shifted upward on each page.
  let heightLeft = imgHeight
  let position = 0

  pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight)
  heightLeft -= pageHeight

  while (heightLeft > MIN_REMAINING_MM) {
    position = heightLeft - imgHeight
    pdf.addPage()
    pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight)
    heightLeft -= pageHeight
  }
}
