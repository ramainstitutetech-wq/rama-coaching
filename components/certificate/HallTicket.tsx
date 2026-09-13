import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import QRCode from "qrcode";

export interface HallTicketData {
  ticketNumber: string;
  studentName: string;
  fatherName?: string;
  motherName?: string;
  rollNo: string;
  courseName: string;
  batch?: string;
  examName: string;
  examDate: string;
  examCenter: string;
  examTime?: string;
  hallNo?: string;
  photoUrl?: string;
  validTill?: string;
}

function safe(v?: string, fallback = "—") {
  const t = (v || "").trim();
  return t.length ? t : fallback;
}
function truncate(v: string, max: number) {
  if (v.length <= max) return v;
  return v.slice(0, max - 1) + "…";
}

export function HallTicket({ data }: { data: HallTicketData }) {
  const [sigUrls, setSigUrls] = useState<{ sec: string; ctrl: string }>({ sec: "/signature.png", ctrl: "/signature.png" });
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" }).then(r => r.json()).then(j => {
      if (j.success && j.data) {
        setSigUrls({
          sec: j.data.secretarySignatureUrl || "/signature.png",
          ctrl: j.data.controllerSignatureUrl || "/signature.png",
        });
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!data.ticketNumber) return;
    const verifyUrl = `${window.location.origin}/verify/hall-ticket/${encodeURIComponent(data.ticketNumber)}`;
    QRCode.toDataURL(verifyUrl, {
      width: 120,
      margin: 1,
      color: { dark: "#1e293b", light: "#ffffff" },
      errorCorrectionLevel: "M",
    }).then(url => setQrDataUrl(url)).catch(() => {});
  }, [data.ticketNumber]);

  return (
    <div style={S.box}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.headerInner}>
          <img
            src="/logo.jpeg"
            alt="RCC Logo"
            style={S.logo}
            onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
          />
          <div style={{ textAlign: "left" }}>
            <h1 style={S.title}>RAMA COACHING CENTRE</h1>
            <p style={S.subtitle}>& COMPUTER EDUCATION • RCCACE</p>
            <p style={S.regLine}>RECOGNISED BY GOVT. OF INDIA • SOCIETY REGD. FAT/08168 • UDYAM-UP-26-0003221</p>
          </div>
        </div>
        <div style={S.badge}>EXAM HALL TICKET</div>
      </div>
      <div style={S.accentBar} />

      {/* Meta strip */}
      <div style={S.metaStrip}>
        <span style={S.metaItem}>
          <span style={S.metaLabel}>TICKET NO</span>
          <span style={S.metaValue}>{safe(data.ticketNumber)}</span>
        </span>
        <span style={S.metaItem}>
          <span style={S.metaLabel}>ROLL NO</span>
          <span style={S.metaValue}>{safe(data.rollNo)}</span>
        </span>
        {data.hallNo && (
          <span style={S.hallBadge}>Hall: {safe(data.hallNo)}</span>
        )}
      </div>

      {/* Body */}
      <div style={S.body}>
        <div style={{ flex: 1 }}>
          {[
            { label: "Student Name", value: truncate(safe(data.studentName), 36) },
            { label: "Father's Name", value: truncate(safe(data.fatherName), 32) },
            { label: "Mother's Name", value: truncate(safe(data.motherName), 32) },
            { label: "Course", value: truncate(safe(data.courseName), 40) },
            { label: "Batch", value: safe(data.batch) },
            { label: "Exam", value: truncate(safe(data.examName), 36) },
            { label: "Exam Date", value: safe(data.examDate) },
            { label: "Exam Time", value: safe(data.examTime, "10:00 AM") },
            { label: "Exam Center", value: truncate(safe(data.examCenter), 42) },
          ].map((f) => (
            <div key={f.label} style={S.fieldRow}>
              <span style={S.fieldLabel}>{f.label}</span>
              <span style={S.fieldValue}>{f.value}</span>
            </div>
          ))}
        </div>

        {/* Photo + Signature */}
        <div style={S.photoCol}>
          <div style={S.photoWrap}>
            {data.photoUrl ? (
              <img src={data.photoUrl} alt={safe(data.studentName, "Student")} style={S.photo} />
            ) : (
              <div style={S.photoPlaceholder}>
                <span style={{ fontSize: 22, opacity: 0.4 }}>👤</span>
                <span style={{ fontSize: 7, marginTop: 4, letterSpacing: 0.5, opacity: 0.5 }}>PHOTO</span>
              </div>
            )}
          </div>

          {/* Signature — proper spacing */}
          <div style={S.signatureArea}>
            <div style={S.sigSpace} />
            <div style={S.sigLine} />
            <div style={S.sigLabel}>Candidate Signature</div>
            <p style={S.sigHint}>(Sign in presence of invigilator)</p>
          </div>

          <div style={S.validTill}>
            <div style={S.validTillLabel}>VALID TILL</div>
            <div style={S.validTillDate}>{safe(data.validTill || data.examDate)}</div>
          </div>

          {/* Real QR Code */}
          <div style={S.qrBox}>
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Verify" style={{ width: 80, height: 80, display: "block", margin: "0 auto" }} />
            ) : (
              <div style={{ width: 80, height: 80, background: "#f1f5f9", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#94a3b8" }}>
                Loading...
              </div>
            )}
            <p style={S.qrHint}>Scan to verify</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div style={S.instructions}>
        <div style={S.instructionTitle}>Instructions</div>
        <ol style={S.instructionList}>
          <li>Entry is not permitted without this hall ticket.</li>
          <li>Carry a valid photo ID along with this ticket.</li>
          <li>Report to the exam center at least 30 minutes before the scheduled time.</li>
          <li>Mobile phones and electronic devices are strictly prohibited inside the exam hall.</li>
          <li>Keep this ticket safe for future reference.</li>
        </ol>
      </div>

      {/* Footer */}
      <div style={S.footer}>
        <img src="/stamp.png" alt="Stamp" style={S.stampWatermark} />
        <div style={S.sigBlock}>
          <img src={sigUrls.ctrl} alt="Controller" style={S.sigImage} onError={(e) => ((e.currentTarget as HTMLImageElement).src = "/signature.png")} />
          <div style={S.sigBlockLine} />
          <span style={S.sigBlockLabel}>Controller of Examination</span>
        </div>
        <div style={S.sigBlock}>
          <img src={sigUrls.sec} alt="Secretary" style={S.sigImage} onError={(e) => ((e.currentTarget as HTMLImageElement).src = "/signature.png")} />
          <div style={S.sigBlockLine} />
          <span style={S.sigBlockLabel}>Secretary</span>
        </div>
      </div>
      <div style={S.copyright}>
        <img src="/logo.jpeg" alt="" style={S.copyrightLogo} onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")} />
        © 2026 Rama Coaching Center, Fatehpur • Helpline: 08299121689
      </div>
    </div>
  );
}

/* ── Styles ───────────────────────────────────────────── */

const S: Record<string, CSSProperties> = {
  box: {
    width: 794,
    minHeight: 1050,
    background: "#ffffff",
    borderRadius: 10,
    overflow: "hidden",
    fontFamily: "'Outfit', 'Inter', Arial, sans-serif",
    color: "#1e293b",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 12px rgba(15,23,42,0.06)",
  },
  header: {
    background: "#0f172a",
    padding: "18px 24px 16px",
    textAlign: "center",
  },
  headerInner: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    justifyContent: "center",
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 8,
    objectFit: "cover",
    background: "#fff",
    flexShrink: 0,
  },
  title: {
    margin: 0,
    fontSize: 17,
    fontWeight: 700,
    letterSpacing: 0.6,
    color: "#fff",
    lineHeight: 1.1,
  },
  subtitle: {
    margin: "2px 0 0",
    fontSize: 9,
    letterSpacing: 1.2,
    color: "#fbbf24",
    fontWeight: 500,
  },
  regLine: {
    margin: "2px 0 0",
    fontSize: 7,
    letterSpacing: 0.4,
    color: "#64748b",
  },
  badge: {
    marginTop: 12,
    display: "inline-block",
    background: "#ffffff",
    color: "#0f172a",
    padding: "4px 16px",
    borderRadius: 4,
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: 1.5,
  },
  accentBar: {
    height: 3,
    background: "#f59e0b",
  },
  metaStrip: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    borderBottom: "1px solid #e2e8f0",
    fontSize: 11,
    gap: 12,
    flexWrap: "wrap",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  metaLabel: {
    color: "#64748b",
    fontWeight: 500,
    fontSize: 9,
    letterSpacing: 0.6,
  },
  metaValue: {
    fontFamily: "'Outfit', monospace",
    color: "#0f172a",
    fontWeight: 600,
    fontSize: 11,
  },
  hallBadge: {
    background: "#fef3c7",
    color: "#92400e",
    padding: "3px 8px",
    borderRadius: 4,
    fontWeight: 500,
    fontSize: 10,
  },
  body: {
    display: "flex",
    gap: 24,
    padding: "20px 24px 16px",
  },
  fieldRow: {
    display: "flex",
    gap: 16,
    padding: "8px 0",
    borderBottom: "1px solid #f1f5f9",
    alignItems: "baseline",
  },
  fieldLabel: {
    width: 110,
    minWidth: 110,
    color: "#94a3b8",
    fontWeight: 500,
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  fieldValue: {
    flex: 1,
    fontWeight: 500,
    color: "#334155",
    fontSize: 12,
    lineHeight: 1.4,
    wordBreak: "break-word" as const,
  },
  photoCol: {
    width: 140,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  photoWrap: {
    width: 110,
    height: 130,
    overflow: "hidden",
    background: "#f1f5f9",
    margin: "0 auto",
  },
  photo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  photoPlaceholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    color: "#94a3b8",
    background: "#f8fafc",
  },
  signatureArea: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  sigSpace: {
    height: 40,
    borderBottom: "none",
  },
  sigLine: {
    width: "100%",
    borderTop: "1px solid #cbd5e1",
  },
  sigLabel: {
    fontSize: 9,
    fontWeight: 500,
    color: "#475569",
    marginTop: 6,
  },
  sigHint: {
    fontSize: 7,
    color: "#94a3b8",
    margin: "2px 0 0",
  },
  validTill: {
    border: "1px solid #e2e8f0",
    borderRadius: 6,
    padding: "6px 8px",
    fontSize: 9,
    color: "#64748b",
    textAlign: "center",
    background: "#fafafa",
  },
  validTillLabel: {
    fontSize: 7,
    letterSpacing: 0.5,
    color: "#94a3b8",
    fontWeight: 500,
  },
  validTillDate: {
    fontWeight: 600,
    color: "#1e293b",
    fontSize: 10,
    marginTop: 2,
  },
  qrBox: {
    border: "1px solid #e2e8f0",
    borderRadius: 6,
    padding: 8,
    textAlign: "center",
    background: "#fafafa",
  },
  qrHint: {
    fontSize: 7,
    color: "#94a3b8",
    margin: "6px 0 0",
    letterSpacing: 0.3,
  },
  instructions: {
    margin: "0 20px 14px",
    padding: "12px 16px",
    background: "#fafafa",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
  },
  instructionTitle: {
    fontSize: 10,
    fontWeight: 600,
    color: "#334155",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  instructionList: {
    margin: 0,
    paddingLeft: 16,
    fontSize: 9,
    lineHeight: 1.8,
    color: "#64748b",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: "16px 24px 10px",
    borderTop: "1px solid #e2e8f0",
    position: "relative",
    gap: 20,
  },
  stampWatermark: {
    position: "absolute",
    left: "50%",
    top: "40%",
    transform: "translate(-50%, -50%)",
    width: 100,
    height: 100,
    objectFit: "contain",
    opacity: 0.08,
    pointerEvents: "none",
  },
  sigBlock: {
    textAlign: "center",
    flex: 1,
  },
  sigImage: {
    width: 100,
    height: 32,
    objectFit: "contain",
    display: "block",
    margin: "0 auto 4px",
  },
  sigBlockLine: {
    borderTop: "1px solid #cbd5e1",
    margin: "0 16px",
  },
  sigBlockLabel: {
    display: "block",
    fontSize: 9,
    fontWeight: 500,
    color: "#475569",
    marginTop: 6,
    letterSpacing: 0.3,
  },
  copyright: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    fontSize: 7,
    color: "#94a3b8",
    padding: "6px 20px 10px",
    borderTop: "1px solid #f1f5f9",
    letterSpacing: 0.2,
  },
  copyrightLogo: {
    width: 10,
    height: 10,
    borderRadius: 2,
    objectFit: "cover",
    opacity: 0.5,
  },
};
