import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

/**
 * Snapshot a single DOM element and save it as a landscape A4 PDF.
 */
export async function downloadElementAsPdf(el, filename = 'export') {
  if (!el) {
    console.warn('downloadElementAsPdf: no element to capture for', filename);
    return;
  }
  try {
    const dataUrl = await toPng(el, { pixelRatio: 2, backgroundColor: '#ffffff' });
    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve) => {
      img.onload = resolve;
    });
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (img.height * pdfWidth) / img.width;
    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${filename}.pdf`);
  } catch (err) {
    console.error('PDF export error:', err);
  }
}

/**
 * Download button handler for a card. Walks up the DOM from the click target
 * to the nearest [data-card] wrapper and exports that whole card.
 * Mirrors `downloadCardAsPdf` from the Next.js dashboard.
 */
export async function downloadCardAsPdf(e, title) {
  e?.preventDefault?.();
  e?.stopPropagation?.();
  const target = e?.currentTarget || e?.target;
  const card = target?.closest?.('[data-card]') || target?.parentElement?.closest?.('[data-card]');
  if (!card) {
    console.warn('downloadCardAsPdf: could not find enclosing [data-card] for', title);
    return;
  }
  await downloadElementAsPdf(card, title);
}

/**
 * Stitch several sections (by element id) into one multi-page PDF.
 * Mirrors `downloadFumAsPdf` from the Next.js dashboard, generalised to any set of ids.
 */
export async function downloadSectionsAsPdf(ids, filename = 'export') {
  try {
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    let pageAdded = false;
    for (const id of ids) {
      const el = document.getElementById(id);
      if (!el) continue;
      const dataUrl = await toPng(el, { pixelRatio: 2, backgroundColor: '#ffffff' });
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      const pdfHeight = (img.height * pdfWidth) / img.width;
      if (pageAdded) pdf.addPage();
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pageAdded = true;
    }
    pdf.save(`${filename}.pdf`);
  } catch (err) {
    console.error('PDF export error:', err);
  }
}
