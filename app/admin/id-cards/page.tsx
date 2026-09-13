"use client";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { Modal } from "@/components/ui/Modal";
import { Field, TextInput } from "@/components/ui/Field";
import { EmptyState, Spinner } from "@/components/ui/EmptyState";
import { IDCard } from "@/components/certificate/IDCard";
import { BadgeCheck, Plus, Printer, Eye, Search } from "lucide-react";

interface Card { id: string; cardNumber: string; studentName: string; rollNo: string; courseName: string; batch: string; photoUrl: string; issueDate: string; validTill: string; status: string; }

export default function IDCardsPage() {
  const [list, setList] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [preview, setPreview] = useState<Card | null>(null);
  const [form, setForm] = useState({ rollNo: "", validTill: "" });
  const [students, setStudents] = useState<any[]>([]);
  const [studentQ, setStudentQ] = useState("");

  const fetchList = async () => {
    setLoading(true);
    const res = await fetch(`/api/id-cards?limit=100&search=${encodeURIComponent(search)}`, { cache: "no-store" }).then(r => r.json());
    if (res.success) setList(res.data);
    setLoading(false);
  };
  useEffect(() => { fetchList(); }, []);
  useEffect(() => { const t = setTimeout(fetchList, 400); return () => clearTimeout(t); }, [search]);

  const fetchStudents = async (q: string) => {
    if (!q.trim()) { setStudents([]); return; }
    const res = await fetch(`/api/students?search=${encodeURIComponent(q)}&limit=8`, { cache: "no-store" }).then(r => r.json());
    if (res.success) setStudents(res.data.filter((s: any) => s.status === "active"));
  };

  async function handleCreate() {
    setErr("");
    if (!form.rollNo.trim()) { setErr("Roll No required"); return; }
    setSaving(true);
    const res = await fetch("/api/id-cards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rollNo: form.rollNo, validTill: form.validTill || undefined }) }).then(r => r.json());
    setSaving(false);
    if (!res.success) { setErr(res.error || "Failed"); return; }
    setModalOpen(false);
    setForm({ rollNo: "", validTill: "" });
    await fetchList();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="ID Cards" subtitle="Generate student ID cards — uses profile photo from registration" actions={<button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep"><Plus className="h-4 w-4" />Generate ID Card</button>} />
      <div className="flex gap-3"><div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search card, roll, course..." /></div></div>
      {loading ? <Spinner label="Loading..." /> : list.length === 0 ? <EmptyState icon={BadgeCheck} title="No ID cards" description="Generate ID card for active students. Photo auto-filled from registration." /> : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400"><tr><th className="px-4 py-3">Card</th><th className="px-4 py-3">Student</th><th className="px-4 py-3">Valid Till</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {list.map(c => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[#1F3354]">{c.cardNumber}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2">{c.photoUrl ? <img src={c.photoUrl} alt={c.studentName} className="w-8 h-8 rounded-full object-cover border" /> : <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">{c.studentName.split(" ").map(p=>p[0]).slice(0,2).join("")}</div>}<div><p className="font-medium text-slate-800 text-xs">{c.studentName}</p><p className="text-xs text-slate-500">{c.rollNo} • {c.courseName} • {c.batch}</p></div></div></td>
                  <td className="px-4 py-3 text-xs text-slate-600">{c.issueDate} → {c.validTill} <span className="ml-1 inline-flex bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">{c.status}</span></td>
                  <td className="px-4 py-3"><div className="flex items-center justify-end gap-1">
                    <button onClick={() => setPreview(c)} className="p-1.5 rounded hover:bg-slate-100" title="Preview"><Eye className="h-4 w-4 text-slate-600" /></button>
                    <a href={`/print?id=${c.id}&type=idcard`} target="_blank" className="p-1.5 rounded hover:bg-slate-100" title="Print"><Printer className="h-4 w-4 text-slate-600" /></a>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Generate ID Card" size="md" footer={<><button onClick={() => setModalOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">Cancel</button><button onClick={handleCreate} disabled={saving} className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Creating..." : "Generate"}</button></>}>
        <div className="space-y-4">
          {err && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}
          <div className="relative">
            <Field label="Roll No / Search Student *"><TextInput value={form.rollNo} onChange={e => { setForm({ ...form, rollNo: e.target.value }); setStudentQ(e.target.value); fetchStudents(e.target.value); }} placeholder="RCC/2026/001 or type name" /></Field>
            {students.length > 0 && studentQ && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg max-h-40 overflow-y-auto">
                {students.map((s: any) => (
                  <button key={s.id} type="button" onClick={() => { setForm({ ...form, rollNo: s.rollNumber }); setStudents([]); setStudentQ(""); }} className="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm flex items-center gap-2">
                    {s.photoUrl ? <img src={s.photoUrl} alt={s.fullName} className="w-6 h-6 rounded-full object-cover" /> : <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs">{s.fullName[0]}</span>}
                    <span className="font-medium">{s.fullName}</span><span className="text-xs text-slate-500">{s.rollNumber} • {s.course}</span>
                  </button>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Search className="h-3 w-3" />Only active students (must be activated first)</p>
          </div>
          <Field label="Valid Till (optional)"><TextInput type="date" value={form.validTill} onChange={e => setForm({ ...form, validTill: e.target.value })} /></Field>
          <p className="text-xs text-slate-500">Empty = 1 year from today. Photo, DOB, phone, address auto from student profile.</p>
        </div>
      </Modal>

      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview ? `ID Card — ${preview.cardNumber}` : "Preview"} size="xl" footer={<><button onClick={() => setPreview(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">Close</button>{preview && <a href={`/print?id=${preview.id}&type=idcard`} target="_blank" className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white inline-flex items-center gap-2"><Printer className="h-4 w-4" />Print</a>}</>}>
        {preview && <div className="max-h-[70vh] overflow-auto flex justify-center p-4 bg-slate-50 rounded-lg"><IDCard data={{ cardNumber: (preview as any).cardNumber, studentName: (preview as any).studentName, fatherName: (preview as any).fatherName || "", rollNo: (preview as any).rollNo, courseName: (preview as any).courseName, batch: (preview as any).batch || "", dob: (preview as any).dob || "", phone: (preview as any).phone || "", address: (preview as any).address || "", photoUrl: (preview as any).photoUrl || "", issueDate: (preview as any).issueDate || "", validTill: (preview as any).validTill || "" }} /></div>}
      </Modal>
    </div>
  );
}
