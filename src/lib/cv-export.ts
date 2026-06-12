/**
 * Export the CV preview as a PDF using the browser's native print engine.
 * This guarantees perfect Arabic shaping/ligatures (html2canvas mangles them),
 * matches the on-screen rendering exactly, and produces selectable text.
 */
export async function exportElementToPdf(el: HTMLElement, filename = "cv.pdf") {
  await document.fonts.ready;

  // Collect current page stylesheets so the printed document looks identical.
  const styleTags = Array.from(document.querySelectorAll('style'))
    .map((s) => `<style>${s.innerHTML}</style>`).join('\n');
  const linkTags = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .map((l) => l.outerHTML).join('\n');

  const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<title>${filename.replace(/\.pdf$/i, '')}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Tajawal:wght@400;500;700&display=swap">
${linkTags}
${styleTags}
<style>
  @page { size: A4; margin: 0; }
  html, body { margin: 0; padding: 0; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: 'Cairo','Tajawal',system-ui,sans-serif; }
  .cv-print-root {
    width: 210mm;
    height: 297mm;
    overflow: hidden;
    page-break-after: avoid;
    page-break-inside: avoid;
    break-after: avoid;
    break-inside: avoid;
  }
  /* Force the inner CV to exactly fill one A4 page (no min-height overflow). */
  .cv-print-root > * {
    width: 210mm !important;
    height: 297mm !important;
    min-height: 0 !important;
    max-height: 297mm !important;
    overflow: hidden !important;
    box-sizing: border-box !important;
  }
  .cv-print-root, .cv-print-root * { page-break-inside: avoid; break-inside: avoid; }
  @media print { body { margin: 0; } }
</style>
</head>
<body>
  <div class="cv-print-root" dir="rtl">${el.innerHTML}</div>
  <script>
    (async function(){
      try { await document.fonts.ready; } catch(e) {}
      // Wait a tick so layout and images settle
      await new Promise(r => setTimeout(r, 300));
      window.focus();
      window.print();
    })();
  <\/script>
</body>
</html>`;

  const w = window.open('', '_blank', 'width=900,height=1100');
  if (!w) {
    throw new Error('تعذر فتح نافذة الطباعة. يرجى السماح بالنوافذ المنبثقة.');
  }
  w.document.open();
  w.document.write(html);
  w.document.close();

  // Close window after print dialog is dismissed.
  w.addEventListener('afterprint', () => w.close());
}
