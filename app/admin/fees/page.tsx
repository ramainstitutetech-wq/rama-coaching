"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  IndianRupee, Plus, Search, RefreshCw, MessageCircle, Mail,
  Printer, ChevronDown, ChevronUp, X, Check, AlertCircle,
  TrendingUp, Wallet, Clock, CalendarDays, User, Phone,
  BookOpen, CreditCard, Filter, Eye, Trash2, Edit2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FeeRecord {
  id: string;
  rollNumber: string;
  studentName: string;
  phone: string;
  email: string;
  courseName: string;
  batch: string;
  totalFees: number;
  finalFees: number;
  paidAmount: number;
  dueAmount: number;
  discount: number;
  status: "paid" | "partial" | "unpaid";
  dueDate: string | null;
  paymentsCount: number;
  lastPayment: any;
  createdAt: string;
}

interface Summary {
  totalExpected: number;
  totalCollected: number;
  totalDue: number;
  todayCollection: number;
}

interface Student { id: string; fullName: string; rollNumber: string; phone: string; email: string; courseName: string; batch: string; }

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const pct = (paid: number, total: number) => total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

const STATUS_COLOR: Record<string, string> = {
  paid:    "bg-green-100 text-green-700 border-green-200",
  partial: "bg-amber-100 text-amber-700 border-amber-200",
  unpaid:  "bg-red-100 text-red-700 border-red-200",
};
const STATUS_LABEL: Record<string, string> = { paid: "पूरी जमा", partial: "आंशिक", unpaid: "बकाया" };

// WhatsApp message builder
function buildWAReceiptMsg(r: FeeRecord, lastPayment?: any) {
  const amount = lastPayment?.amount || r.paidAmount;
  const receiptNo = lastPayment?.receiptNo || "-";
  const mode = lastPayment?.paymentMode || "Cash";
  return encodeURIComponent(
    `*RAMA COACHING CENTER*\n*And Computer Education Center, Fatehpur (U.P.)*\n\n` +
    `📄 *Fee Payment Receipt*\n\n` +
    `👤 Name: ${r.studentName}\n` +
    `🎫 Roll No: ${r.rollNumber}\n` +
    `📚 Course: ${r.courseName}\n` +
    `🧾 Receipt No: ${receiptNo}\n` +
    `💳 Mode: ${mode}\n` +
    `✅ Amount Paid: ₹${amount.toLocaleString("en-IN")}\n` +
    `📊 Total Fee: ₹${r.finalFees.toLocaleString("en-IN")}\n` +
    `⚠️ Balance Due: ₹${r.dueAmount.toLocaleString("en-IN")}${r.dueAmount === 0 ? " (Fully Paid ✓)" : ""}\n\n` +
    `धन्यवाद! 🙏\nContact: +91 99351 01221`
  );
}

function buildWAReminderMsg(r: FeeRecord) {
  return encodeURIComponent(
    `*RAMA COACHING CENTER*\n*And Computer Education Center, Fatehpur (U.P.)*\n\n` +
    `⚠️ *Fee Due Reminder*\n\n` +
    `नमस्ते ${r.studentName} जी,\n\n` +
    `आपकी *${r.courseName}* कोर्स की फीस का विवरण:\n\n` +
    `💰 Total Fee: ₹${r.finalFees.toLocaleString("en-IN")}\n` +
    `✅ Paid: ₹${r.paidAmount.toLocaleString("en-IN")}\n` +
    `🔴 *Due: ₹${r.dueAmount.toLocaleString("en-IN")}*\n\n` +
    `कृपया शीघ्र अपनी बकाया फीस जमा करें।\n` +
    `📞 Contact: +91 99351 01221 / +91 70074 82145\n\n` +
    `धन्यवाद!`
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sub }: { label: string; value: string; icon: any; color: string; sub?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-lg font-bold text-gray-900 truncate">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Collect Fee Modal ────────────────────────────────────────────────────────
function CollectFeeModal({
  record,
  onClose,
  onSuccess,
}: {
  record: FeeRecord;
  onClose: () => void;
  onSuccess: (receiptNo: string) => void;
}) {
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("Cash");
  const [txId, setTxId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    setErr("");
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setErr("राशि सही दर्ज करें"); return; }
    if (amt > record.dueAmount + 0.01) { setErr(`अधिकतम ₹${record.dueAmount.toLocaleString("en-IN")} ही देय है`); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "collect", feeRecordId: record.id, amount: amt, paymentMode: mode, transactionId: txId, remarks }),
      });
      const j = await res.json();
      if (!j.success) { setErr(j.error || "Failed"); setSaving(false); return; }
      onSuccess(j.receiptNo);
    } catch { setErr("Network error"); setSaving(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-[#1F3354] text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">💰 Fee Collect करें</h3>
            <p className="text-blue-200 text-sm mt-0.5">{record.studentName} — {record.rollNumber}</p>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {/* Fee summary */}
        <div className="px-6 py-3 bg-amber-50 border-b border-amber-100 grid grid-cols-3 gap-2 text-center">
          <div><p className="text-xs text-gray-500">Total</p><p className="font-bold text-gray-800 text-sm">{fmt(record.finalFees)}</p></div>
          <div><p className="text-xs text-gray-500">Paid</p><p className="font-bold text-green-600 text-sm">{fmt(record.paidAmount)}</p></div>
          <div><p className="text-xs text-gray-500">Due</p><p className="font-bold text-red-600 text-sm">{fmt(record.dueAmount)}</p></div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {err && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4 flex-shrink-0" />{err}</div>}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Amount (₹) <span className="text-red-500">*</span></label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={`Max: ${record.dueAmount}`}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#1F3354] outline-none"
            />
            <div className="flex gap-2 mt-2">
              {[record.dueAmount, Math.round(record.dueAmount / 2), Math.round(record.dueAmount / 3)].filter(v => v > 0 && v !== record.dueAmount / 2 || v === record.dueAmount).slice(0, 3).map(v => (
                <button key={v} onClick={() => setAmount(String(v))} className="px-2 py-1 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded text-xs border transition">
                  ₹{Math.round(v).toLocaleString("en-IN")}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Payment Mode</label>
            <div className="grid grid-cols-4 gap-2">
              {["Cash", "UPI", "Bank", "Cheque"].map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className={`py-2 rounded-lg text-xs font-semibold border transition ${mode === m ? "bg-[#1F3354] text-white border-[#1F3354]" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300"}`}
                >{m}</button>
              ))}
            </div>
          </div>

          {(mode === "UPI" || mode === "Bank") && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Transaction ID</label>
              <input value={txId} onChange={e => setTxId(e.target.value)} placeholder="UTR / Txn ID"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1F3354] outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Remarks (Optional)</label>
            <input value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="जैसे: 1st Installment"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1F3354] outline-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">रद्द करें</button>
            <button onClick={submit} disabled={saving} className="flex-1 py-2.5 rounded-lg bg-[#1F3354] text-white text-sm font-bold hover:bg-blue-900 transition disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <><RefreshCw className="w-4 h-4 animate-spin" />सेव हो रहा है...</> : <><Check className="w-4 h-4" />Fee Save करें</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── New Fee Record Modal ──────────────────────────────────────────────────────
function NewFeeModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Student | null>(null);
  const [courseFee, setCourseFee] = useState("");
  const [regFee, setRegFee] = useState("200");
  const [discount, setDiscount] = useState("0");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) { setStudents([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      const res = await fetch(`/api/students?search=${encodeURIComponent(query)}&limit=10`).then(r => r.json()).catch(() => ({}));
      setStudents(res.data || []);
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  async function submit() {
    setErr("");
    if (!picked) { setErr("छात्र चुनें"); return; }
    const cFee = parseFloat(courseFee);
    if (!cFee || cFee <= 0) { setErr("Course fee दर्ज करें"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: picked.id, rollNumber: picked.rollNumber, studentName: picked.fullName,
          phone: picked.phone, email: picked.email, courseName: picked.courseName, batch: picked.batch,
          courseFee: cFee, registrationFee: parseFloat(regFee) || 0, discount: parseFloat(discount) || 0,
          dueDate: dueDate || undefined,
        }),
      });
      const j = await res.json();
      if (!j.success) { setErr(j.error || "Failed"); setSaving(false); return; }
      onSuccess();
    } catch { setErr("Network error"); setSaving(false); }
  }

  const total = (parseFloat(courseFee) || 0) + (parseFloat(regFee) || 0);
  const final = Math.max(0, total - (parseFloat(discount) || 0));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-4">
        <div className="bg-[#1F3354] text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h3 className="font-bold text-lg">➕ नया Fee Record बनाएं</h3>
          <button onClick={onClose} className="text-blue-200 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {err && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4 flex-shrink-0" />{err}</div>}

          {/* Student search */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">छात्र खोजें <span className="text-red-500">*</span></label>
            {picked ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-9 h-9 rounded-full bg-[#1F3354] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {picked.fullName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{picked.fullName}</p>
                  <p className="text-xs text-gray-500">{picked.rollNumber} · {picked.courseName}</p>
                </div>
                <button onClick={() => { setPicked(null); setQuery(""); setCourseFee(""); }} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="नाम / Roll No / Phone से खोजें..."
                  className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1F3354] outline-none"
                />
                {(students.length > 0 || searching) && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto mt-1">
                    {searching && <p className="px-3 py-2 text-xs text-gray-400">खोज रहे हैं...</p>}
                    {students.map(s => (
                      <button key={s.id} onClick={() => { setPicked(s); setCourseFee(""); setQuery(""); setStudents([]); }}
                        className="w-full text-left px-3 py-2.5 hover:bg-blue-50 border-b border-gray-50 last:border-0 transition"
                      >
                        <p className="font-semibold text-gray-800 text-sm">{s.fullName}</p>
                        <p className="text-xs text-gray-500">{s.rollNumber} · {s.courseName}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Course Fee (₹) <span className="text-red-500">*</span></label>
              <input type="number" value={courseFee} onChange={e => setCourseFee(e.target.value)} placeholder="e.g. 3000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1F3354] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Registration Fee (₹)</label>
              <input type="number" value={regFee} onChange={e => setRegFee(e.target.value)} placeholder="200"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1F3354] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Discount (₹)</label>
              <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1F3354] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Due Date (Optional)</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1F3354] outline-none"
              />
            </div>
          </div>

          {/* Fee breakdown preview */}
          {(parseFloat(courseFee) > 0) && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-blue-800 mb-2">Fee Breakdown</p>
              <div className="flex justify-between text-xs text-blue-700 mb-1"><span>Course Fee:</span><span>{fmt(parseFloat(courseFee) || 0)}</span></div>
              <div className="flex justify-between text-xs text-blue-700 mb-1"><span>Registration Fee:</span><span>{fmt(parseFloat(regFee) || 0)}</span></div>
              {parseFloat(discount) > 0 && <div className="flex justify-between text-xs text-green-600 mb-1"><span>Discount:</span><span>- {fmt(parseFloat(discount))}</span></div>}
              <div className="flex justify-between text-sm font-bold text-blue-900 border-t border-blue-200 pt-2 mt-1"><span>Total Due:</span><span>{fmt(final)}</span></div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">रद्द करें</button>
            <button onClick={submit} disabled={saving} className="flex-1 py-2.5 rounded-lg bg-[#1F3354] text-white text-sm font-bold hover:bg-blue-900 transition disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <><RefreshCw className="w-4 h-4 animate-spin" />सेव...</> : <><Plus className="w-4 h-4" />Record बनाएं</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Receipt Success Modal ─────────────────────────────────────────────────────
function ReceiptSuccessModal({
  record,
  receiptNo,
  amount,
  onClose,
}: {
  record: FeeRecord;
  receiptNo: string;
  amount: number;
  onClose: () => void;
}) {
  const updatedRecord = { ...record, paidAmount: record.paidAmount + amount, dueAmount: Math.max(0, record.dueAmount - amount) };
  const lastPayment = { receiptNo, amount, paymentMode: "Cash" };
  const waUrl = `https://api.whatsapp.com/send?phone=91${record.phone.replace(/\D/g, "")}&text=${buildWAReceiptMsg(updatedRecord, lastPayment)}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm text-center">
        <div className="px-6 pt-8 pb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Fee Collected! ✅</h3>
          <p className="text-gray-500 text-sm mt-1">Receipt No: <span className="font-bold text-gray-800">{receiptNo}</span></p>
          <p className="text-2xl font-bold text-green-600 mt-3">{fmt(amount)}</p>
          <p className="text-xs text-gray-400 mt-1">Collected from {record.studentName}</p>
        </div>
        <div className="px-6 pb-6 space-y-2">
          <a href={waUrl} target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold text-sm transition">
            <MessageCircle className="w-4 h-4" />📱 WhatsApp Receipt भेजें
          </a>
          <button onClick={onClose} className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition">
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Row Component ─────────────────────────────────────────────────────────────
function FeeRow({ record, onCollect, onRefresh }: { record: FeeRecord; onCollect: (r: FeeRecord) => void; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [toast, setToast] = useState("");

  const progress = pct(record.paidAmount, record.finalFees);
  const waReminderUrl = `https://api.whatsapp.com/send?phone=91${record.phone.replace(/\D/g, "")}&text=${buildWAReminderMsg(record)}`;
  const waReceiptUrl = record.lastPayment
    ? `https://api.whatsapp.com/send?phone=91${record.phone.replace(/\D/g, "")}&text=${buildWAReceiptMsg(record, record.lastPayment)}`
    : null;

  async function loadDetail() {
    if (detail) { setExpanded(v => !v); return; }
    setLoading(true); setExpanded(true);
    const j = await fetch(`/api/fees/${record.id}`).then(r => r.json()).catch(() => ({}));
    if (j.success) setDetail(j.data);
    setLoading(false);
  }

  async function sendEmail(action: string, paymentId?: string) {
    setEmailSending(true); setToast("");
    const body: any = { action };
    if (paymentId) body.paymentId = paymentId;
    const j = await fetch(`/api/fees/${record.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    }).then(r => r.json()).catch(() => ({}));
    setEmailSending(false);
    setToast(j.success ? "✅ Email भेजी गई!" : `❌ ${j.error || "Error"}`);
    setTimeout(() => setToast(""), 3000);
  }

  async function deleteRecord() {
    if (!confirm(`क्या आप ${record.studentName} का fee record delete करना चाहते हैं?`)) return;
    await fetch(`/api/fees/${record.id}`, { method: "DELETE" });
    onRefresh();
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden transition hover:shadow-md">
      {/* Main Row */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-xl bg-[#1F3354] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
            {record.studentName[0]}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-gray-900 text-sm truncate">{record.studentName}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${STATUS_COLOR[record.status]}`}>{STATUS_LABEL[record.status]}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{record.rollNumber} · {record.courseName}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" />{record.phone}</p>

            {/* Progress bar */}
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Paid: <span className="font-bold text-green-600">{fmt(record.paidAmount)}</span></span>
                <span>Due: <span className={`font-bold ${record.dueAmount > 0 ? "text-red-600" : "text-green-600"}`}>{fmt(record.dueAmount)}</span></span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${record.status === "paid" ? "bg-green-500" : record.status === "partial" ? "bg-amber-500" : "bg-red-400"}`}
                  style={{ width: `${progress}%` }} />
              </div>
              <p className="text-right text-xs text-gray-400 mt-0.5">{progress}% of {fmt(record.finalFees)}</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {record.status !== "paid" && (
            <button onClick={() => onCollect(record)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1F3354] text-white rounded-lg text-xs font-semibold hover:bg-blue-900 transition">
              <IndianRupee className="w-3.5 h-3.5" />Fee Collect
            </button>
          )}
          {record.status !== "paid" && (
            <a href={waReminderUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 transition">
              <MessageCircle className="w-3.5 h-3.5" />WA Reminder
            </a>
          )}
          {waReceiptUrl && (
            <a href={waReceiptUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition">
              <MessageCircle className="w-3.5 h-3.5" />WA Receipt
            </a>
          )}
          <button onClick={loadDetail} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition ml-auto">
            <Eye className="w-3.5 h-3.5" />{expanded ? "छुपाएं" : "History"}
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <button onClick={deleteRecord} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {toast && <p className="mt-2 text-xs font-medium text-gray-600">{toast}</p>}
      </div>

      {/* Expanded: payment history */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
          {loading ? <p className="text-xs text-gray-400 text-center py-2">लोड हो रहा है...</p> : (
            detail?.payments?.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-600 mb-2">📋 Payment History ({detail.payments.length} किस्त)</p>
                {detail.payments.map((p: any, i: number) => (
                  <div key={p.id} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2.5 border border-gray-100">
                    <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800">{fmt(p.amount)} <span className="font-normal text-gray-500">via {p.paymentMode}</span></p>
                      <p className="text-xs text-gray-400">{p.receiptNo} · {new Date(p.paymentDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                      {p.remarks && <p className="text-xs text-gray-400 italic">{p.remarks}</p>}
                    </div>
                    <div className="flex gap-1">
                      {record.email && (
                        <button onClick={() => sendEmail("send_receipt", p.id)} disabled={emailSending}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition" title="Email Receipt">
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {record.email && record.dueAmount > 0 && (
                  <button onClick={() => sendEmail("send_reminder")} disabled={emailSending}
                    className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-semibold mt-2 hover:underline">
                    <Mail className="w-3.5 h-3.5" />Email Reminder भेजें
                  </button>
                )}
              </div>
            ) : <p className="text-xs text-gray-400 text-center py-2">अभी कोई payment नहीं है।</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function FeesPage() {
  const [records, setRecords] = useState<FeeRecord[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalExpected: 0, totalCollected: 0, totalDue: 0, todayCollection: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [collectTarget, setCollectTarget] = useState<FeeRecord | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [successData, setSuccessData] = useState<{ record: FeeRecord; receiptNo: string; amount: number } | null>(null);

  const fetchData = useCallback(async (pg = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(pg), limit: "20" });
    if (search) params.set("search", search);
    if (statusFilter !== "all") params.set("status", statusFilter);
    const j = await fetch(`/api/fees?${params}`).then(r => r.json()).catch(() => ({}));
    if (j.success) {
      setRecords(j.data || []);
      setSummary(j.summary || { totalExpected: 0, totalCollected: 0, totalDue: 0, todayCollection: 0 });
      setTotalPages(j.pagination?.totalPages || 1);
      setTotal(j.pagination?.total || 0);
    }
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { setPage(1); fetchData(1); }, [search, statusFilter]);
  useEffect(() => { if (page > 1) fetchData(page); }, [page]);

  function handleCollectSuccess(record: FeeRecord, receiptNo: string, amount: number) {
    setCollectTarget(null);
    setSuccessData({ record, receiptNo, amount });
    fetchData(page);
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><IndianRupee className="w-5 h-5 text-[#1F3354]" />Fees Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">छात्रों की फीस रिकॉर्ड और किस्त प्रबंधन</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => fetchData(page)} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition"><RefreshCw className="w-4 h-4" /></button>
            <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 bg-[#1F3354] text-white rounded-lg text-sm font-semibold hover:bg-blue-900 transition">
              <Plus className="w-4 h-4" />New Record
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Expected" value={fmt(summary.totalExpected)} icon={TrendingUp} color="bg-blue-50 text-blue-600" sub="सभी छात्रों की कुल फीस" />
          <StatCard label="Total Collected" value={fmt(summary.totalCollected)} icon={Wallet} color="bg-green-50 text-green-600" sub="अब तक जमा" />
          <StatCard label="Total Due" value={fmt(summary.totalDue)} icon={AlertCircle} color="bg-red-50 text-red-600" sub="बकाया राशि" />
          <StatCard label="Today's Collection" value={fmt(summary.todayCollection)} icon={CalendarDays} color="bg-amber-50 text-amber-600" sub="आज की वसूली" />
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap items-center">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="नाम / Roll / Phone..."
              className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-[#1F3354] outline-none"
            />
          </div>
          <div className="flex gap-1.5">
            {(["all", "unpaid", "partial", "paid"] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold border transition ${statusFilter === s ? "bg-[#1F3354] text-white border-[#1F3354]" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>
                {s === "all" ? "सभी" : s === "unpaid" ? "बकाया" : s === "partial" ? "आंशिक" : "पूर्ण"}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 ml-auto">{total} record{total !== 1 ? "s" : ""}</p>
        </div>

        {/* Records */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-6 h-6 animate-spin text-[#1F3354]" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <IndianRupee className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-gray-500">{search ? "कोई record नहीं मिला" : "अभी कोई fee record नहीं है"}</p>
            {!search && <button onClick={() => setShowNew(true)} className="mt-3 text-sm text-blue-600 hover:underline">+ New Record बनाएं</button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {records.map(r => (
              <FeeRow key={r.id} record={r} onCollect={setCollectTarget} onRefresh={() => fetchData(page)} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50 transition">पिछला</button>
            <span className="text-sm text-gray-600">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50 transition">अगला</button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showNew && (
        <NewFeeModal onClose={() => setShowNew(false)} onSuccess={() => { setShowNew(false); fetchData(1); }} />
      )}
      {collectTarget && (
        <CollectFeeModal
          record={collectTarget}
          onClose={() => setCollectTarget(null)}
          onSuccess={(receiptNo) => {
            const amt = parseFloat((document.querySelector("input[type=number]") as any)?.value || "0");
            handleCollectSuccess(collectTarget, receiptNo, amt);
          }}
        />
      )}
      {successData && (
        <ReceiptSuccessModal
          record={successData.record}
          receiptNo={successData.receiptNo}
          amount={successData.amount}
          onClose={() => { setSuccessData(null); fetchData(page); }}
        />
      )}
    </AdminLayout>
  );
}
