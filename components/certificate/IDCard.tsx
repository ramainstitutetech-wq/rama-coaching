import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import QRCode from "qrcode";

export interface IDCardData {
  cardNumber: string;
  studentName: string;
  fatherName?: string;
  rollNo: string;
  courseName: string;
  batch?: string;
  dob?: string;
  phone?: string;
  address?: string;
  photoUrl?: string;
  issueDate: string;
  validTill: string;
}

function safe(v?: string, fallback = "—") {
  const t = (v || "").trim();
  return t.length ? t : fallback;
}

function truncate(v: string, max: number) {
  if (v.length <= max) return v;
  return v.slice(0, max - 1) + "…";
}

export function IDCard({ data }: { data: IDCardData }) {
  const name = truncate(safe(data.studentName, "Student Name"), 26);
  const father = truncate(safe(data.fatherName), 24);
  const course = truncate(safe(data.courseName), 32);
  const address = truncate(safe(data.address), 48);
  const phone = safe(data.phone);
  const batch = safe(data.batch);
  const dob = safe(data.dob);
  const roll = safe(data.rollNo);
  const cardNo = safe(data.cardNumber);
  const issue = safe(data.issueDate);
  const valid = safe(data.validTill);

  const [qrUrl, setQrUrl] = useState("");
  const [qrUrlBack, setQrUrlBack] = useState("");

  useEffect(() => {
    if (!cardNo) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/verify/id-card/${encodeURIComponent(cardNo)}`;
    QRCode.toDataURL(url, { width: 160, margin: 1, color: { dark: "#1e293b", light: "#ffffff" }, errorCorrectionLevel: "M" })
      .then(u => { setQrUrl(u); setQrUrlBack(u); })
      .catch(() => {});
  }, [cardNo]);

  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center", padding: 4 }}>
      {/* ── FRONT ── */}
      <div style={S.card}>
        {/* Header */}
        <div style={S.header}>
          <div style={S.headerRow}>
            <img src="/logo.jpeg" alt="RCC Logo" style={S.logo}
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")} />
            <div style={{ textAlign: "left" }}>
              <h2 style={S.title}>RAMA COACHING CENTRE</h2>
              <p style={S.subtitle}>COMPUTER EDUCATION • RCCACE</p>
              <p style={S.reg}>Govt. Recognised • Society Regd. FAT/08168</p>
            </div>
          </div>
          <div style={S.badge}>STUDENT ID CARD</div>
        </div>
        <div style={S.accentLine} />

        {/* Photo + Name */}
        <div style={S.photoSection}>
          {/* Logo watermark */}
          <img src="/logo.jpeg" alt="" style={S.watermark}
            onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")} />

          <div style={S.photoWrap}>
            {data.photoUrl ? (
              <img src={data.photoUrl} alt={name} style={S.photo} />
            ) : (
              <div style={S.photoPlaceholder}>
                <span style={{ fontSize: 22, opacity: 0.35 }}>👤</span>
                <span style={{ fontSize: 7, marginTop: 4, opacity: 0.45 }}>No Photo</span>
              </div>
            )}
          </div>

          <h3 style={S.name}>{name}</h3>
          <p style={S.course}>{course}</p>
          <p style={S.batch}>Batch: {batch}</p>
        </div>

        {/* Details */}
        <div style={S.detailsBox}>
          {[
            { label: "Roll No", value: roll, mono: true },
            { label: "Card No", value: cardNo, mono: true },
            { label: "DOB", value: dob, mono: false },
            { label: "Phone", value: phone, mono: false },
          ].map((r) => (
            <div key={r.label} style={S.detailRow}>
              <span style={S.detailLabel}>{r.label}</span>
              <span style={{ ...S.detailValue, fontFamily: r.mono ? "monospace" : undefined }}>{r.value}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={S.footer}>
          <span style={{ fontSize: 7.5, color: "#94a3b8" }}>Issued: {issue}</span>
          <span style={S.validBadge}>VALID TILL: {valid}</span>
        </div>
      </div>

      {/* ── BACK ── */}
      <div style={{ ...S.card, background: "#fafafa" }}>
        {/* Header */}
        <div style={{ padding: "12px 14px 0", display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/logo.jpeg" alt="logo" style={S.backLogo}
            onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")} />
          <div>
            <h4 style={S.backTitle}>RCCACE • STUDENT DETAILS</h4>
            <p style={S.backSub}>Rama Coaching Centre, Fatehpur (UP)</p>
          </div>
        </div>

        {/* Info */}
        <div style={S.infoBox}>
          {[
            { k: "Father's Name", v: father },
            { k: "Course", v: course },
            { k: "Address", v: address },
          ].map((r) => (
            <div key={r.k} style={S.infoRow}>
              <span style={S.infoLabel}>{r.k}</span>
              <span style={S.infoValue}>{r.v}</span>
            </div>
          ))}
          <div style={S.rollBatchLine}>
            <span style={{ color: "#64748b", fontSize: 9 }}>Roll: <span style={{ color: "#1e293b", fontWeight: 500 }}>{roll}</span></span>
            <span style={{ color: "#64748b", fontSize: 9 }}>Batch: <span style={{ color: "#1e293b", fontWeight: 500 }}>{batch}</span></span>
          </div>
        </div>

        {/* QR + Watermark */}
        <div style={S.qrSection}>
          <img src="/logo.jpeg" alt="" style={S.watermarkBack}
            onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")} />

          {qrUrlBack ? (
            <img src={qrUrlBack} alt="Verify" style={{ width: 90, height: 90, display: "block", margin: "0 auto", position: "relative", zIndex: 1 }} />
          ) : (
            <div style={{ width: 90, height: 90, background: "#f1f5f9", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#94a3b8", position: "relative", zIndex: 1 }}>
              Loading...
            </div>
          )}
          <p style={S.qrHint}>Scan to verify at <span style={{ color: "#1e293b", fontWeight: 500 }}>/verification</span></p>
          <p style={S.qrSub}>Digitally issued • No signature required</p>
        </div>

        {/* Terms */}
        <div style={S.terms}>
          <span style={{ fontWeight: 600, color: "#92400e" }}>Terms:</span> Non-transferable. Return to office if found. Tampering invalidates card. Valid only for enrolled course. Contact: 08299121689
        </div>

        {/* Footer */}
        <div style={S.backFooter}>
          <img src="/logo.jpeg" alt="" style={S.backFooterLogo}
            onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")} />
          Rama Coaching Center, Fatehpur, UP • 08299121689 • 7007482145
        </div>
      </div>
    </div>
  );
}

/* ── Styles ───────────────────────────────────────────── */

const S: Record<string, CSSProperties> = {
  card: {
    width: 342,
    height: 536,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    fontFamily: "'Outfit', 'Inter', Arial, sans-serif",
    color: "#1e293b",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 12px rgba(15,23,42,0.06)",
  },
  header: {
    background: "#0f172a",
    padding: "14px 14px 12px",
    textAlign: "center",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 7,
    objectFit: "cover",
    background: "#fff",
    flexShrink: 0,
  },
  title: {
    margin: 0,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.6,
    color: "#fff",
    lineHeight: 1,
  },
  subtitle: {
    margin: "2px 0 0",
    fontSize: 7.5,
    letterSpacing: 1,
    color: "#fbbf24",
    fontWeight: 500,
  },
  reg: {
    margin: "1px 0 0",
    fontSize: 6.5,
    letterSpacing: 0.4,
    color: "#64748b",
  },
  badge: {
    marginTop: 10,
    display: "inline-block",
    background: "#ffffff",
    color: "#0f172a",
    padding: "4px 14px",
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1,
  },
  accentLine: {
    height: 3,
    background: "#f59e0b",
  },
  photoSection: {
    padding: "16px 16px 10px",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
  },
  watermark: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 140,
    height: 140,
    objectFit: "contain",
    opacity: 0.05,
    pointerEvents: "none",
  },
  photoWrap: {
    width: 100,
    height: 112,
    overflow: "hidden",
    background: "#f1f5f9",
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
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
  name: {
    margin: "12px 0 0",
    fontSize: 14,
    fontWeight: 600,
    color: "#0f172a",
    letterSpacing: 0.2,
    lineHeight: 1.1,
    position: "relative",
    zIndex: 1,
  },
  course: {
    margin: "3px 0 0",
    fontSize: 10,
    color: "#475569",
    fontWeight: 500,
    position: "relative",
    zIndex: 1,
  },
  batch: {
    margin: "2px 0 0",
    fontSize: 9,
    color: "#94a3b8",
    position: "relative",
    zIndex: 1,
  },
  detailsBox: {
    margin: "0 12px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "8px 11px",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "4px 0",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 10,
  },
  detailLabel: {
    color: "#94a3b8",
    fontWeight: 500,
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
  },
  detailValue: {
    fontWeight: 500,
    color: "#1e293b",
    fontSize: 10,
    maxWidth: 150,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    background: "#0f172a",
    color: "#94a3b8",
    padding: "7px 12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 7.5,
  },
  validBadge: {
    background: "rgba(245,158,11,0.12)",
    color: "#fbbf24",
    padding: "2px 6px",
    borderRadius: 4,
    fontWeight: 600,
    fontSize: 7,
    letterSpacing: 0.3,
  },
  backLogo: {
    width: 28,
    height: 28,
    borderRadius: 6,
    objectFit: "cover",
    border: "1px solid #e2e8f0",
  },
  backTitle: {
    margin: 0,
    fontSize: 9,
    fontWeight: 600,
    color: "#0f172a",
    letterSpacing: 0.6,
  },
  backSub: {
    margin: 0,
    fontSize: 7,
    color: "#94a3b8",
    letterSpacing: 0.3,
  },
  infoBox: {
    margin: "10px 12px 0",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: 10,
  },
  infoRow: {
    display: "flex",
    gap: 8,
    padding: "5px 0",
    borderBottom: "1px solid #f8fafc",
    fontSize: 10,
  },
  infoLabel: {
    color: "#94a3b8",
    fontWeight: 500,
    minWidth: 72,
    fontSize: 8.5,
    textTransform: "uppercase" as const,
    letterSpacing: 0.4,
  },
  infoValue: {
    fontWeight: 500,
    color: "#1e293b",
    flex: 1,
    wordBreak: "break-word" as const,
    lineHeight: 1.4,
  },
  rollBatchLine: {
    display: "flex",
    gap: 16,
    paddingTop: 6,
  },
  qrSection: {
    margin: "10px 12px 0",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "12px 10px",
    textAlign: "center",
    background: "#fff",
    position: "relative",
    overflow: "hidden",
  },
  watermarkBack: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 120,
    height: 120,
    objectFit: "contain",
    opacity: 0.04,
    pointerEvents: "none",
  },
  qrHint: {
    margin: "8px 0 0",
    fontSize: 7.5,
    color: "#64748b",
    letterSpacing: 0.3,
    position: "relative",
    zIndex: 1,
  },
  qrSub: {
    margin: "2px 0 0",
    fontSize: 6.5,
    color: "#94a3b8",
    position: "relative",
    zIndex: 1,
  },
  terms: {
    margin: "10px 12px 0",
    fontSize: 7.5,
    color: "#78350f",
    lineHeight: 1.5,
    background: "#fafafa",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "7px 8px",
  },
  backFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    background: "#0f172a",
    color: "#64748b",
    textAlign: "center",
    padding: "7px 8px",
    fontSize: 7,
    letterSpacing: 0.3,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  backFooterLogo: {
    width: 12,
    height: 12,
    borderRadius: 2,
    objectFit: "cover",
    opacity: 0.7,
  },
};
