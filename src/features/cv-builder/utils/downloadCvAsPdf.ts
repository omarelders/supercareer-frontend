/**
 * downloadCvAsPdf.ts
 *
 * Captures a rendered CV DOM node with html2canvas and exports it as a
 * high-quality, single-page (auto-height) PDF via jsPDF.
 *
 * Usage:
 *   await downloadCvAsPdf(element, 'My CV.pdf')
 */

export async function downloadCvAsPdf(
  element: HTMLElement,
  filename = 'CV.pdf',
): Promise<void> {
  // Dynamic imports keep jsPDF + html2canvas out of the initial bundle
  const html2canvas = (await import('html2canvas')).default
  const { jsPDF } = await import('jspdf')

  // Capture the element at 2× resolution for crisp text
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  })

  const imgWidth = 210 // A4 width in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width // maintain aspect ratio

  const pdf = new jsPDF({
    orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
    unit: 'mm',
    format: [imgWidth, imgHeight], // custom height so entire CV fits in one page
  })

  const imgData = canvas.toDataURL('image/png')
  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
  pdf.save(filename)
}
