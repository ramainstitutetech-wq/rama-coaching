"use client";

import { useRef } from "react";
import { Printer, FileDown } from "lucide-react";
import type { CertificateData } from "@/types/certificate";
import { ExcellenceCertificate } from "./ExcellenceCertificate";
import { Marksheet } from "./MarkSheet";
import { useFitScale } from "@/lib/useFitScale";
import { printCertificateDirectly } from "@/lib/printUtils";

const DOC_WIDTH: Record<CertificateData["documentType"], number> = {
  excellence: 794,
  marksheet:  794,
};

const DOC_HEIGHT: Record<CertificateData["documentType"], number> = {
  excellence: 1123,
  marksheet:  1123,
};

export function CertificatePreview({
  data,
  hideToolbar = false,
}: {
  data: CertificateData | null;
  hideToolbar?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const baseWidth    = data ? DOC_WIDTH[data.documentType] : 966;
  const scale        = useFitScale(containerRef, baseWidth);

  const handlePrint = () => {
    if (!data) return;
    const docName = `RCCACE_${data.documentType === "marksheet" ? "Marksheet" : "Certificate"}_${data.studentName?.replace(/\s+/g, "_") || "Document"}`;
    printCertificateDirectly(docName);
  };

  return (
    <section className="preview" aria-label="Certificate preview">
      {!hideToolbar ? (
        <div className="preview-toolbar no-print">
          <div className="preview-toolbar-title">
            <span className="preview-toolbar-eyebrow">Live Preview</span>
            <span className="preview-toolbar-heading">
              {data
                ? data.documentType === "marksheet"
                  ? "Marksheet"
                  : "Certificate of Excellence"
                : "Document"}
            </span>
          </div>
          <button
            type="button"
            className="btn-print"
            onClick={handlePrint}
            disabled={!data}
          >
            <Printer size={16} />
            Print / Save as PDF
          </button>
        </div>
      ) : null}

      <div className="preview-stage" ref={containerRef}>
        {data ? (
          <div
            className={`doc-scale-wrap certificate-print-wrapper print-${data.documentType}`}
            style={
              {
                ["--cert-scale" as string]: scale,
                width:  `calc(${baseWidth}px * var(--cert-scale))`,
                height: `calc(${DOC_HEIGHT[data.documentType]}px * var(--cert-scale))`,
              } as React.CSSProperties
            }
          >
            {data.documentType === "marksheet" ? (
              <Marksheet data={data} />
            ) : (
              <ExcellenceCertificate data={data} />
            )}
          </div>
        ) : (
          <div className="preview-empty">
            <FileDown size={28} strokeWidth={1.4} />
            <p className="preview-empty-title">No document generated yet</p>
            <p className="preview-empty-text">
              Choose a document type, fill in the details on the left, then click{" "}
              <strong>Generate</strong> to see the result here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
