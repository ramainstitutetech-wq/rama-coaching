"use client";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Field, TextInput } from "@/components/ui/Field";
import { EmptyState, Spinner } from "@/components/ui/EmptyState";
import { HallTicket } from "@/components/certificate/HallTicket";
import { ClipboardList, Plus, Printer, Eye, Search, Calendar, MapPin } from "lucide-react";

interface HTicket { id: string; ticketNumber: string; studentName: string; rollNo: string; courseName: string; examName: string; examDate: string; examCenter: string; examTime: string; hallNo: string; photoUrl: string; status: string; }

export default function HallTicketsPage() {
  const [list, setList] = useState<HTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<HTicket | null>(null);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ rollNo: "", examName: "", examDate: "", examCenter: "", examTime: "10:00 AM", hallNo: "" });
  const [students, setStudents] = useState<any[]>([]);
  const [studentQ, setStudentQ] = useState("");

  const fetchList = async () => {
    setLoading(true);
    const res = await fetch(`/api/hall-tickets?limit=100&search=${encodeURIComponent(search)}`, { cache: "no-store" }).then(r => r.json());
    if (res.success) setList(res.data);
    setLoading(false);
  };
  useEffect(() => { fetchList(); }, []);
  useEffect(() => { const t = setTimeout(fetchList, 400); return () => clearTimeout(t); }, [search]);

  const fetchStudents = async (q: string) => {
    if (!q.trim()) { setStudents([]); return; }
    const res = await fetch(`/api/students?search=${encodeURIComponent(q)}&limit=8`, { cache: "no-store" }).then(r => r.json());
    if (res.success) setStudents(res.data);
  };

  async function handleCreate() {
    setErr("");
    if (!form.rollNo.trim() || !form.examName.trim() || !form.examDate || !form.examCenter.trim()) { setErr("Roll No, Exam Name, Date, Center required"); return; }
    setSaving(true);
    const res = await fetch("/api/hall-tickets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }).then(r => r.json());
    setSaving(false);
    if (!res.success) { setErr(res.error || "Failed"); return; }
    setModalOpen(false);
    setForm({ rollNo: "", examName: "", examDate: "", examCenter: "", examTime: "10:00 AM", hallNo: "" });
    await fetchList();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Hall Tickets" subtitle="Generate & print exam hall tickets — photo + course auto from student" actions={<button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep"><Plus className="h-4 w-4" />Generate Hall Ticket</button>} />
      <div className="flex gap-3"><div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search ticket, roll, course, exam..." /></div></div>
      {loading ? <Spinner label="Loading..." /> : list.length === 0 ? <EmptyState icon={ClipboardList} title="No hall tickets" description="Generate first hall ticket via button above." /> : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400"><tr><th className="px-4 py-3">Ticket</th><th className="px-4 py-3">Student</th><th className="px-4 py-3">Exam</th><th className="px-4 py-3">Center</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {list.map(t => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[#1F3354]">{t.ticketNumber}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2">{t.photoUrl ? <img src={t.photoUrl} alt={t.studentName} className="w-8 h-8 rounded-full object-cover border" /> : <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">{t.studentName.split(" ").map(p=>p[0]).slice(0,2).join("")}</div>}<div><p className="font-medium text-slate-800 text-xs">{t.studentName}</p><p className="text-xs text-slate-500">{t.rollNo} • {t.courseName}</p></div></div></td>
                  <td className="px-4 py-3"><p className="font-medium text-slate-700 text-xs flex items-center gap-1"><ClipboardList className="h-3 w-3" />{t.examName}</p><p className="text-xs text-slate-500 flex items-center gap-1"><Calendar className="h-3 w-3" />{t.examDate} {t.examTime}</p></td>
                  <td className="px-4 py-3 text-xs text-slate-600 flex items-center gap-1"><MapPin className="h-3 w-3" />{t.examCenter} {t.hallNo && `• Hall ${t.hallNo}`}</td>
                  <td className="px-4 py-3"><div className="flex items-center justify-end gap-1">
                    <button onClick={() => setPreview(t)} className="p-1.5 rounded hover:bg-slate-100" title="Preview"><Eye className="h-4 w-4 text-slate-600" /></button>
                    <a href={`/print?id=${t.id}&type=hallticket`} target="_blank" className="p-1.5 rounded hover:bg-slate-100" title="Print"><Printer className="h-4 w-4 text-slate-600" /></a>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Generate Hall Ticket" size="lg" footer={<><button onClick={() => setModalOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">Cancel</button><button onClick={handleCreate} disabled={saving} className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Creating..." : "Generate"}</button></>}>
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
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Search className="h-3 w-3" />Type roll or name to search active students</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Exam Name *"><TextInput value={form.examName} onChange={e => setForm({ ...form, examName: e.target.value })} placeholder="e.g. Final Exam 2026" /></Field>
            <Field label="Exam Date *"><TextInput type="date" value={form.examDate} onChange={e => setForm({ ...form, examDate: e.target.value })} /></Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Exam Center *"><TextInput value={form.examCenter} onChange={e => setForm({ ...form, examCenter: e.target.value })} placeholder="e.g. Main Campus, Fatehpur" /></Field>
            <Field label="Exam Time"><TextInput value={form.examTime} onChange={e => setForm({ ...form, examTime: e.target.value })} placeholder="10:00 AM - 1:00 PM" /></Field>
          </div>
          <Field label="Hall No (Optional)"><TextInput value={form.hallNo} onChange={e => setForm({ ...form, hallNo: e.target.value })} placeholder="e.g. Hall A-12" /></Field>
          <p className="text-xs text-slate-500">Photo, course, batch auto-filled from student profile — same photo used for ID Card.</p>
        </div>
      </Modal>

      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview ? `Hall Ticket — ${preview.ticketNumber}` : "Preview"} size="xl" footer={<><button onClick={() => setPreview(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">Close</button>{preview && <a href={`/print?id=${preview.id}&type=hallticket`} target="_blank" className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white inline-flex items-center gap-2"><Printer className="h-4 w-4" />Print</a>}</>}>
        {preview && <div className="max-h-[70vh] overflow-auto flex justify-center p-2 bg-slate-50 rounded-lg"><div style={{ transform: "scale(0.78)", transformOrigin: "top center" }}><HallTicket data={{ ticketNumber: (preview as any).ticketNumber, studentName: (preview as any).studentName, fatherName: (preview as any).fatherName || "", motherName: (preview as any).motherName || "", rollNo: (preview as any).rollNo, courseName: (preview as any).courseName, batch: (preview as any).batch || "", examName: (preview as any).examName, examDate: (preview as any).examDate || "", examCenter: (preview as any).examCenter || "", examTime: (preview as any).examTime || "", hallNo: (preview as any).hallNo || "", photoUrl: (preview as any).photoUrl || "" }} /></div></div>}
      </Modal>
    </div>
  );
}
