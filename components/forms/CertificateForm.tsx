import { useState } from "react";
import { FileCheck2, Award, BarChart3 } from "lucide-react";
import type { CertificateData, DocumentType, MarkRow } from "@/types/certificate";
import { SAMPLE_CERTIFICATE, DEFAULT_SUBJECTS } from "@/lib/defaults";
import { validateCertificate, hasErrors } from "@/lib/validation";
import { TextField } from "./TextField";
import { MarkTableEditor } from "./MarkTableEditor";

const TYPE_OPTIONS: { value: DocumentType; label: string; icon: typeof Award }[] = [
  { value: "excellence", label: "Certificate of Excellence", icon: Award },
  { value: "marksheet", label: "Marksheet", icon: BarChart3 },
];

export function CertificateForm({
  onGenerate,
  initialData,
  fixedType,
}: {
  onGenerate: (data: CertificateData) => void;
  initialData?: CertificateData;
  fixedType?: DocumentType;
}) {
  const [data, setData] = useState<CertificateData>(() => {
    const base = initialData ?? SAMPLE_CERTIFICATE;
    return fixedType ? { ...base, documentType: fixedType } : base;
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CertificateData, string>>>({});
  const [attempted, setAttempted] = useState(false);

  function setField(name: keyof CertificateData, value: string) {
    setData((prev) => ({ ...prev, [name]: value }));
    if (attempted) setErrors(validateCertificate({ ...data, [name]: value }));
  }

  function setDocumentType(type: DocumentType) {
    if (fixedType) return;
    setData((prev) => ({ ...prev, documentType: type }));
  }

  function setSubject(index: number, field: keyof MarkRow, value: string) {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    }));
    if (attempted) {
      const next = { ...data, subjects: data.subjects.map((s, i) => (i === index ? { ...s, [field]: value } : s)) };
      setErrors(validateCertificate(next));
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setAttempted(true);
    const found = validateCertificate(data);
    setErrors(found);
    if (!hasErrors(found)) onGenerate(data);
  }

  function handleReset() {
    // Preserve certificateNumber from initialData — it is set by the page, not editable here
    const fresh: CertificateData = {
      ...SAMPLE_CERTIFICATE,
      subjects: DEFAULT_SUBJECTS.map((s) => ({ ...s })),
      certificateNumber: initialData?.certificateNumber ?? SAMPLE_CERTIFICATE.certificateNumber,
      documentType: fixedType ?? SAMPLE_CERTIFICATE.documentType,
    };
    setData(fresh);
    setErrors({});
    setAttempted(false);
  }

  const isMarksheet = data.documentType === "marksheet";

  return (
    <form className="form no-print" onSubmit={handleSubmit} noValidate>
      <div className="form-head">
        <h2 className="form-title">Document Details</h2>
        <p className="form-sub">Select a document type, then enter the details as they should appear.</p>
      </div>

      {!fixedType ? (
        <div className="type-toggle" role="tablist" aria-label="Document type">
          {TYPE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = data.documentType === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="tab"
                aria-selected={active}
                className={`type-option${active ? " type-option-active" : ""}`}
                onClick={() => setDocumentType(opt.value)}
              >
                <Icon size={16} />
                {opt.label}
              </button>
            );
          })}
        </div>
      ) : null}

      {attempted && hasErrors(errors) ? (
        <div className="form-alert" role="alert">
          Please correct the {Object.keys(errors).length} highlighted{" "}
          {Object.keys(errors).length === 1 ? "field" : "fields"} below.
        </div>
      ) : null}

      <fieldset className="form-section">
        <legend className="form-section-title">Student &amp; Course</legend>
        <div className="form-grid">
          <TextField name="studentName" label="Student Name" placeholder="Rahul Kumar" required value={data.studentName} error={errors.studentName} onChange={(e) => setField("studentName", e.target.value)} />
          <TextField name="fatherName" label="Father's Name" placeholder="Rajesh Kumar" required value={data.fatherName} error={errors.fatherName} onChange={(e) => setField("fatherName", e.target.value)} />
          <TextField name="motherName" label="Mother's Name" placeholder="Sunita Kumari" required={isMarksheet} value={data.motherName} error={errors.motherName} onChange={(e) => setField("motherName", e.target.value)} />
          <TextField name="courseName" label="Course Name" placeholder="ADVANCE DIPLOMA IN COMPUTER APPLICATION" required full value={data.courseName} error={errors.courseName} onChange={(e) => setField("courseName", e.target.value)} />
          <TextField name="courseCode" label="Course Code" placeholder="ADCA-2026" required value={data.courseCode} error={errors.courseCode} onChange={(e) => setField("courseCode", e.target.value)} />
          {isMarksheet ? (
            <TextField name="courseDuration" label="Course Duration" placeholder="12 Months" required value={data.courseDuration} error={errors.courseDuration} onChange={(e) => setField("courseDuration", e.target.value)} />
          ) : (
            <TextField name="performance" label="Performance / Grade" placeholder="A+" required value={data.performance} error={errors.performance} onChange={(e) => setField("performance", e.target.value)} />
          )}
          <TextField name="completionDate" label="Date of Completion" placeholder="28 August 2026" required value={data.completionDate} error={errors.completionDate} onChange={(e) => setField("completionDate", e.target.value)} />
          <TextField name="trainingCenter" label="Training Center" placeholder="Rama Coaching Center, Main Branch" required value={data.trainingCenter} error={errors.trainingCenter} onChange={(e) => setField("trainingCenter", e.target.value)} />
          {!isMarksheet ? (
            <TextField name="centerCode" label="Center Code" placeholder="RCC-001" required value={data.centerCode} error={errors.centerCode} onChange={(e) => setField("centerCode", e.target.value)} />
          ) : null}
          {isMarksheet ? (
            <TextField name="photoUrl" label="Photo URL (optional)" placeholder="https://..." value={data.photoUrl} onChange={(e) => setField("photoUrl", e.target.value)} />
          ) : null}
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend className="form-section-title">Reference &amp; Issue</legend>
        <div className="form-grid">
          {/* Certificate number — read-only, set by the system */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="form-label" style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 600, color: "#374151" }}>
              Certificate Number
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: "8px 12px",
                fontFamily: "monospace",
                fontSize: 13,
                fontWeight: 700,
                color: "#1F3354",
                letterSpacing: "0.04em",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              {data.certificateNumber || "—"}
              <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 500, color: "#94a3b8", fontFamily: "sans-serif", letterSpacing: 0 }}>
                Auto-assigned · read-only
              </span>
            </div>
          </div>
          <TextField name="slNo" label="Sl. No." placeholder="001" required value={data.slNo} error={errors.slNo} onChange={(e) => setField("slNo", e.target.value)} />
          <TextField name="rollNo" label="Roll No." placeholder="RCC/2026/001" required value={data.rollNo} error={errors.rollNo} onChange={(e) => setField("rollNo", e.target.value)} />
          <TextField name="enrollmentNo" label="Enrollment No." placeholder="RAMA-2026-001" required full value={data.enrollmentNo} error={errors.enrollmentNo} onChange={(e) => setField("enrollmentNo", e.target.value)} />
          <TextField name="dated" label="Dated" placeholder="28 August 2026" required value={data.dated} error={errors.dated} onChange={(e) => setField("dated", e.target.value)} />
          <TextField name="place" label="Place" placeholder="Patna" required value={data.place} error={errors.place} onChange={(e) => setField("place", e.target.value)} />
        </div>
      </fieldset>

      {isMarksheet ? (
        <fieldset className="form-section">
          <legend className="form-section-title">Subject Marks</legend>
          <MarkTableEditor rows={data.subjects} errors={errors.subjects} onChange={setSubject} />
        </fieldset>
      ) : null}

      <div className="form-actions">
        <button type="submit" className="btn-generate">
          <FileCheck2 size={18} />
          Generate Document
        </button>
        <button type="button" className="btn-secondary" onClick={handleReset}>
          Reset to sample
        </button>
      </div>
    </form>
  );
}
