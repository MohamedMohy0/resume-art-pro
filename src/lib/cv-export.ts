import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * Export an HTMLElement to a multi-page A4 PDF.
 * Uses html2canvas so Arabic text is preserved as rendered pixels — no font embedding needed.
 */
export async function exportElementToPdf(el: HTMLElement, filename = "cv.pdf") {
  await document.fonts.ready;
  await new Promise((r) => setTimeout(r, 500));

  const canvas = await html2canvas(el, {
  scale: 2,
  useCORS: true,
  backgroundColor: "#ffffff",

  onclone: (document) => {
    const style = document.createElement("style");

    style.innerHTML = `
      * {
        color: rgb(0,0,0) !important;
        border-color: rgb(220,220,220) !important;
      }

      body {
        background: white !important;
      }
    `;

    document.head.appendChild(style);
  }
});

  const pdf = new jsPDF("p", "mm", "a4");

  const imgWidth = 210;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const imgData = canvas.toDataURL("image/jpeg", 1.0);

  pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
  pdf.save(filename);
}
