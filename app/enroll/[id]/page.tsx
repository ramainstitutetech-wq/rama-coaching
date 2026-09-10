"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Copy, Smartphone, Upload, AlertCircle, User as UserIcon, GraduationCap, Phone, Mail, ShieldCheck, Clock, PartyPopper } from "lucide-react";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import confetti from "canvas-confetti";

const UPI_ID = "8299121689@ybl";
const UPI_PHONE = "8299121689";

interface CourseDetail { id: string; name: string; fees: string; duration: string; category: string }

export default function EnrollPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStudent, setIsStudent] = useState(false);
  const [studentInfo, setStudentInfo] = useState<any>(null);

  // form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [utr, setUtr] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{type:"ok"|"err", text:string}|null>(null);
  const [successData, setSuccessData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Playful professional confetti — fires once on success
  function fireConfetti() {
    const colors = ["#1F3354", "#b91c1c", "#10b981", "#f59e0b", "#ffffff"];
    const end = Date.now() + 1800;
    (function frame() {
      confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0, y: 0.65 }, colors });
      confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1, y: 0.65 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
    // burst in center
    setTimeout(() => {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.55 }, colors, scalar: 1.1, ticks: 220 });
    }, 300);
  }

  const feeNum = course ? parseInt(course.fees.replace(/[^0-9]/g,"")||"0") : NaN;
  const isFree = !isNaN(feeNum) && feeNum === 0;

  useEffect(() => {
    async function load() {
      try {
        const cRes = await fetch(`/api/courses/${id}`, { cache: "no-store" }).then(r=>r.json());
        if (cRes.success) {
          setCourse({ id: cRes.data.id, name: cRes.data.name, fees: cRes.data.fees, duration: cRes.data.duration, category: cRes.data.category });
          setAmount(cRes.data.fees.replace(/[₹,\s]/g,""));
        }
        // check student login
        try {
          const sRes = await fetch("/api/student/me", { cache: "no-store" }).then(r=>r.json());
          if (sRes.success && sRes.data) {
            setIsStudent(true);
            setStudentInfo(sRes.data);
            setFullName(sRes.data.fullName || "");
            setEmail(sRes.data.email || "");
            setPhone(sRes.data.phone || "");
          }
        } catch {}
      } catch {}
      setLoading(false);
    }
    load();
  }, [id]);

  function copyUPI() {
    navigator.clipboard.writeText(UPI_ID).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!fullName.trim() || !email.trim() || !phone.trim()) { setMsg({type:"err", text:"Name, Email, Phone required"}); return; }
    if (!isFree) {
      if (!proofFile) { setMsg({type:"err", text:"Payment screenshot required"}); return; }
      if (utr.trim().length < 8) { setMsg({type:"err", text:"Valid UTR / Transaction ID (min 8 chars) required"}); return; }
    }

    setSubmitting(true);
    try {
      let proofUrl = "FREE";
      if (!isFree && proofFile) {
        const fd = new FormData();
        fd.append("file", proofFile);
        const upR = await fetch("/api/upload", { method:"POST", body: fd }).then(r=>r.json());
        if (!upR.success) { setMsg({type:"err", text: upR.error || "Proof upload failed"}); setSubmitting(false); return; }
        proofUrl = upR.data.url;
      }

      const res = await fetch("/api/enrollments", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          courseId: id,
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          fatherName: fatherName.trim(),
          address: address.trim(),
          education: "",
          amount: isFree ? "0" : amount.trim(),
          utr: isFree ? `FREE-${Date.now()}` : utr.trim(),
          proofUrl,
          paymentDate: new Date().toISOString(),
        }),
      }).then(r=>r.json());

      if (!res.success) { setMsg({type:"err", text: res.error || "Submission failed"}); setSubmitting(false); return; }

      setSuccessData(res.data);
      fireConfetti();
      setMsg({type:"ok", text:`Enrollment submitted! ID: ${res.data.enrollmentId}`});
    } catch {
      setMsg({type:"err", text:"Network error"});
    }
    setSubmitting(false);
  }

  if (loading) return <><SiteNav /><div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#1F3354]" /></div><SiteFooter /></>;

  if (!course) return <><SiteNav /><div className="py-20 text-center"><p>Course not found</p><Link href="/courses" className="text-red-600 underline">Back</Link></div><SiteFooter /></>;

  if (successData) {
    return (
      <>
        <SiteNav />
        <section className="bg-[#1F3354] py-10 px-4 text-center text-white">
          <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-400 mb-3" />
          <h1 className="text-2xl font-bold">Enrollment Submitted!</h1>
          <p className="text-slate-300 text-sm mt-2">Your request is pending verification</p>
        </section>
        <section className="py-10 px-4">
          <div className="mx-auto max-w-lg bg-white rounded-2xl border border-slate-200 shadow-lg p-6 text-center space-y-4">
            <p className="text-sm text-slate-600">Enrollment ID</p>
            <p className="text-xl font-bold text-[#1F3354] tracking-wide">{successData.enrollmentId}</p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
              <p className="text-xs font-semibold text-amber-800 mb-1">What next?</p>
              <ul className="text-xs text-amber-700 space-y-1">
                <li>• Admin will verify your UTR & screenshot within 2-4 hours</li>
                <li>• You will get confirmation on WhatsApp / Email</li>
                <li>• {isStudent ? "Check My Enrollments in Student Dashboard" : "We will create your Student Login after approval"}</li>
              </ul>
            </div>
            <p className="text-xs text-slate-400">For quick help: <a href={`tel:${UPI_PHONE}`} className="text-[#1F3354] font-semibold">📞 {UPI_PHONE}</a></p>
            <div className="flex gap-3 justify-center pt-2">
              <Link href="/courses" className="px-5 py-2.5 rounded-lg border border-slate-200 text-sm">Browse Courses</Link>
              {isStudent ? <Link href="/student" className="px-5 py-2.5 rounded-lg bg-[#1F3354] text-white text-sm">Go to Dashboard</Link> : <Link href="/" className="px-5 py-2.5 rounded-lg bg-[#1F3354] text-white text-sm">Back to Home</Link>}
            </div>
          </div>
        </section>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteNav />
      {/* Hero */}
      <section className="bg-[#1F3354] py-8 px-4">
        <div className="mx-auto max-w-6xl">
          <Link href={`/courses/${id}`} className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white text-sm mb-4"><ArrowLeft className="h-4 w-4" /> Back to Course</Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">Secure QR Enrollment</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">Enroll in {course.name}</h1>
              <p className="text-slate-300 text-sm mt-1 flex items-center gap-3"><span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{course.duration}</span> <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" />{course.category}</span></p>
            </div>
            <div className="bg-white rounded-xl px-5 py-3 text-center shadow">
              <p className="text-xs text-slate-500 uppercase">Course Fee</p>
              <p className="text-2xl font-bold text-[#1F3354]">₹ {course.fees.replace(/[₹,]/g,"")}</p>
              <p className="text-[11px] text-slate-400">One-time · All inclusive</p>
            </div>
          </div>
        </div>
      </section>

      {/* Student vs Outsider badge */}
      <section className="max-w-6xl mx-auto px-4 -mt-3">
        {isStudent ? (
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-medium"><ShieldCheck className="h-4 w-4" /> Logged in as Student — {studentInfo?.fullName || studentInfo?.email} (Details pre-filled)</div>
        ) : (
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-full text-xs font-medium"><UserIcon className="h-4 w-4" /> New User — Fill details to enroll (We will create your Student account after verification)</div>
        )}
      </section>

      <section className="py-8 px-4 bg-slate-50">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-5 gap-6">
          {/* Left — QR / Free */}
          <div className="lg:col-span-2">
            {isFree ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-4">
                <div className="h-1 bg-gradient-to-r from-emerald-500 to-[#1F3354]" />
                <div className="p-6 flex flex-col items-center gap-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Free Course</p>
                  <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-100 p-6 text-center">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-500 mb-2" />
                    <p className="text-lg font-bold text-emerald-700">No Payment Required</p>
                    <p className="text-sm text-slate-600 mt-1">Ye course bilkul free hai. Bas details bharo aur enroll karo — no QR, no UTR.</p>
                  </div>
                  <div className="w-full bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-emerald-800">Instant Enrollment</p>
                    <p className="text-xs text-emerald-700 mt-1">Submit karte hi auto-approved, turant dashboard me course add ho jayega.</p>
                  </div>
                  <p className="text-xs text-slate-400">Help: <a href={`tel:${UPI_PHONE}`} className="text-[#1F3354] font-semibold">📞 {UPI_PHONE}</a></p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-4">
                <div className="h-1 bg-gradient-to-r from-[#b91c1c] to-[#1F3354]" />
                <div className="p-6 flex flex-col items-center gap-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Scan QR to Pay</p>
                  <div className="rounded-2xl border-4 border-slate-100 p-2 bg-white">
                    <img src="/UPI.jpeg" alt="UPI QR" className="h-52 w-52 object-contain rounded-xl" />
                  </div>
                  <p className="text-xs text-slate-400">Any UPI app — PhonePe, GPay, Paytm, BHIM</p>
                  <div className="w-full flex items-center gap-3"><div className="flex-1 h-px bg-slate-200" /><span className="text-xs text-slate-400">OR</span><div className="flex-1 h-px bg-slate-200" /></div>
                  <div className="w-full flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5">
                    <Smartphone className="h-4 w-4 text-slate-400" />
                    <span className="flex-1 text-sm font-semibold select-all">{UPI_ID}</span>
                    <button type="button" onClick={copyUPI} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${copied ? "bg-emerald-500 text-white":"bg-[#1F3354] text-white"}`}>{copied ? "Copied!" : "Copy"}</button>
                  </div>
                  <div className="w-full bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-amber-800">Important</p>
                    <ul className="text-xs text-amber-700 space-y-1 mt-1">
                      <li>• Pay exact: <strong>₹ {course.fees.replace(/[₹,]/g,"")}</strong></li>
                      <li>• UPI Note me likho: <strong>{course.name}</strong></li>
                      <li>• Screenshot + UTR zaroor save rakho</li>
                    </ul>
                  </div>
                  <p className="text-xs text-slate-400">Help: <a href={`tel:${UPI_PHONE}`} className="text-[#1F3354] font-semibold">📞 {UPI_PHONE}</a></p>
                </div>
              </div>
            )}
          </div>

          {/* Right — Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
              <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2"><UserIcon className="h-5 w-5 text-[#1F3354]" /> {isStudent ? "Confirm Details & Payment Proof" : "Your Details & Payment Proof"}</h2>

              {msg && <div className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm ${msg.type==="ok" ? "bg-emerald-50 border border-emerald-200 text-emerald-700":"bg-red-50 border border-red-200 text-red-700"}`}>{msg.type==="ok"?<CheckCircle2 className="h-4 w-4"/>:<AlertCircle className="h-4 w-4"/>}{msg.text}</div>}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Full Name *</label>
                  <input value={fullName} onChange={e=>setFullName(e.target.value)} required placeholder="Your name" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#1F3354] focus:ring-2 focus:ring-[#1F3354]/20" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Phone *</label>
                  <input value={phone} onChange={e=>setPhone(e.target.value)} required placeholder="10-digit mobile" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#1F3354] focus:ring-2 focus:ring-[#1F3354]/20" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> Email *</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="email@gmail.com" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#1F3354] focus:ring-2 focus:ring-[#1F3354]/20" />
                {!isStudent && <p className="text-[11px] text-slate-400 mt-1">Student login isi email se banega</p>}
              </div>

              {!isStudent && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Father Name</label>
                    <input value={fatherName} onChange={e=>setFatherName(e.target.value)} placeholder="Optional" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#1F3354] focus:ring-2 focus:ring-[#1F3354]/20" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Address</label>
                    <input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Village / City" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#1F3354] focus:ring-2 focus:ring-[#1F3354]/20" />
                  </div>
                </div>
              )}

              {isFree ? (
                <>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
                    <p className="text-xs text-emerald-700 leading-relaxed">Ye free course hai — koi payment nahi. Submit karte hi turant enroll ho jaoge, admin auto-approve karega.</p>
                  </div>
                  <button type="submit" disabled={submitting} className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
                    {submitting ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Enrolling…</> : <>Enroll Free — Instant →</>}
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-slate-100 pt-5 space-y-4">
                    <p className="text-sm font-semibold text-slate-800">Payment Verification (QR se pay karne ke baad)</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700">Amount Paid *</label>
                        <input value={amount} onChange={e=>setAmount(e.target.value)} required={!isFree} placeholder="200000" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm bg-slate-50" />
                        <p className="text-[11px] text-slate-400 mt-1">Course fee se match hona chahiye</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">UTR / Transaction ID *</label>
                        <input value={utr} onChange={e=>setUtr(e.target.value)} required={!isFree} placeholder="12-digit UTR" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-mono outline-none focus:border-[#1F3354] focus:ring-2 focus:ring-[#1F3354]/20" />
                        <p className="text-[11px] text-slate-400 mt-1">GPay/PhonePe history me milega</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-1"><Upload className="h-4 w-4" /> Payment Screenshot *</label>
                      <input type="file" accept="image/*" onChange={e=>{
                        const f=e.target.files?.[0]||null;
                        setProofFile(f);
                        if(f) setProofPreview(URL.createObjectURL(f));
                      }} required={!isFree} className="mt-1 w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#1F3354] file:px-4 file:py-2 file:text-sm file:text-white file:font-medium hover:file:bg-[#162640]" />
                      {proofPreview && <img src={proofPreview} alt="preview" className="mt-3 h-48 w-auto rounded-lg border border-slate-200 object-contain" />}
                      <p className="text-[11px] text-slate-400 mt-1">Max 2MB, JPG/PNG only — clear screenshot where amount & UTR visible</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 mt-0.5" />
                    <p className="text-xs text-slate-600 leading-relaxed">Submit karne ke baad Admin 2-4 ghante me verify karega. Approve hote hi {isStudent ? "course aapke dashboard me add ho jayega" : "aapka Student account ban jayega aur login details email pe ayegi"}. Koi auto-enroll nahi — 100% manual verification.</p>
                  </div>
                  <button type="submit" disabled={submitting} className="w-full rounded-xl bg-red-600 hover:bg-red-700 text-white py-3 text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
                    {submitting ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Submitting…</> : <>Submit for Verification →</>}
                  </button>
                </>
              )}

              <p className="text-center text-xs text-slate-400">Already paid? WhatsApp screenshot: <a href={`https://wa.me/91${UPI_PHONE}`} target="_blank" className="text-[#1F3354] font-semibold hover:underline">{UPI_PHONE}</a></p>
            </form>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
