"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface CardData {
  cardNumber: string;
  studentName: string;
  fatherName: string;
  rollNo: string;
  courseName: string;
  batch: string;
  dob: string;
  phone: string;
  address: string;
  status: string;
  issueDate: string;
  validTill: string;
}

export default function VerifyIDCardPage() {
  const params = useParams();
  const cardNumber = params?.cardNumber as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<CardData | null>(null);

  useEffect(() => {
    if (!cardNumber) return;
    fetch(`/api/verify/id-card/${encodeURIComponent(cardNumber)}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.valid) {
          setData(j.data);
        } else {
          setError(j.error || "ID card not found");
        }
      })
      .catch(() => setError("Verification failed. Please try again."))
      .finally(() => setLoading(false));
  }, [cardNumber]);

  if (loading) {
    return (
      <div style={S.page}>
        <div style={S.card}>
          <div style={S.spinner} />
          <p style={{ color: "#64748b", marginTop: 16, fontSize: 14 }}>Verifying ID card...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={S.page}>
        <div style={S.card}>
          <div style={S.invalidIcon}>✕</div>
          <h2 style={{ ...S.heading, color: "#dc2626" }}>Invalid ID Card</h2>
          <p style={{ color: "#64748b", fontSize: 14, marginTop: 8 }}>{error}</p>
          <p style={{ color: "#94a3b8", fontSize: 12, marginTop: 16 }}>Card: {cardNumber}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.validIcon}>✓</div>
        <h2 style={{ ...S.heading, color: "#16a34a" }}>Verified ID Card</h2>
        <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>This ID card is genuine and issued by Rama Coaching Centre.</p>

        <div style={S.divider} />

        <div style={S.grid}>
          <VField label="Card No" value={data!.cardNumber} />
          <VField label="Student" value={data!.studentName} />
          <VField label="Father's Name" value={data!.fatherName} />
          <VField label="Roll No" value={data!.rollNo} />
          <VField label="Course" value={data!.courseName} />
          <VField label="Batch" value={data!.batch} />
          <VField label="DOB" value={data!.dob} />
          <VField label="Phone" value={data!.phone} />
          <VField label="Address" value={data!.address} />
          <VField label="Status" value={data!.status?.toUpperCase() || "—"} highlight />
          <VField label="Issued" value={data!.issueDate} />
          <VField label="Valid Till" value={data!.validTill} />
        </div>

        <div style={{ ...S.footer, marginTop: 20 }}>
          <span>Helpline: 08299121689</span>
          <span>•</span>
          <span>Rama Coaching Centre, Fatehpur</span>
        </div>
      </div>
    </div>
  );
}

function VField({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ width: 100, color: "#94a3b8", fontSize: 12, fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: highlight ? 600 : 500, color: highlight ? "#16a34a" : "#1e293b" }}>{value || "—"}</span>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    fontFamily: "'Outfit', 'Inter', Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 480,
    background: "#fff",
    borderRadius: 12,
    padding: 32,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    border: "1px solid #e2e8f0",
    textAlign: "center",
  },
  spinner: {
    width: 32,
    height: 32,
    border: "3px solid #e2e8f0",
    borderTopColor: "#0f172a",
    borderRadius: "50%",
    margin: "0 auto",
    animation: "spin 0.8s linear infinite",
  },
  validIcon: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "#f0fdf4",
    border: "2px solid #16a34a",
    color: "#16a34a",
    fontSize: 22,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto",
  },
  invalidIcon: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "#fef2f2",
    border: "2px solid #dc2626",
    color: "#dc2626",
    fontSize: 20,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto",
  },
  heading: {
    fontSize: 18,
    fontWeight: 700,
    marginTop: 12,
    marginBottom: 0,
  },
  divider: {
    height: 1,
    background: "#e2e8f0",
    margin: "20px 0",
  },
  grid: {
    textAlign: "left",
  },
  footer: {
    display: "flex",
    justifyContent: "center",
    gap: 8,
    fontSize: 11,
    color: "#94a3b8",
  },
};
