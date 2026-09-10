"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Trash2, CheckCircle2, XCircle, Pause, FileText, Download, Clock, Users, AlertTriangle, Search, Filter } from "lucide-react";
import { PageHeader, Card } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { SearchInput, SelectInput } from "@/components/ui/SearchInput";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState, Spinner } from "@/components/ui/EmptyState";

type RegStatus = "pending" | "active" | "inactive" | "completed";

interface Registration {
  id: string;
  fullName: string;
  rollNumber: string;
  email: string;
  phone: string;
  course: string;
  batch: string;
  status: RegStatus;
  parentName?: string;
  dob?: string;
  gender?: string;
  category?: string;
  address?: string;
  qualification?: string;
  passingYear?: string;
  aadhaarNumber?: string;
  apaarId?: string;
  aadhaarCardUrl?: string;
  marksheetUrl?: string;
  photoUrl?: string;
  signatureUrl?: string;
  thumbUrl?: string;
  admissionDate?: string;
  createdAt?: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Requests" },
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

function DocLink({ label, url }: { label: string; url?: string }) {
  if (!url) return <p className="text-xs text-slate-400">{label}: Not uploaded</p>;
  const isImage = url.match(/\.(jpg|jpeg|png|webp)$/i) || url.includes("/uploads");
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
      <span className="text-sm font-medium flex-1 truncate">{label}</span>
      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md bg-[#1F3354] text-white px-2.5 py-1 text-xs hover:bg-[#162640]">
        <Eye className="w-3 h-3" /> View
      </a>
      <a href={url} download className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1 text-xs hover:bg-slate-50">
        <Download className="w-3 h-3" /> Download
      </a>
    </div>
  );
}

export default function RegistrationsPage() {
  const [items, setItems] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [viewItem, setViewItem] = useState<Registration | null>(null);
  const [deleteItem, setDeleteItem] = useState<Registration | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const PAGE_SIZE = 8;

  const fetchList = async () => {
    setLoading(true);
    try {
      // Fetch all students with pending/inactive/active but we filter for registration-like (has parentName or temp)
      const res = await fetch(`/api/students?limit=100`, { cache: "no-store" }).then(r=>r.json());
      if (res.success) {
        // For demo, treat all as registrations; filter by status
        const regs = res.data.map((d: any) => ({
          id: d.id,
          fullName: d.fullName,
          rollNumber: d.rollNumber,
          email: d.email,
          phone: d.phone,
          course: d.course,
          batch: d.batch,
          status: d.status,
          parentName: d.parentName,
          dob: d.dob,
          gender: d.gender,
          category: d.category,
          address: d.address,
          qualification: d.qualification,
          passingYear: d.passingYear,
          aadhaarNumber: d.aadhaarNumber,
          apaarId: d.apaarId,
          aadhaarCardUrl: d.aadhaarCardUrl,
          marksheetUrl: d.marksheetUrl,
          photoUrl: d.photoUrl,
          signatureUrl: d.signatureUrl,
          thumbUrl: d.thumbUrl,
          admissionDate: d.admissionDate,
          createdAt: d.createdAt,
        }));
        setItems(regs);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(()=>{ fetchList(); }, []);

  const filtered = useMemo(()=>{
    const q = search.trim().toLowerCase();
    return items.filter(i=>{
      const matchStatus = statusFilter==="all" || i.status===statusFilter;
      const matchQ = !q || i.fullName.toLowerCase().includes(q) || i.email.toLowerCase().includes(q) || i.phone.includes(q) || i.course.toLowerCase().includes(q);
      return matchStatus && matchQ;
    });
  }, [items, search, statusFilter]);

  const paged = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  async function handleStatus(id: string, newStatus: string){
    setActionLoading(id);
    try {
      if(newStatus==="active"){
        // Dedicated activate endpoint: sets active + sends Welcome email with credentials
        const res = await fetch(`/api/admin/registrations/${id}/activate`, { method:"POST" }).then(r=>r.json());
        if(!res.success){ alert(res.error || "Failed"); }
        else {
          alert(res.message || "Activated and email sent!");
          await fetchList();
          if(viewItem?.id===id) setViewItem(null);
        }
      } else {
        const res = await fetch(`/api/students/${id}`, { method:"PUT", headers:{ "Content-Type":"application/json"}, body: JSON.stringify({ status: newStatus }) }).then(r=>r.json());
        if(!res.success){ alert(res.error || "Failed"); }
        else {
          await fetchList();
          if(viewItem?.id===id) setViewItem(null);
        }
      }
    } catch {}
    setActionLoading(null);
  }

  async function handleDelete(){
    if(!deleteItem) return;
    setActionLoading(deleteItem.id);
    try {
      const res = await fetch(`/api/students/${deleteItem.id}`, { method:"DELETE" }).then(r=>r.json());
      if(!res.success) alert(res.error || "Delete failed");
      else await fetchList();
    } catch {}
    setActionLoading(null);
    setDeleteItem(null);
    if(viewItem?.id===deleteItem.id) setViewItem(null);
  }

  const pendingCount = items.filter(i=>i.status==="pending").length;

  return (
    <div className="space-y-6">
      <PageHeader title="Registration Requests" subtitle={`${pendingCount} pending — Dedicated Student Approvals`} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { k:"pending", label:"Pending", color:"bg-amber-50 text-amber-700 border-amber-200", count: items.filter(i=>i.status==="pending").length },
          { k:"active", label:"Active", color:"bg-emerald-50 text-emerald-700 border-emerald-200", count: items.filter(i=>i.status==="active").length },
          { k:"inactive", label:"Inactive", color:"bg-slate-100 text-slate-600 border-slate-200", count: items.filter(i=>i.status==="inactive").length },
          { k:"all", label:"Total", color:"bg-white text-slate-700 border-slate-200", count: items.length },
        ].map(s=>(
          <div key={s.k} className={`rounded-xl border p-4 ${s.color}`}>
            <p className="text-xs font-medium capitalize">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.count}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search name, email, phone, course..." /></div>
        <SelectInput value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
      </div>

      {loading ? <Card><Spinner label="Loading requests..." /></Card> : filtered.length===0 ? (
        <EmptyState icon={Users} title="No registration requests" description="No students found for selected filter." />
      ) : (
        <>
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paged.map(r=>(
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{r.fullName}</p>
                      <p className="text-xs text-slate-500">{r.rollNumber} • {r.batch}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{r.course}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-600">{r.email}</p>
                      <p className="text-xs text-slate-500">{r.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={r.status==="pending" ? "warning" : r.status==="active" ? "success" : "neutral"}>{r.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={()=>setViewItem(r)} className="p-1.5 rounded hover:bg-slate-100" title="View Documents"><Eye className="w-4 h-4 text-slate-600" /></button>
                        {r.status !== "active" && <button disabled={actionLoading===r.id} onClick={()=>handleStatus(r.id, "active")} className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600" title="Active"><CheckCircle2 className="w-4 h-4" /></button>}
                        {r.status !== "inactive" && r.status === "active" && <button disabled={actionLoading===r.id} onClick={()=>handleStatus(r.id, "inactive")} className="p-1.5 rounded hover:bg-slate-100 text-slate-500" title="Inactive"><Pause className="w-4 h-4" /></button>}
                        <button onClick={()=>setDeleteItem(r)} className="p-1.5 rounded hover:bg-red-50 text-red-600" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {/* View Modal */}
      <Modal open={!!viewItem} onClose={()=>setViewItem(null)} title={viewItem ? `Registration — ${viewItem.fullName}` : "Details"} size="xl">
        {viewItem && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-slate-500">Full Name</p><p className="font-medium">{viewItem.fullName}</p></div>
              <div><p className="text-xs text-slate-500">Parent Name</p><p className="font-medium">{viewItem.parentName || "—"}</p></div>
              <div><p className="text-xs text-slate-500">DOB</p><p className="font-medium">{viewItem.dob ? new Date(viewItem.dob).toLocaleDateString("en-IN") : "—"}</p></div>
              <div><p className="text-xs text-slate-500">Gender / Category</p><p className="font-medium">{viewItem.gender || "—"} / {viewItem.category || "—"}</p></div>
              <div><p className="text-xs text-slate-500">Phone</p><p className="font-medium">{viewItem.phone}</p></div>
              <div><p className="text-xs text-slate-500">Email</p><p className="font-medium">{viewItem.email}</p></div>
              <div className="col-span-2"><p className="text-xs text-slate-500">Address</p><p className="font-medium">{viewItem.address || "—"}</p></div>
              <div><p className="text-xs text-slate-500">Course</p><p className="font-medium">{viewItem.course} ({viewItem.batch})</p></div>
              <div><p className="text-xs text-slate-500">Qualification / Year</p><p className="font-medium">{viewItem.qualification || "—"} / {viewItem.passingYear || "—"}</p></div>
              <div><p className="text-xs text-slate-500">Aadhaar</p><p className="font-medium font-mono">{viewItem.aadhaarNumber || "—"}</p></div>
              <div><p className="text-xs text-slate-500">APAAR ID</p><p className="font-medium">{viewItem.apaarId || "—"}</p></div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2"><FileText className="w-4 h-4" /> Uploaded Documents (View / Download)</h4>
              <DocLink label="Aadhaar Card" url={viewItem.aadhaarCardUrl} />
              <DocLink label="Marksheet" url={viewItem.marksheetUrl} />
              <DocLink label="Photo" url={viewItem.photoUrl} />
              <DocLink label="Signature" url={viewItem.signatureUrl} />
              <DocLink label="Thumb Impression" url={viewItem.thumbUrl} />
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-100">
              {viewItem.status !== "active" && <button onClick={()=>handleStatus(viewItem.id, "active")} disabled={actionLoading===viewItem.id} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm hover:bg-emerald-700 disabled:opacity-60"><CheckCircle2 className="w-4 h-4" /> Active (Accept & Send Email)</button>}
              {viewItem.status === "active" && <button onClick={()=>handleStatus(viewItem.id, "inactive")} disabled={actionLoading===viewItem.id} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"><Pause className="w-4 h-4" /> Inactive</button>}
              <button onClick={()=>{ setDeleteItem(viewItem); }} className="inline-flex items-center gap-1 rounded-lg border border-red-200 text-red-600 px-4 py-2 text-sm hover:bg-red-50"><Trash2 className="w-4 h-4" /> Delete</button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteItem}
        onClose={()=>setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Delete Student?"
        message={`Are you sure you want to delete this student "${deleteItem?.fullName}"? This cannot be undone.`}
        confirmText="Yes, Delete"
      />
    </div>
  );
}
