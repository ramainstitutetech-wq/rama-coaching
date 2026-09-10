/**
 * /print  — Dedicated, bare print page.
 *
 * No portal layout, no header, no sidebar — only the certificate or marksheet.
 * Auto-triggers window.print() 600 ms after mount.
 *
 * URL variants:
 *   /print?id=<certId>&type=excellence|marksheet   → fetch from API by ID
 *   /print?session=1&type=excellence|marksheet     → read from sessionStorage (live preview)
 */
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ExcellenceCertificate } from "@/components/certificate/ExcellenceCertificate";
import { Marksheet } from "@/components/certificate/MarkSheet";
import type { CertificateData } from "@/types/certificate";
import { SAMPLE_CERTIFICATE, DEFAULT_SUBJECTS } from "@/lib/defaults";
import { getPrintSessionData } from "@/lib/printUtils";

function PrintContent() {
  const params  = useSearchParams();
  const id      = params.get("id")      ?? "";
  const session = params.get("session") ?? "";
  const type    = (params.get("type")   ?? "excellence") as CertificateData["documentType"];

  const [data,  setData]  = useState<CertificateData | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ── Load data ───────────────────────────────────────────────────── */
  useEffect(() => {
    /* Case 1: session-stored live preview data */
    if (session === "1") {
      const saved = getPrintSessionData();
      if (saved) { setData(saved); return; }
      setError("Session data not found. Please try printing again.");
      return;
    }

    /* Case 2: fetch by ID from API */
    if (!id) { setError("Missing certificate ID."); return; }

    const certEndpoint =
      type === "marksheet"
        ? "/api/student/certificates?type=marksheet"
        : "/api/student/certificates?type=excellence";

    Promise.all([
      fetch(certEndpoint,        { cache: "no-store" }).then(r => r.json()),
      fetch("/api/student/me",   { cache: "no-store" }).then(r => r.json()),
    ])
      .then(([cJ, meJ]) => {
        const student  = meJ?.data ?? {};
        const records: any[] = cJ?.data ?? [];
        const rec = records.find((r: any) => r.id === id) ?? records[0];
        if (!rec) { setError("Certificate not found."); return; }

        const docType: CertificateData["documentType"] =
          ["marksheet", "Marksheet"].includes(rec.type ?? rec.documentType ?? type)
            ? "marksheet"
            : "excellence";

        setData({
          ...SAMPLE_CERTIFICATE,
          documentType:      docType,
          subjects:          (rec.subjects?.length ? rec.subjects : DEFAULT_SUBJECTS)
                               .map((s: any) => ({ ...s })),
          certificateNumber: rec.certificateNumber ?? "",
          studentName:       student?.fullName   ?? rec.studentName   ?? "",
          fatherName:        rec.fatherName      ?? "",
          motherName:        rec.motherName      ?? student?.motherName ?? "",
          rollNo:            rec.rollNo          ?? student?.rollNumber ?? "",
          enrollmentNo:      rec.enrollmentNo    ?? student?.rollNumber ?? "",
          courseName:        rec.courseName      ?? student?.course     ?? "",
          courseCode:        rec.courseCode      ?? "",
          centerCode:        rec.centerCode      ?? "",
          performance:       rec.performance     ?? "",
          courseDuration:    rec.courseDuration  ?? "",
          photoUrl:          student?.photoUrl   ?? "",
          slNo:              rec.slNo ?? rec.certificateNumber?.slice(-3) ?? "001",
          trainingCenter:    rec.trainingCenter  ?? "Rama Coaching Center, Main Branch",
          completionDate:    rec.completionDate
            ? new Date(rec.completionDate).toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", year: "numeric",
              })
            : rec.issueDate ?? "",
          dated:  rec.dated ?? rec.issueDate ??
            new Date().toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric",
            }),
          place:  rec.place ?? "Fatehpur",
        });
      })
      .catch(() => setError("Failed to load. Please try again."));
  }, [id, session, type]);

  /* ── Auto-print once data is ready ──────────────────────────────── */
  useEffect(() => {
    if (!data) return;
    const t = setTimeout(() => window.print(), 600);
    return () => clearTimeout(t);
  }, [data]);

  /* ── States ─────────────────────────────────────────────────────── */
  if (error) return (
    <div className="print-page-state">
      <p style={{ color: "#c0392b", fontFamily: "Arial, sans-serif" }}>⚠ {error}</p>
      <button onClick={() => window.close()} className="print-page-btn-sec">Close</button>
    </div>
  );

  if (!data) return (
    <div className="print-page-state">
      <div className="print-page-spinner" />
      <p style={{ fontFamily: "Arial, sans-serif", color: "#555" }}>Loading document…</p>
    </div>
  );

  return (
    <>
      {/* Toolbar — visible in browser only, hidden by @media print */}
      <div className="no-print-bar">
        <span className="print-page-hint">
          ✅ Document ready. Print dialog should open automatically.
        </span>
        <div className="print-page-actions">
          <button className="print-page-btn" onClick={() => window.print()}>
            🖨️ Print / Save as PDF
          </button>
          <button className="print-page-btn-sec" onClick={() => window.close()}>
            ✕ Close
          </button>
        </div>
      </div>

      {/* Full A4 document — no surrounding chrome */}
      <div className="print-doc-root">
        {data.documentType === "marksheet"
          ? <Marksheet data={data} />
          : <ExcellenceCertificate data={data} />
        }
      </div>
    </>
  );
}

export default function PrintPage() {
  return (
    <Suspense fallback={
      <div className="print-page-state">
        <div className="print-page-spinner" />
        <p style={{ fontFamily: "Arial, sans-serif", color: "#555" }}>Preparing document…</p>
      </div>
    }>
      <PrintContent />
    </Suspense>
  );
}
