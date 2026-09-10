"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Award,
  Plus,
  Eye,
  RefreshCw,
  Trash2,
  FilePlus2,
  Printer,
  Send,
  SaveAll,
  CheckCircle2,
  XCircle,
  Loader2,
  Info,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { CertificateRecord } from "@/data/types";
import type { Student as StudentType } from "@/data/types";
import type { Student } from "@/data/types";
import type { CertificateType } from "@/data/types";
import type { CertificateData } from "@/types/certificate";
import { SAMPLE_CERTIFICATE, DEFAULT_SUBJECTS } from "@/lib/defaults";
import { CertificateForm } from "@/components/forms/CertificateForm";
import { CertificatePreview } from "@/components/certificate/CertificatePreview";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/PageHeader";
import { SearchInput, SelectInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState, Spinner } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { certificateStatusVariant, titleCase } from "@/lib/status";
import { printCertificateDirectly } from "@/lib/printUtils";

const PAGE_SIZE = 6;

// ─── Toast ────────────────────────────────────────────────────────────────────
type ToastType = "success" | "error" | "info";
interface Toast { id: number; type: ToastType; message: string }
let _toastId = 0;

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5" role="region" aria-label="Notifications">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex min-w-[280px] max-w-sm items-start gap-3 rounded-xl px-4 py-3 shadow-2xl ring-1 ring-black/5 ${
            t.type === "success" ? "bg-emerald-600 text-white"
            : t.type === "error" ? "bg-red-600 text-white"
            : "bg-slate-800 text-white"
          }`}
        >
          <span className="mt-0.5 shrink-0">
            {t.type === "success" && <CheckCircle2 className="h-4 w-4" />}
            {t.type === "error"   && <XCircle      className="h-4 w-4" />}
            {t.type === "info"    && <Info         className="h-4 w-4" />}
          </span>
          <span className="flex-1 text-sm font-medium leading-snug">{t.message}</span>
          <button type="button" onClick={() => onDismiss(t.id)} className="shrink-0 opacity-70 hover:opacity-100 text-base leading-none" aria-label="Dismiss">×</button>
        </div>
      ))}
    </div>
  );
}

// ─── Step badge ───────────────────────────────────────────────────────────────
function StepBadge({ n, done }: { n: number; done: boolean }) {
  return done ? (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
      <CheckCircle2 className="h-3.5 w-3.5" />
    </span>
  ) : (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">{n}</span>
  );
}

// ─── Inline error banner ──────────────────────────────────────────────────────
function InlineError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
      <div className="flex-1 text-sm text-red-700">
        <span className="font-semibold">Save failed:</span> {message}
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="shrink-0 text-xs font-semibold text-red-700 underline hover:no-underline">
          Try again
        </button>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function todayLabel() {
  return new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function buildCertData(student: Student | undefined, type: CertificateType, certNumber: string): CertificateData {
  const base: CertificateData = { ...SAMPLE_CERTIFICATE, subjects: DEFAULT_SUBJECTS.map((s) => ({ ...s })) };
  const today = todayLabel();
  if (!student) return {
    ...base,
    documentType: type,
    certificateNumber: certNumber,
    rollNo: certNumber,
    slNo: (certNumber.match(/\d+/g)?.pop() ?? "001").padStart(3, "0"),
    dated: today,
    completionDate: today,
  };
  return {
    ...base,
    documentType: type,
    certificateNumber: certNumber,
    studentName: student.fullName,
    rollNo: student.rollNumber,
    enrollmentNo: student.id.toUpperCase(),
    courseName: student.course.toUpperCase(),
    courseCode: student.course.replace(/\s+/g, "").toUpperCase() + "-2026",
    slNo: student.rollNumber.replace(/\D/g, "").slice(-3).padStart(3, "0") || "001",
    trainingCenter: "Rama Coaching Center, Main Branch",
    centerCode: "RCC-001",
    completionDate: today,
    dated: today,
    place: "Fatehpur",
    photoUrl: student.photoUrl ?? "",
  };
}

function recordToCertData(rec: CertificateRecord, studentsList: StudentType[] = []): CertificateData {
  const student = studentsList.find((s) => s.rollNumber === rec.rollNumber);
  if (student) return buildCertData(student, rec.type, rec.certificateNumber);
  const base: CertificateData = { ...SAMPLE_CERTIFICATE, subjects: DEFAULT_SUBJECTS.map((s) => ({ ...s })) };
  return { ...base, documentType: rec.type, certificateNumber: rec.certificateNumber, studentName: rec.studentName, rollNo: rec.rollNumber, courseName: rec.course.toUpperCase(), slNo: rec.certificateNumber.slice(-3), trainingCenter: "Rama Coaching Center, Main Branch" };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CertificatesPage() {
  const [list,     setList]     = useState<CertificateRecord[]>([]);
  const [students, setStudents] = useState<StudentType[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,      setSearch]      = useState("");
  const [courseFilter, setCourseFilter] = useState("");

  const [viewRecord,   setViewRecord]   = useState<CertificateRecord | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<CertificateRecord | null>(null);

  const [issueOpen,         setIssueOpen]         = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const selectedType: CertificateType = "excellence";
  const [generatorKey,  setGeneratorKey]  = useState(0);
  const [issueInitial,  setIssueInitial]  = useState<CertificateData | null>(null);
  const [generated,     setGenerated]     = useState<CertificateData | null>(null);
  // nextNumber comes from the API so it accounts for BOTH excellence AND marksheet records
  const [nextNumber,    setNextNumber]    = useState("");
  const [issuedNumber,  setIssuedNumber]  = useState("");

  // "saving" | "send-saving" | "idle"
  const [saveState,     setSaveState]     = useState<"idle" | "saving" | "send-saving">("idle");
  const [saveError,     setSaveError]     = useState<string | null>(null);
  const [sendConfirmOpen, setSendConfirmOpen] = useState(false);
  const [sendingRowId,  setSendingRowId]  = useState<string | null>(null);
  const [lastSendIntent, setLastSendIntent] = useState(false); // for retry

  const [page, setPage] = useState(1);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ── Toast helpers ──────────────────────────────────────────────────────────
  const pushToast = useCallback((type: ToastType, message: string) => {
    const id = ++_toastId;
    setToasts((p) => [...p, { id, type, message }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 5000);
  }, []);

  const dismissToast = useCallback((id: number) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  // ── Fetch next safe certificate number from API (scans all types globally) ──
  const fetchNextNumber = useCallback(async () => {
    try {
      const res = await fetch("/api/certificates/next-number", { cache: "no-store" });
      const j = await res.json();
      if (j.success) setNextNumber(j.next);
    } catch {
      // non-fatal — UI will show empty string until loaded
    }
  }, []);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, sRes] = await Promise.all([
        fetch("/api/certificates?type=excellence", { cache: "no-store" }),
        fetch("/api/students?limit=100",           { cache: "no-store" }),
      ]);
      const cJ = await cRes.json();
      const sJ = await sRes.json();
      if (cJ.success) setList(cJ.data);
      if (sJ.success) setStudents(sJ.data);
    } catch {
      pushToast("error", "Failed to load data. Please refresh the page.");
    }
    setLoading(false);
  }, [pushToast]);

  useEffect(() => { fetchAll(); fetchNextNumber(); }, [fetchAll, fetchNextNumber]);

  const courseOptions = useMemo(() => Array.from(new Set(list.map((c) => c.course))).sort(), [list]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return list.filter((c) => {
      const matchQ = !q || c.studentName.toLowerCase().includes(q) || c.certificateNumber.toLowerCase().includes(q) || c.rollNumber.toLowerCase().includes(q);
      return matchQ && (!courseFilter || c.course === courseFilter);
    });
  }, [list, search, courseFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function loadGenerator() {
    const student = students.find((s) => s.id === selectedStudentId);
    const num = nextNumber;
    setIssuedNumber(num);
    setIssueInitial(buildCertData(student, selectedType, num));
    setGenerated(null);
    setSaveError(null);
    setGeneratorKey((k) => k + 1);
  }

  // ── Core save ─────────────────────────────────────────────────────────────
  // certNumberOverride: pass explicitly to avoid reading stale state (e.g. after a bump)
  async function saveRecord(sendToStudent: boolean, certNumberOverride?: string) {
    if (!generated) return;
    const certNum = certNumberOverride ?? issuedNumber;
    setSaveState(sendToStudent ? "send-saving" : "saving");
    setSaveError(null);
    setLastSendIntent(sendToStudent);

    try {
      const payload: Record<string, unknown> = {
        certificateNumber: certNum,
        studentName:    generated.studentName,
        rollNo:         generated.rollNo,
        rollNumber:     generated.rollNo,
        courseName:     generated.courseName,
        courseCode:     generated.courseCode,
        documentType:   "excellence",
        type:           "excellence",
        fatherName:     generated.fatherName,
        motherName:     generated.motherName,
        completionDate: generated.completionDate,
        trainingCenter: generated.trainingCenter,
        centerCode:     generated.centerCode,
        performance:    generated.performance,
        courseDuration: generated.courseDuration,
        dated:          generated.dated,
        place:          generated.place,
        subjects:       generated.subjects,
        slNo:           generated.slNo,
        enrollmentNo:   generated.enrollmentNo,
        status:         "issued",
        isSentToStudent: sendToStudent,
      };
      const st = students.find((s) => s.rollNumber === generated.rollNo);
      if (st) payload.studentId = st.id;

      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();

      if (!j.success) {
        const isDuplicate = (j.error as string)?.toLowerCase().includes("already exists") || (j.error as string)?.includes("E11000");
        if (isDuplicate) {
          // Fetch the authoritative next number from the API (covers all types)
          try {
            const nRes = await fetch("/api/certificates/next-number", { cache: "no-store" });
            const nJ = await nRes.json();
            const bumped = nJ.success ? nJ.next : `${certNum}-retry`;
            setNextNumber(bumped);
            setIssuedNumber(bumped);
            setSaveError(`Certificate number "${certNum}" already exists. Updated to "${bumped}" — click Save again.`);
          } catch {
            setSaveError(`Certificate number "${certNum}" already exists. Please reload and try again.`);
          }
        } else {
          setSaveError(j.error || "Failed to save certificate. Please try again.");
        }
        return;
      }

      pushToast("success", sendToStudent
        ? `Certificate ${certNum} saved and sent to student's portal.`
        : `Certificate ${certNum} saved to admin records.`
      );
      await fetchAll();
      await fetchNextNumber();
      setIssueOpen(false);
      setGenerated(null);
      setIssueInitial(null);
      setSaveError(null);
    } catch {
      setSaveError("Network error. Please check your connection and try again.");
    } finally {
      setSaveState("idle");
    }
  }

  function requestSaveAndSend() { setSendConfirmOpen(true); }
  async function confirmSaveAndSend() { setSendConfirmOpen(false); await saveRecord(true, issuedNumber); }

  async function handleSend(id: string, studentName: string) {
    setSendingRowId(id);
    try {
      const res = await fetch(`/api/certificates/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isSentToStudent: true }) });
      const j = await res.json();
      if (j.success) { pushToast("success", `Certificate sent to ${studentName}'s portal.`); await fetchAll(); }
      else pushToast("error", j.error || "Failed to mark as sent.");
    } catch { pushToast("error", "Network error. Please try again."); }
    finally { setSendingRowId(null); }
  }

  async function confirmDelete() {
    if (!deleteRecord) return;
    try {
      const res = await fetch(`/api/certificates/${deleteRecord.id}`, { method: "DELETE" });
      const j = await res.json();
      if (j.success) { pushToast("success", `Certificate ${deleteRecord.certificateNumber} deleted.`); await fetchAll(); }
      else pushToast("error", j.error || "Failed to delete.");
    } catch { pushToast("error", "Network error. Please try again."); }
    setDeleteRecord(null);
  }

  const isSaving = saveState !== "idle";

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="space-y-6">
        {/* ── Page header ── */}
        <PageHeader
          title="Certificates"
          subtitle="Issue certificates of excellence — save to records or send directly to the student portal"
          actions={
            <button
              type="button"
              onClick={() => { setIssueOpen((v) => !v); setGenerated(null); setIssueInitial(null); setSaveError(null); }}
              className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-navy-deep"
            >
              {issueOpen ? <ChevronUp className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {issueOpen ? "Close" : "Issue Certificate"}
            </button>
          }
        />

        {/* ── Issue panel ── */}
        {issueOpen ? (
          <Card className="overflow-hidden p-0">
            {/* Panel header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <FilePlus2 className="h-4 w-4 text-navy" />
                <span className="text-sm font-semibold text-slate-700">Issue New Certificate</span>
              </div>
              <span className="rounded-full bg-navy/10 px-2.5 py-0.5 text-xs font-semibold text-navy">
                {nextNumber}
              </span>
            </div>

            <div className="p-5">
              {/* Step 1 — Student selection */}
              <div className="mb-5">
                <div className="mb-3 flex items-center gap-2">
                  <StepBadge n={1} done={!!selectedStudentId} />
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Select Student</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <SelectInput
                    value={selectedStudentId}
                    onChange={setSelectedStudentId}
                    placeholder="Choose a student…"
                    options={students.map((s) => ({ value: s.id, label: `${s.fullName} (${s.rollNumber})` }))}
                  />
                  <button
                    type="button"
                    onClick={loadGenerator}
                    disabled={!selectedStudentId}
                    className="inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Load
                  </button>
                </div>
              </div>

              {/* Step 2 — Form + Preview */}
              {issueInitial ? (
                <>
                  <div className="mb-4 flex items-center gap-2">
                    <StepBadge n={2} done={!!generated} />
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fill Details &amp; Generate</span>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Form */}
                    <CertificateForm
                      key={generatorKey}
                      initialData={issueInitial}
                      onGenerate={setGenerated}
                      fixedType="excellence"
                    />

                    {/* Preview + action panel */}
                    <div className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
                      <CertificatePreview data={generated} />

                      {generated ? (
                        <>
                          {/* Step 3 label */}
                          <div className="flex items-center gap-2">
                            <StepBadge n={3} done={false} />
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Save Document</span>
                          </div>

                          {/* Inline error */}
                          {saveError ? (
                            <InlineError
                              message={saveError}
                              onRetry={() => { setSaveError(null); saveRecord(lastSendIntent, issuedNumber); }}
                            />
                          ) : null}

                          {/* Action panel */}
                          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            {/* Info row */}
                            <div className="flex items-start gap-3 border-b border-slate-100 bg-blue-50/60 px-4 py-3">
                              <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                              <p className="text-xs leading-relaxed text-blue-800">
                                <strong>Save</strong> stores this certificate in admin records only — the student won't see it yet.{" "}
                                <strong>Save &amp; Send</strong> also makes it visible in the student's portal immediately.
                              </p>
                            </div>

                            {/* Buttons */}
                            <div className="grid grid-cols-2 divide-x divide-slate-200">
                              <button
                                type="button"
                                onClick={() => saveRecord(false, issuedNumber)}
                                disabled={isSaving}
                                title="Save to admin records only"
                                className="flex flex-col items-center gap-1.5 px-4 py-4 text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {saveState === "saving"
                                  ? <Loader2 className="h-5 w-5 animate-spin text-navy" />
                                  : <SaveAll  className="h-5 w-5 text-slate-600" />
                                }
                                <span className="text-xs font-semibold">
                                  {saveState === "saving" ? "Saving…" : "Save"}
                                </span>
                                <span className="text-[10px] text-slate-400 leading-tight text-center">Admin records only</span>
                              </button>

                              <button
                                type="button"
                                onClick={requestSaveAndSend}
                                disabled={isSaving}
                                title="Save and send to student portal"
                                className="flex flex-col items-center gap-1.5 px-4 py-4 text-navy transition-colors hover:bg-navy/5 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {saveState === "send-saving"
                                  ? <Loader2 className="h-5 w-5 animate-spin text-navy" />
                                  : <Send     className="h-5 w-5 text-navy" />
                                }
                                <span className="text-xs font-semibold">
                                  {saveState === "send-saving" ? "Sending…" : "Save & Send"}
                                </span>
                                <span className="text-[10px] text-slate-400 leading-tight text-center">Visible to student</span>
                              </button>
                            </div>
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </Card>
        ) : null}

        {/* ── Search / filter ── */}
        <Card className="p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search name, number or roll…" />
            <SelectInput value={courseFilter} onChange={(v) => { setCourseFilter(v); setPage(1); }} placeholder="All Courses" options={courseOptions.map((c) => ({ value: c, label: c }))} />
          </div>
        </Card>

        {/* ── List ── */}
        {loading ? (
          <Spinner label="Loading certificates…" />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Award} title="No certificates found" description="Adjust your search or filters, or issue a new certificate." />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Certificate No.</th>
                    <th className="px-4 py-3 font-medium">Student</th>
                    <th className="px-4 py-3 font-medium">Roll No.</th>
                    <th className="px-4 py-3 font-medium">Course</th>
                    <th className="px-4 py-3 font-medium">Issue Date</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Sent</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paged.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">{c.certificateNumber}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{c.studentName}</td>
                      <td className="px-4 py-3 text-slate-500">{c.rollNumber}</td>
                      <td className="px-4 py-3 text-slate-500">{c.course}</td>
                      <td className="px-4 py-3 text-slate-500">{c.issueDate}</td>
                      <td className="px-4 py-3">
                        <Badge variant={certificateStatusVariant[c.status]}>{titleCase(c.status)}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        {c.isSentToStudent ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" /> Sent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button type="button" onClick={() => setViewRecord(c)} className="rounded-md p-2 text-slate-500 hover:bg-slate-100" title="View">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStudentId(students.find((s) => s.rollNumber === c.rollNumber)?.id ?? "");
                              setIssuedNumber(c.certificateNumber);
                              setIssueInitial(recordToCertData(c, students));
                              setGenerated(null); setSaveError(null);
                              setGeneratorKey((k) => k + 1);
                              setIssueOpen(true);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="rounded-md p-2 text-slate-500 hover:bg-slate-100" title="Regenerate"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                          {!c.isSentToStudent && (
                            <button
                              type="button"
                              onClick={() => handleSend(c.id, c.studentName)}
                              disabled={sendingRowId === c.id}
                              className="rounded-md p-2 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                              title="Send to student portal"
                            >
                              {sendingRowId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </button>
                          )}
                          <button type="button" onClick={() => setDeleteRecord(c)} className="rounded-md p-2 text-red-500 hover:bg-red-50" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </Card>
        )}

        {/* ── View modal ── */}
        <Modal open={!!viewRecord} onClose={() => setViewRecord(null)} title="Certificate Preview" size="xl">
          {viewRecord ? (
            <div>
              <CertificatePreview data={recordToCertData(viewRecord, students)} />
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <span className="text-xs text-slate-500">
                  {viewRecord.isSentToStudent ? (
                    <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Sent to student portal
                    </span>
                  ) : (
                    <span className="text-amber-600">Not yet sent to student</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const docName = `RCCACE_Certificate_${viewRecord.certificateNumber || "Student"}`;
                    printCertificateDirectly(docName);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep shadow-sm transition-colors"
                >
                  <Printer className="h-4 w-4" /> Print / Save as PDF
                </button>
              </div>
            </div>
          ) : null}
        </Modal>

        {/* ── Save & Send confirm ── */}
        <ConfirmDialog
          open={sendConfirmOpen}
          onClose={() => setSendConfirmOpen(false)}
          onConfirm={confirmSaveAndSend}
          variant="primary"
          title="Save & Send to Student?"
          message={`Certificate ${issuedNumber} will be saved and immediately made visible to the student in their portal. This action can be reversed from the records table.`}
          confirmText="Yes, Save & Send"
          cancelText="Cancel"
        />

        {/* ── Delete confirm ── */}
        <ConfirmDialog
          open={!!deleteRecord}
          onClose={() => setDeleteRecord(null)}
          onConfirm={confirmDelete}
          variant="danger"
          title="Delete certificate?"
          message={`Certificate ${deleteRecord?.certificateNumber} will be permanently removed. This cannot be undone.`}
          confirmText="Delete"
        />
      </div>
    </>
  );
}
