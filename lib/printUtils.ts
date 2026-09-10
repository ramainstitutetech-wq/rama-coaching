/**
 * Professional print utility for RCCACE certificates & marksheets.
 *
 * Uses a clean, isolated hidden <iframe> so that:
 * 1. ONLY the certificate or marksheet is printed (no headers, no navbars, no modals, no buttons, no scrollbars).
 * 2. Fits 100% cleanly on 1 single A4 portrait page.
 * 3. Preserves all colors, watermarks, stamps, and badges via exact print color adjust.
 * 4. Sets a clean document title (e.g. "RCCACE_Certificate_Rahul_Kumar") as default PDF filename.
 */

import type { CertificateData } from "@/types/certificate";

const SESSION_KEY = "rccace_print_data";

/**
 * Directly prints the document on the current screen using an isolated iframe.
 * No new tab required, no popup blockers, no UI chrome in the PDF.
 */
export function printCertificateDirectly(docTitle = "RCCACE_Document") {
  // Find the certificate element on the current page
  const target = document.querySelector<HTMLElement>(".doc-shell");
  if (!target) {
    window.print();
    return;
  }

  // Remove any previously created print iframe
  const existingIframe = document.getElementById("rccace-print-iframe");
  if (existingIframe) {
    existingIframe.remove();
  }

  // Create clean isolated iframe
  const iframe = document.createElement("iframe");
  iframe.id = "rccace-print-iframe";
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) {
    window.print();
    return;
  }

  // Collect all stylesheets from main page to preserve fonts and Tailwind/globals styles
  let stylesHtml = "";
  document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
    stylesHtml += node.outerHTML;
  });

  // Dedicated single-page A4 print styles
  const printStyles = `
    <style>
      @page {
        size: A4 portrait;
        margin: 0mm !important;
      }
      *, *::before, *::after {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
        box-sizing: border-box !important;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 210mm !important;
        height: 297mm !important;
        background: #ffffff !important;
        overflow: hidden !important;
      }
      .doc-scale-wrap {
        transform: none !important;
        width: 210mm !important;
        height: 297mm !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .doc-shell {
        position: relative !important;
        width: 210mm !important;
        height: 297mm !important;
        max-width: 210mm !important;
        max-height: 297mm !important;
        margin: 0 !important;
        padding: 12px !important;
        box-shadow: none !important;
        transform: none !important;
        page-break-inside: avoid !important;
        page-break-after: avoid !important;
        break-inside: avoid !important;
        overflow: hidden !important;
      }
      .doc-flow-header,
      .doc-flow-footer,
      .doc-shell .doc-flow-header,
      .doc-shell .doc-flow-footer {
        display: flex !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
    </style>
  `;

  // Write content to iframe
  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>${docTitle}</title>
        ${stylesHtml}
        ${printStyles}
      </head>
      <body>
        ${target.outerHTML}
      </body>
    </html>
  `);
  iframeDoc.close();

  // Trigger print after styles and images are ready
  const doPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.error("Print error, falling back to window.print():", err);
      window.print();
    } finally {
      // Clean up iframe after printing dialog closes
      setTimeout(() => {
        iframe.remove();
      }, 2500);
    }
  };

  // Wait for any images (logo, avatar, etc.) to load before printing
  const images = iframeDoc.querySelectorAll("img");
  if (images.length === 0) {
    setTimeout(doPrint, 300);
  } else {
    let loadedCount = 0;
    const total = images.length;
    const checkImages = () => {
      loadedCount++;
      if (loadedCount >= total) {
        setTimeout(doPrint, 200);
      }
    };
    images.forEach((img) => {
      if (img.complete) {
        checkImages();
      } else {
        img.onload = checkImages;
        img.onerror = checkImages;
      }
    });
    // Safety fallback timeout
    setTimeout(doPrint, 1200);
  }
}

/** Store data and open /print in a new tab if user wants a dedicated window */
export function openPrintPage(data: CertificateData, id?: string) {
  const type = data.documentType ?? "excellence";

  if (id) {
    window.open(
      `/print?id=${encodeURIComponent(id)}&type=${encodeURIComponent(type)}`,
      "_blank",
      "noopener,noreferrer"
    );
    return;
  }

  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {
    printCertificateDirectly();
    return;
  }
  window.open(
    `/print?session=1&type=${encodeURIComponent(type)}`,
    "_blank",
    "noopener,noreferrer"
  );
}

/** Retrieve session-stored print data (used inside /print page) */
export function getPrintSessionData(): CertificateData | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(SESSION_KEY);
    return JSON.parse(raw) as CertificateData;
  } catch {
    return null;
  }
}
