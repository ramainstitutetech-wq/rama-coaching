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
import { HallTicket } from "@/components/certificate/HallTicket";
import { IDCard } from "@/components/certificate/IDCard";
import type { CertificateData } from "@/types/certificate";
import { SAMPLE_CERTIFICATE, DEFAULT_SUBJECTS } from "@/lib/defaults";
import { getPrintSessionData } from "@/lib/printUtils";

function PrintContent() {
  const params  = useSearchParams();
  const id      = params.get("id")      ?? "";
  const session = params.get("session") ?? "";
  const type    = (params.get("type")   ?? "excellence") as any;

  const [data,  setData]  = useState<CertificateData | null>(null);
  const [hallData, setHallData] = useState<any>(null);
  const [idCardData, setIdCardData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  /* ── Load data ───────────────────────────────────────────────────── */
  useEffect(() => {
    /* Case 1: session-stored live preview data */
    if (session === "1") {
      const saved = getPrintSessionData();
      if (saved) { setData(saved as any); return; }
      setError("Session data not found. Please try printing again.");
      return;
    }

    /* Hall Ticket / ID Card — robust: try direct by ID first (works for admin & student), fallback to list */
    if (type === "hallticket" || type === "hall-ticket") {
      if (!id) { setError("Missing hall ticket ID."); return; }
      fetch(`/api/hall-tickets/${encodeURIComponent(id)}`, { cache: "no-store" }).then(r => r.json()).then(j => {
        if (j.success && j.data) {
          const rec = j.data;
          setHallData({
            ticketNumber: rec.ticketNumber,
            studentName: rec.studentName,
            fatherName: rec.fatherName || "",
            motherName: rec.motherName || "",
            rollNo: rec.rollNo,
            courseName: rec.courseName,
            batch: rec.batch || "",
            examName: rec.examName,
            examDate: rec.examDate || "",
            examCenter: rec.examCenter,
            examTime: rec.examTime,
            hallNo: rec.hallNo,
            photoUrl: rec.photoUrl || "",
            validTill: rec.validTill || rec.examDate,
          });
        } else {
          // fallback to list search
          Promise.all([
            fetch("/api/student/hall-tickets", { cache: "no-store" }).then(r => r.json()).catch(() => ({ data: [] })),
            fetch("/api/hall-tickets?limit=100", { cache: "no-store" }).then(r => r.json()).catch(() => ({ data: [] })),
          ]).then(([myJ, allJ]) => {
            const all = [...(myJ?.data || []), ...(allJ?.data || [])];
            const rec = all.find((r: any) => r.id === id || r.ticketNumber === id);
            if (!rec) { setError("Hall ticket not found."); return; }
            setHallData({
              ticketNumber: rec.ticketNumber,
              studentName: rec.studentName,
              fatherName: rec.fatherName || "",
              motherName: rec.motherName || "",
              rollNo: rec.rollNo,
              courseName: rec.courseName,
              batch: rec.batch || "",
              examName: rec.examName,
              examDate: rec.examDate || "",
              examCenter: rec.examCenter,
              examTime: rec.examTime,
              hallNo: rec.hallNo,
              photoUrl: rec.photoUrl || "",
              validTill: rec.validTill || rec.examDate,
            });
          }).catch(() => setError("Failed to load hall ticket."));
        }
      }).catch(() => setError("Failed to load hall ticket."));
      return;
    }
    if (type === "idcard" || type === "id-card" || type === "id_card") {
      if (!id) {
        fetch("/api/student/id-card", { cache: "no-store" }).then(r => r.json()).then(j => {
          if (j.success && j.data) {
            setIdCardData({
              cardNumber: j.data.cardNumber,
              studentName: j.data.studentName,
              fatherName: j.data.fatherName || "",
              rollNo: j.data.rollNo,
              courseName: j.data.courseName,
              batch: j.data.batch || "",
              dob: j.data.dob || "",
              phone: j.data.phone || "",
              address: j.data.address || "",
              photoUrl: j.data.photoUrl || "",
              issueDate: j.data.issueDate,
              validTill: j.data.validTill,
            });
          } else setError("ID card not found.");
        }).catch(() => setError("Failed to load ID card."));
        return;
      }
      // Direct by ID — works for both admin and student without token issues
      fetch(`/api/id-cards/${encodeURIComponent(id)}`, { cache: "no-store" }).then(r => r.json()).then(j => {
        if (j.success && j.data) {
          const rec = j.data;
          setIdCardData({
            cardNumber: rec.cardNumber,
            studentName: rec.studentName,
            fatherName: rec.fatherName || "",
            rollNo: rec.rollNo,
            courseName: rec.courseName,
            batch: rec.batch || "",
            dob: rec.dob || "",
            phone: rec.phone || "",
            address: rec.address || "",
            photoUrl: rec.photoUrl || "",
            issueDate: rec.issueDate,
            validTill: rec.validTill,
          });
        } else {
          // fallback
          Promise.all([
            fetch("/api/student/id-card", { cache: "no-store" }).then(r => r.json()).catch(() => ({})),
            fetch("/api/id-cards?limit=100", { cache: "no-store" }).then(r => r.json()).catch(() => ({ data: [] })),
          ]).then(([myJ, allJ]) => {
            const rec = (myJ?.success && myJ.data && (myJ.data.id === id || myJ.data.cardNumber === id)) ? myJ.data : (allJ?.data || []).find((r: any) => r.id === id || r.cardNumber === id);
            if (!rec) { setError("ID card not found."); return; }
            setIdCardData({
              cardNumber: rec.cardNumber,
              studentName: rec.studentName,
              fatherName: rec.fatherName || "",
              rollNo: rec.rollNo,
              courseName: rec.courseName,
              batch: rec.batch || "",
              dob: rec.dob || "",
              phone: rec.phone || "",
              address: rec.address || "",
              photoUrl: rec.photoUrl || "",
              issueDate: rec.issueDate,
              validTill: rec.validTill,
            });
          }).catch(() => setError("Failed to load ID card."));
        }
      }).catch(() => setError("Failed to load ID card."));
      return;
    }

    /* Case 2: fetch by ID from API — Certificate/Marksheet */
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
    if (!data && !hallData && !idCardData) return;
    const t = setTimeout(() => window.print(), 600);
    return () => clearTimeout(t);
  }, [data, hallData, idCardData]);

  /* ── States ─────────────────────────────────────────────────────── */
  if (error) return (
    <div className="print-page-state">
      <p style={{ color: "#c0392b", fontFamily: "Arial, sans-serif" }}>⚠ {error}</p>
      <button onClick={() => window.close()} className="print-page-btn-sec">Close</button>
    </div>
  );

  if (!data && !hallData && !idCardData) return (
    <div className="print-page-state">
      <div className="print-page-spinner" />
      <p style={{ fontFamily: "Arial, sans-serif", color: "#555" }}>Loading document…</p>
    </div>
  );

  if (hallData) return (
    <>
      <div className="no-print-bar">
        <span className="print-page-hint">✅ Hall Ticket ready. Print dialog should open automatically.</span>
        <div className="print-page-actions">
          <button className="print-page-btn" onClick={() => window.print()}>🖨️ Print / Save as PDF</button>
          <button className="print-page-btn-sec" onClick={() => window.close()}>✕ Close</button>
        </div>
      </div>
      <div className="print-doc-root"><div className="hallticket-print-root"><HallTicket data={hallData} /></div></div>
    </>
  );
  if (idCardData) return (
    <>
      <div className="no-print-bar">
        <span className="print-page-hint">✅ ID Card ready. Print dialog should open automatically. — Tip: Check “Background graphics” for premium colors.</span>
        <div className="print-page-actions">
          <button className="print-page-btn" onClick={() => window.print()}>🖨️ Print / Save as PDF</button>
          <button className="print-page-btn-sec" onClick={() => window.close()}>✕ Close</button>
        </div>
      </div>
      <div className="print-doc-root"><div className="idcard-print-root"><IDCard data={idCardData} /></div></div>
    </>
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
        {data!.documentType === "marksheet"
          ? <Marksheet data={data!} />
          : <ExcellenceCertificate data={data!} />
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
