"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock, Eye, AlertTriangle, Search, Filter, Phone, Mail, IndianRupee, FileText } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

interface Enroll {
  id: string;
  enrollmentId: string;
  courseName: string;
  courseFees: string;
  applicantType: "student" | "outsider";
  fullName: string;
  email: string;
  phone: string;
  fatherName?: string;
  address?: string;
  amount: string;
  utr: string;
  proofUrl: string;
  status: "pending_verification" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt: string;
}

export default function AdminEnrollmentsPage() {
  const [list, setList] = useState<Enroll[]>([]);
  const [filter, setFilter] = useState<"all" | "pending_verification" | "approved" | "rejected">("pending_verification");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  async function load() {
    setLoading(true);
    const q = filter === "all" ? "" : `?status=${filter}`;
    const res = await fetch(`/api/enrollments${q}`, { cache: "no-store" }).then(r=>r.json());
    if (res.success) setList(res.data);
    setLoading(false);
  }

  useEffect(()=>{ load(); }, [filter]);

  const filtered = list.filter(e => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return e.enrollmentId.toLowerCase().includes(s) || e.fullName.toLowerCase().includes(s) || e.email.toLowerCase().includes(s) || e.utr.toLowerCase().includes(s) || e.phone.includes(s);
  });

  async function approve(id: string) {
    if (!confirm("Approve this enrollment? Verify UTR & amount first.")) return;
    setActionId(id);
    const res = await fetch(`/api/enrollments/${id}`, { method:"PUT", headers:{ "Content-Type":"application/json"}, body: JSON.stringify({ action:"approve"}) }).then(r=>r.json());
    if (!res.success) alert(res.error || "Failed");
    else load();
    setActionId(null);
  }

  async function reject(id: string) {
    if (!rejectReason.trim()) { alert("Rejection reason required"); return; }
    setActionId(id);
    const res = await fetch(`/api/enrollments/${id}`, { method:"PUT", headers:{ "Content-Type":"application/json"}, body: JSON.stringify({ action:"reject", reason: rejectReason}) }).then(r=>r.json());
    if (!res.success) alert(res.error || "Failed");
    else { setRejectId(null); setRejectReason(""); load(); }
    setActionId(null);
  }

  const pendingCount = list.filter(e=>e.status==="pending_verification").length;

  return (
    <div className="space-y-6">
      <PageHeader title="Enrollments" subtitle={`QR Payment verification — ${pendingCount} pending — Manual approve required for safety`} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          { (["pending_verification","approved","rejected","all"] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize border ${filter===f ? "bg-[#1F3354] text-white border-[#1F3354]":"bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
              {f.replace("_"," ")}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search ID, name, UTR, phone" className="pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm w-64 outline-none focus:border-[#1F3354]" />
          </div>
          <button onClick={load} className="px-4 py-2 rounded-lg bg-slate-100 text-sm hover:bg-slate-200">Refresh</button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#1F3354]" /></div>
      ) : filtered.length===0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
          <FileText className="h-10 w-10 mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-600">No enrollments found for <strong>{filter}</strong></p>
          <p className="text-xs text-slate-400 mt-1">When students use Enroll Now + QR, requests will appear here.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-xs text-slate-500 uppercase">
                  <th className="px-4 py-3">Enrollment</th>
                  <th className="px-4 py-3">Applicant</th>
                  <th className="px-4 py-3">Course / Amount</th>
                  <th className="px-4 py-3">UTR / Proof</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(e=>(
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-bold text-[#1F3354]">{e.enrollmentId}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(e.createdAt).toLocaleString("en-IN")}</p>
                      <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${e.applicantType==="student" ? "bg-emerald-50 text-emerald-700 border border-emerald-200":"bg-amber-50 text-amber-700 border border-amber-200"}`}>{e.applicantType}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{e.fullName}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1"><Mail className="h-3 w-3" />{e.email}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1"><Phone className="h-3 w-3" />{e.phone}</p>
                      {e.fatherName && <p className="text-[11px] text-slate-400">Father: {e.fatherName}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{e.courseName}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1"><IndianRupee className="h-3 w-3" />{e.amount} <span className="text-[11px]"> (Fees: {e.courseFees})</span></p>
                      {String(e.amount).replace(/[₹,\s]/g,"") !== String(e.courseFees).replace(/[₹,\s]/g,"") && <span className="text-[11px] bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded">Amount Mismatch!</span>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs bg-slate-100 px-2 py-1 rounded select-all">{e.utr}</p>
                      <a href={e.proofUrl} target="_blank" className="inline-flex items-center gap-1 mt-1 text-xs text-[#1F3354] hover:underline"><Eye className="h-3 w-3" /> View Proof</a>
                    </td>
                    <td className="px-4 py-3">
                      {e.status==="pending_verification" && <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 px-2 py-1 rounded-full text-xs"><Clock className="h-3 w-3" /> Pending</span>}
                      {e.status==="approved" && <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-1 rounded-full text-xs"><CheckCircle2 className="h-3 w-3" /> Approved</span>}
                      {e.status==="rejected" && <span className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-700 px-2 py-1 rounded-full text-xs"><XCircle className="h-3 w-3" /> Rejected</span>}
                      {e.rejectionReason && <p className="text-[11px] text-red-600 mt-1">{e.rejectionReason}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {e.status==="pending_verification" ? (
                        <div className="flex flex-col gap-1">
                          <button onClick={()=>approve(e.id)} disabled={actionId===e.id} className="inline-flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-60">
                            {actionId===e.id ? "..." : <><CheckCircle2 className="h-3 w-3" /> Approve</>}
                          </button>
                          {rejectId===e.id ? (
                            <div className="border border-red-200 bg-red-50 rounded-lg p-2 space-y-1">
                              <input value={rejectReason} onChange={ev=>setRejectReason(ev.target.value)} placeholder="Reason" className="w-full px-2 py-1 rounded border text-xs" />
                              <div className="flex gap-1">
                                <button onClick={()=>reject(e.id)} disabled={actionId===e.id} className="flex-1 bg-red-600 text-white rounded px-2 py-1 text-xs">Confirm Reject</button>
                                <button onClick={()=>setRejectId(null)} className="px-2 py-1 text-xs border rounded bg-white">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={()=>setRejectId(e.id)} className="inline-flex items-center justify-center gap-1 border border-red-200 text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs">
                              <XCircle className="h-3 w-3" /> Reject
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Safety Checklist before Approve:</p>
          <ul className="text-xs text-amber-700 list-disc ml-4 mt-1 space-y-1">
            <li>UTR UPI app se verify karo — amount ₹{filtered[0]?.amount || "course fee"} exact hona chahiye</li>
            <li>Screenshot me amount + UTR + date clear dikhe</li>
            <li>Duplicate UTR already DB me block hai (unique index)</li>
            <li>Outsider approve karne ke baad Student account `Students` page se banao</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
