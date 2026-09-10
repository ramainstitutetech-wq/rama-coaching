"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Eye, Trash2, CheckCircle2, XCircle, PhoneCall, Clock,
  Award, FileText, Download, ExternalLink, RefreshCw,
  Building2, User, Calendar, MapPin, MessageSquare,
  AlertTriangle, Printer, Shield,
} from "lucide-react";
import { PageHeader, Card } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { SearchInput, SelectInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState, Spinner } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { franchiseStatusVariant, titleCase } from "@/lib/status";
import type { FranchiseApplication, FranchiseCertificate, FranchiseStatus } from "@/data/types";

const STATUS_OPTIONS = [
  { value: "",           label: "All Statuses" },
  { value: "pending",    label: "Pending" },
  { value: "contacted",  label: "Contacted" },
  { value: "approved",   label: "Approved" },
  { value: "rejected",   label: "Rejected" },
];

const PAGE_SIZE = 8;

// ── Detail row helper ─────────────────────────────────────────────────────────
function DRow({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-0.5">{label}</p>
      <p className={`text-sm text-slate-800 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

// ── Franchise Certificate Print View ─────────────────────────────────────────
function FranchiseCertView({ cert, app }: { cert: FranchiseCertificate; app: FranchiseApplication }) {
  const [sig, setSig] = useState({ sec: "/signature.png", ctrl: "/signature.png", stamp: "/stamp.png" });
  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" }).then(r=>r.json()).then(j=>{
      if(j.success && j.data) setSig({
        sec: j.data.secretarySignatureUrl || "/signature.png",
        ctrl: j.data.controllerSignatureUrl || "/signature.png",
        stamp: j.data.stampUrl || "/stamp.png",
      });
    }).catch(()=>{});
  }, []);
  return (
    <div
      id="franchise-cert-print"
      className="relative bg-white overflow-hidden"
      style={{ width: 794, minHeight: 560, fontFamily: "Georgia, serif" }}
    >
      {/* Outer border */}
      <div className="absolute inset-0 border-[10px] border-[#1F3354] rounded" />
      <div className="absolute inset-[14px] border-2 border-[#b91c1c] rounded" />

      {/* Watermark logo */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: 0.07 }}
      >
        <img src="/logo.jpeg" alt="" style={{ width: 340, height: 340, objectFit: "contain" }} />
      </div>

      <div className="relative z-10 px-16 py-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-4 mb-3">
            <img src="/logo.jpeg" alt="Logo" className="w-16 h-16 object-contain" />
            <div>
              <h1
                className="text-2xl font-black text-[#1F3354]"
                style={{ fontFamily: "Times New Roman, serif", letterSpacing: 1 }}
              >
                Rama Coaching Center
              </h1>
              <p className="text-xs tracking-widest text-gray-500 uppercase">
                And Computer Education Center
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">Recognised by Govt. of India</p>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-[#b91c1c] to-transparent my-3" />
          <h2
            className="text-3xl font-bold text-[#b91c1c] italic"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Franchise Certificate
          </h2>
          <p className="text-xs tracking-[0.3em] text-gray-500 uppercase mt-1">
            This is to certify that
          </p>
        </div>

        {/* Body */}
        <div className="text-center mb-6">
          <p className="text-xl font-bold text-[#1F3354] mt-2 mb-1">{app.ownerName || app.name}</p>
          <p className="text-base text-gray-700">
            Proprietor of{" "}
            <span className="font-semibold text-[#1F3354]">{cert.instituteName}</span>
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {cert.city}, {cert.state}
          </p>
          <p className="text-sm text-gray-600 mt-3 leading-relaxed max-w-lg mx-auto">
            is hereby granted the <strong>Franchise</strong> of{" "}
            <strong>Rama Coaching Center And Computer Education Center</strong> for a period
            of <strong>{cert.duration}</strong>
            {cert.startDate && cert.endDate
              ? ` from ${cert.startDate} to ${cert.endDate}`
              : ""}
            .
          </p>
        </div>

        {/* Cert details grid */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded p-4 text-sm mb-6">
          <div>
            <span className="text-xs text-slate-500">Certificate No.</span>
            <p className="font-mono font-bold text-[#1F3354] text-base">{cert.certificateNumber}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Issue Date</span>
            <p className="font-semibold text-slate-800">{cert.issueDate}</p>
          </div>
          {cert.startDate && (
            <div>
              <span className="text-xs text-slate-500">Valid From</span>
              <p className="font-semibold text-slate-800">{cert.startDate}</p>
            </div>
          )}
          {cert.endDate && (
            <div>
              <span className="text-xs text-slate-500">Valid Until</span>
              <p className="font-semibold text-slate-800">{cert.endDate}</p>
            </div>
          )}
        </div>

        {/* Footer — with Signature & Stamp (dynamic from Settings) */}
        <div className="relative flex items-end justify-between mt-8">
          <img src={sig.stamp} alt="Stamp" className="absolute left-1/2 -translate-x-1/2 -top-6 w-20 h-20 object-contain pointer-events-none" onError={(e)=>{(e.currentTarget as HTMLImageElement).src="/stamp.png";}} />
          <div className="text-center">
            <img src={sig.sec} alt="Secretary Signature" className="w-28 h-10 object-contain mx-auto mb-1" onError={(e)=>{(e.currentTarget as HTMLImageElement).src="/signature.png";}} />
            <div className="w-32 border-t border-gray-400 pt-1">
              <p className="text-xs text-gray-500">Authorized Signatory</p>
              <p className="text-xs font-medium text-gray-700">Secretary</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <Shield className="w-3 h-3" />
            Verify at: rama-coaching.vercel.app/verification
          </div>
          <div className="text-center">
            <img src={sig.ctrl} alt="Controller Signature" className="w-28 h-10 object-contain mx-auto mb-1" onError={(e)=>{(e.currentTarget as HTMLImageElement).src="/signature.png";}} />
            <div className="w-40 border-t border-gray-400 pt-1">
              <p className="text-xs text-gray-500">Controller of Examination</p>
              <p className="text-xs font-medium text-gray-700">Rama Coaching Center</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function FranchisePage() {
  const [loading,      setLoading]      = useState(true);
  const [applications, setApplications] = useState<FranchiseApplication[]>([]);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page,         setPage]         = useState(1);

  const [viewItem,    setViewItem]    = useState<FranchiseApplication | null>(null);
  const [deleteItem,  setDeleteItem]  = useState<FranchiseApplication | null>(null);
  const [rejectItem,  setRejectItem]  = useState<FranchiseApplication | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Certificate modal
  const [certLoading, setCertLoading] = useState(false);
  const [certData,    setCertData]    = useState<FranchiseCertificate | null>(null);
  const [certApp,     setCertApp]     = useState<FranchiseApplication | null>(null);
  const [certError,   setCertError]   = useState("");

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/franchise", { cache: "no-store" });
      const j   = await res.json();
      if (j.success) setApplications(j.data);
    } catch {}
    setLoading(false);
  };
  useEffect(() => { fetchList(); }, []);

  const pendingCount = useMemo(() => applications.filter(a => a.status === "pending").length, [applications]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter(a => {
      const matchS = !statusFilter || a.status === statusFilter;
      const matchQ = !q ||
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        (a.instituteName || "").toLowerCase().includes(q) ||
        (a.ownerName || "").toLowerCase().includes(q);
      return matchS && matchQ;
    });
  }, [applications, search, statusFilter]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged       = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  // ── Status helpers ────────────────────────────────────────────────────────
  async function setStatus(id: string, status: FranchiseStatus, extra?: Record<string, string>) {
    const res = await fetch(`/api/franchise/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...extra }),
    });
    const j = await res.json();
    if (!j.success) { alert(j.error || "Failed to update"); return; }
    await fetchList();
  }

  async function handleApprove(app: FranchiseApplication) {
    await setStatus(app.id, "approved");
    // If currently viewing this item, refresh view
    if (viewItem?.id === app.id) setViewItem({ ...app, status: "approved" });
  }

  async function handleReject() {
    if (!rejectItem) return;
    await setStatus(rejectItem.id, "rejected", { rejectionReason: rejectReason });
    setRejectItem(null);
    setRejectReason("");
  }

  async function confirmDelete() {
    if (!deleteItem) return;
    await fetch(`/api/franchise/${deleteItem.id}`, { method: "DELETE" });
    await fetchList();
    setDeleteItem(null);
    if (viewItem?.id === deleteItem.id) setViewItem(null);
  }

  // ── Certificate actions ───────────────────────────────────────────────────
  async function generateCert(app: FranchiseApplication) {
    setCertLoading(true);
    setCertError("");
    setCertApp(app);
    setCertData(null);
    try {
      const res = await fetch(`/api/franchise/${app.id}/certificate`, { method: "POST" });
      const j   = await res.json();
      if (j.success) {
        setCertData(j.data);
      } else {
        setCertError(j.error || "Failed to generate certificate");
      }
    } catch { setCertError("Network error"); }
    setCertLoading(false);
  }

  async function viewCert(app: FranchiseApplication) {
    setCertLoading(true);
    setCertError("");
    setCertApp(app);
    setCertData(null);
    try {
      const res = await fetch(`/api/franchise/${app.id}/certificate`);
      const j   = await res.json();
      if (j.success) {
        setCertData(j.data);
      } else {
        setCertError("Certificate not generated yet. Click 'Generate Certificate' first.");
      }
    } catch { setCertError("Network error"); }
    setCertLoading(false);
  }

  function printCert() {
    const el = document.getElementById("franchise-cert-print");
    if (!el) return;
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return;
    w.document.write(`
      <html><head><title>Franchise Certificate</title>
      <style>
        body { margin: 0; padding: 20px; background: white; }
        @media print { body { margin: 0; padding: 0; } }
      </style>
      </head><body>${el.outerHTML}</body></html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  }

  // ── Status pill colors ────────────────────────────────────────────────────
  const statusBtn: Record<FranchiseStatus, string> = {
    pending:   "border-amber-300 bg-amber-50 text-amber-700",
    contacted: "border-blue-300 bg-blue-50 text-blue-700",
    approved:  "border-green-300 bg-green-50 text-green-700",
    rejected:  "border-red-300 bg-red-50 text-red-700",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Franchise Applications"
        subtitle={
          loading
            ? "Loading…"
            : `${pendingCount} pending · ${applications.length} total`
        }
      />

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(["pending","contacted","approved","rejected"] as FranchiseStatus[]).map(s => {
            const count = applications.filter(a => a.status === s).length;
            const icons = { pending: Clock, contacted: PhoneCall, approved: CheckCircle2, rejected: XCircle };
            const cols  = { pending: "text-amber-600 bg-amber-50", contacted: "text-blue-600 bg-blue-50", approved: "text-green-600 bg-green-50", rejected: "text-red-600 bg-red-50" };
            const Icon  = icons[s];
            return (
              <button key={s} type="button" onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
                className={`rounded-xl border p-4 text-left transition-all ${statusFilter === s ? "border-navy bg-navy text-white shadow" : "bg-white border-slate-200 hover:border-slate-300"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${statusFilter === s ? "bg-white/20" : cols[s]}`}>
                    <Icon className={`w-3.5 h-3.5 ${statusFilter === s ? "text-white" : ""}`} />
                  </span>
                  <span className={`text-xs font-medium capitalize ${statusFilter === s ? "text-white/80" : "text-slate-500"}`}>{s}</span>
                </div>
                <p className={`text-2xl font-bold ${statusFilter === s ? "text-white" : "text-slate-800"}`}>{count}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name, email, institute, city…" />
        </div>
        <SelectInput value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
      </div>

      {/* Table */}
      {loading ? (
        <Card><Spinner label="Loading franchise applications…" /></Card>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Building2} title="No applications found"
          description="Try adjusting search or filter." />
      ) : (
        <>
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3">Applicant</th>
                  <th className="px-4 py-3">Institute</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paged.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{a.name}</p>
                      <p className="text-xs text-slate-500">{a.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-700">{a.instituteName || "—"}</p>
                      <p className="text-xs text-slate-400">{a.ownerName || ""}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{a.city}, {a.state}</td>
                    <td className="px-4 py-3 text-slate-600">{a.duration || "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{a.date}</td>
                    <td className="px-4 py-3">
                      <Badge variant={franchiseStatusVariant[a.status]}>
                        {titleCase(a.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 flex-wrap">
                        {/* View */}
                        <button type="button" onClick={() => setViewItem(a)}
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100" title="View Details">
                          <Eye className="h-4 w-4" />
                        </button>
                        {/* Quick Approve */}
                        {a.status !== "approved" && (
                          <button type="button" onClick={() => handleApprove(a)}
                            className="rounded-md p-1.5 text-green-600 hover:bg-green-50" title="Approve">
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}
                        {/* Quick Reject */}
                        {a.status !== "rejected" && (
                          <button type="button" onClick={() => { setRejectItem(a); setRejectReason(""); }}
                            className="rounded-md p-1.5 text-red-500 hover:bg-red-50" title="Reject">
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                        {/* Certificate — only if approved */}
                        {a.status === "approved" && (
                          <button type="button" onClick={() => viewCert(a)}
                            className="rounded-md p-1.5 text-amber-600 hover:bg-amber-50" title="View/Generate Certificate">
                            <Award className="h-4 w-4" />
                          </button>
                        )}
                        {/* Delete */}
                        <button type="button" onClick={() => setDeleteItem(a)}
                          className="rounded-md p-1.5 text-red-400 hover:bg-red-50" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {/* ── View Details Modal ── */}
      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Franchise Application" size="xl">
        {viewItem && (
          <div className="space-y-5">
            {/* Status bar */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={franchiseStatusVariant[viewItem.status]}>
                {titleCase(viewItem.status)}
              </Badge>
              <span className="text-xs text-slate-400">Applied: {viewItem.date}</span>
              {viewItem.approvedAt && (
                <span className="text-xs text-green-600 bg-green-50 rounded-full px-2 py-0.5">
                  Approved: {viewItem.approvedAt}
                </span>
              )}
              {viewItem.rejectionReason && (
                <span className="text-xs text-red-600 bg-red-50 rounded px-2 py-0.5">
                  Reason: {viewItem.rejectionReason}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Left col */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Applicant</p>
                <DRow label="Full Name"    value={viewItem.name} />
                <DRow label="Owner Name"   value={viewItem.ownerName} />
                <DRow label="Email"        value={viewItem.email} />
                <DRow label="Phone"        value={viewItem.phone} />
                <DRow label="City"         value={viewItem.city} />
                <DRow label="State"        value={viewItem.state} />
              </div>
              {/* Right col */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Institute & Period</p>
                <DRow label="Institute Name" value={viewItem.instituteName} />
                <DRow label="Duration"       value={viewItem.duration} />
                <DRow label="Start Date"     value={viewItem.startDate} />
                <DRow label="End Date"       value={viewItem.endDate} />
                <DRow label="Application ID" value={viewItem.id} mono />
              </div>
            </div>

            {/* Message */}
            {viewItem.message && (
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Message</p>
                <p className="text-sm text-slate-700">{viewItem.message}</p>
              </div>
            )}

            {/* Document */}
            {viewItem.documentUrl && (
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
                <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{viewItem.documentName || "Uploaded Document"}</p>
                </div>
                <a href={viewItem.documentUrl} download={viewItem.documentName || "document"}
                  className="inline-flex items-center gap-1.5 text-xs text-navy border border-slate-300 rounded px-3 py-1.5 hover:bg-slate-50">
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
              </div>
            )}

            {/* Workflow buttons */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              {viewItem.status !== "approved" && (
                <button type="button" onClick={() => { handleApprove(viewItem); setViewItem({ ...viewItem, status: "approved" }); }}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Approve Application
                </button>
              )}
              {viewItem.status !== "rejected" && (
                <button type="button" onClick={() => { setRejectItem(viewItem); setRejectReason(""); }}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium">
                  <XCircle className="w-4 h-4" /> Reject Application
                </button>
              )}
              {viewItem.status === "pending" && (
                <button type="button" onClick={() => setStatus(viewItem.id, "contacted").then(fetchList)}
                  className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 text-sm font-medium">
                  <PhoneCall className="w-4 h-4" /> Mark as Contacted
                </button>
              )}
              {viewItem.status === "approved" && (
                <button type="button" onClick={() => { setViewItem(null); generateCert(viewItem); }}
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-sm font-medium">
                  <Award className="w-4 h-4" /> Generate / View Certificate
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Reject Reason Modal ── */}
      <Modal open={!!rejectItem} onClose={() => setRejectItem(null)} title="Reject Application" size="sm"
        footer={
          <>
            <button type="button" onClick={() => setRejectItem(null)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button type="button" onClick={handleReject}
              className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-semibold">
              Confirm Reject
            </button>
          </>
        }>
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">
              You are about to reject the application from <strong>{rejectItem?.name}</strong>
              {rejectItem?.instituteName ? ` (${rejectItem.instituteName})` : ""}.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Reason for rejection (optional)
            </label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Incomplete documents, location not available…"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* ── Certificate Modal ── */}
      <Modal
        open={!!(certApp)}
        onClose={() => { setCertApp(null); setCertData(null); setCertError(""); }}
        title="Franchise Certificate"
        size="xl"
        footer={
          certData ? (
            <div className="flex items-center gap-2">
              <button type="button" onClick={printCert}
                className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep">
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
              <span className="text-xs text-slate-400">
                Cert No: <span className="font-mono font-bold text-slate-700">{certData.certificateNumber}</span>
              </span>
            </div>
          ) : undefined
        }
      >
        {certLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-amber-600" />
            <p className="ml-3 text-sm text-slate-500">Generating certificate…</p>
          </div>
        ) : certError ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertTriangle className="w-10 h-10 text-amber-400" />
            <p className="text-sm text-slate-600">{certError}</p>
            {certApp && (
              <button type="button" onClick={() => generateCert(certApp)}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 text-sm font-semibold">
                <Award className="w-4 h-4" /> Generate Certificate
              </button>
            )}
          </div>
        ) : certData && certApp ? (
          <div className="overflow-x-auto">
            <FranchiseCertView cert={certData} app={certApp} />
          </div>
        ) : null}
      </Modal>

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={confirmDelete}
        title="Delete Application"
        message={`Delete application from "${deleteItem?.name}"? This cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}
