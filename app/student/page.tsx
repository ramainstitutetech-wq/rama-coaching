"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award, FileText, Eye, Printer, User, BookOpen, Calendar,
  NotebookText, ClipboardList, Clock, HelpCircle, ArrowRight,
  Lock, ChevronRight, Globe, CheckCircle2,
} from "lucide-react";
import { CertificatePreview } from "@/components/certificate/CertificatePreview";
import type { CertificateData } from "@/types/certificate";
import { SAMPLE_CERTIFICATE, DEFAULT_SUBJECTS } from "@/lib/defaults";
import { Modal } from "@/components/ui/Modal";
import type { MockTest } from "@/data/types";
import { printCertificateDirectly } from "@/lib/printUtils";

interface ENote {
  id: string; title: string; description: string;
  courseCategory: string; accessType: string; fileUrl: string; content: string;
}

export default function StudentDashboard() {
  const [student, setStudent] = useState<any>(null);
  const [certs,   setCerts]   = useState<any[]>([]);
  const [marks,   setMarks]   = useState<any[]>([]);
  const [tests,   setTests]   = useState<MockTest[]>([]);
  const [enotes,  setEnotes]  = useState<ENote[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [coursesMeta, setCoursesMeta] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<CertificateData | null>(null);
  const [activeSection, setActiveSection] = useState<"courses" | "certs" | "marks" | "tests" | "notes">("courses");
  const [focusCourse, setFocusCourse] = useState<string | null>(null);
  const [focusLoading, setFocusLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [meRes, cRes, mRes, eRes] = await Promise.all([
          fetch("/api/student/me", { cache: "no-store" }),
          fetch("/api/student/certificates?type=excellence", { cache: "no-store" }),
          fetch("/api/student/certificates?type=marksheet", { cache: "no-store" }),
          fetch("/api/enrollments/my", { cache: "no-store" }),
        ]);
        const meJ = await meRes.json();
        const cJ  = await cRes.json();
        const mJ  = await mRes.json();
        const eJ  = await eRes.json();
        if (eJ?.success) setEnrollments(eJ.data || []);
        if (meJ.success) {
          setStudent(meJ.data);
          const courseName = meJ.data?.course || meJ.data?.courseName || "";
          const [tRes, nRes, cMetaRes] = await Promise.all([
            fetch(`/api/mock-tests?public=1&limit=20&category=${encodeURIComponent(courseName)}`, { cache: "no-store" }).then(r => r.json()),
            fetch(`/api/student/enotes`, { cache: "no-store" }).then(r => r.json()),
            fetch(`/api/courses`, { cache: "no-store" }).then(r => r.json()),
          ]);
          if (tRes.success) setTests(tRes.data);
          if (nRes.success) setEnotes(nRes.data);
          if (cMetaRes?.success) {
            const map: Record<string, any> = {};
            cMetaRes.data.forEach((c: any) => { map[c.name] = c; map[String(c.id)] = c; map[String(c._id)] = c; });
            setCoursesMeta(map);
          }
        }
        if (cJ.success) setCerts(cJ.data);
        if (mJ.success) setMarks(mJ.data);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  function toPreview(rec: any): CertificateData {
    const docType = rec.type || rec.documentType || "excellence";
    return {
      ...SAMPLE_CERTIFICATE,
      subjects: (rec.subjects?.length ? rec.subjects : DEFAULT_SUBJECTS).map((s: any) => ({ ...s })),
      documentType: docType,
      certificateNumber: rec.certificateNumber || "",
      studentName: student?.fullName || rec.studentName || "",
      fatherName: rec.fatherName || "",
      motherName: rec.motherName || student?.motherName || "",
      rollNo: rec.rollNo || student?.rollNumber || rec.rollNumber || "",
      enrollmentNo: rec.enrollmentNo || student?.rollNumber || "",
      courseName: rec.courseName || student?.course || "",
      courseCode: rec.courseCode || "",
      centerCode: rec.centerCode || "",
      performance: rec.performance || "",
      courseDuration: rec.courseDuration || "",
      photoUrl: student?.photoUrl || "",
      slNo: rec.slNo || rec.certificateNumber?.slice(-3) || "001",
      trainingCenter: rec.trainingCenter || "Rama Coaching Center, Main Branch",
      completionDate: rec.completionDate
        ? new Date(rec.completionDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        : rec.issueDate || "",
      dated: rec.dated || rec.issueDate || new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
      place: rec.place || "Fatehpur",
    };
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-navy border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Helper to format expiry
  function formatExpiry(expiresAt?: string | null, accessDays?: number, accessValue?: number, accessUnit?: string) {
    if (!expiresAt && (!accessDays || accessDays === 0)) return "Lifetime Access";
    if (!expiresAt && accessDays) return `Access: ${accessValue} ${accessUnit}${(accessValue||0)>1 ? "s" : ""}`;
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const days = Math.ceil(diff / (1000*60*60*24));
    if (days <= 7) return `Expires in ${days} day${days>1?"s":""}`;
    if (days <= 30) return `Expires in ${Math.ceil(days/7)} week${Math.ceil(days/7)>1?"s":""}`;
    if (days <= 365) return `Expires in ${Math.ceil(days/30)} month${Math.ceil(days/30)>1?"s":""}`;
    return `Expires in ${Math.ceil(days/365)} year${Math.ceil(days/365)>1?"s":""}`;
  }

  // My Courses = primary Student.course + approved enrollments (free ones) — with courseId for clickable link + expiry
  const allCourses = (() => {
    const map = new Map<string, { name: string; status: string; enrollmentId?: string; courseId?: string; course?: any; expiresAt?: string | null; accessDays?: number; accessValue?: number; accessUnit?: string }>();
    if (student?.course) {
      const meta = coursesMeta[student.course] || coursesMeta[student.courseId];
      // For primary, no per-enrollment expiry — show course's access info
      map.set(student.course, { name: student.course, status: "active", courseId: student.courseId, course: meta, expiresAt: null, accessDays: meta?.accessDays, accessValue: meta?.accessValue, accessUnit: meta?.accessUnit });
    }
    enrollments.forEach((e: any) => {
      if (e.status === "expired") return; // hide expired
      const meta = coursesMeta[e.courseName] || coursesMeta[String(e.courseId)];
      if (e.status === "approved") map.set(e.courseName, { name: e.courseName, status: "approved", enrollmentId: e.enrollmentId, courseId: String(e.courseId), course: meta, expiresAt: e.expiresAt, accessDays: meta?.accessDays, accessValue: meta?.accessValue, accessUnit: meta?.accessUnit });
      else if (e.status === "pending_verification") map.set(e.courseName + "_pending", { name: e.courseName, status: "pending", enrollmentId: e.enrollmentId, courseId: String(e.courseId), course: meta });
    });
    return Array.from(map.values());
  })();

  const SECTIONS = [
    { id: "courses", label: "My Courses",  icon: BookOpen,      count: allCourses.length, color: "text-emerald-600" },
    { id: "certs",  label: "Certificates", icon: Award,         count: certs.length,  color: "text-amber-600" },
    { id: "marks",  label: "Marksheets",   icon: FileText,      count: marks.length,  color: "text-blue-600"  },
    { id: "tests",  label: "Mock Tests",   icon: ClipboardList, count: tests.length,  color: "text-red-600"   },
    { id: "notes",  label: "E-Notes",      icon: NotebookText,  count: enotes.length, color: "text-violet-600"},
  ] as const;

  return (
    <div className="space-y-6">

      {/* ── Welcome card ─────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-r from-navy-deep to-navy p-6 text-white flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {student?.photoUrl
          ? <img src={student.photoUrl} alt={student.fullName} className="w-16 h-16 rounded-full object-cover border-2 border-white/30" />
          : <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">{student?.fullName?.split(" ").map((p:string) => p[0]).slice(0,2).join("")}</div>}
        <div className="flex-1">
          <h1 className="text-xl font-bold">Welcome, {student?.fullName}</h1>
          <p className="text-sm text-white/80 mt-1">{student?.rollNumber} • {student?.course} • {student?.batch}</p>
          <p className="text-xs text-white/60 mt-1">{student?.email} • {student?.phone}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm bg-white/10 px-4 py-2 rounded-lg">
          <BookOpen className="w-4 h-4" /> {student?.course}
        </div>
      </div>

      {/* ── Section tabs + counts ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {SECTIONS.map(s => (
          <button key={s.id} type="button" onClick={() => setActiveSection(s.id as any)}
            className={`rounded-xl border p-4 text-left transition-all ${activeSection === s.id ? "border-navy bg-navy text-white shadow-md" : "bg-white border-slate-200 hover:border-slate-300"}`}>
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`w-4 h-4 ${activeSection === s.id ? "text-white" : s.color}`} />
              <span className={`text-xs font-medium ${activeSection === s.id ? "text-white/80" : "text-slate-500"}`}>{s.label}</span>
            </div>
            <p className={`text-2xl font-bold ${activeSection === s.id ? "text-white" : "text-slate-800"}`}>{s.count}</p>
          </button>
        ))}
      </div>

      {/* ── My Courses — human crafted, clickable ─────────────────────────── */}
      {activeSection === "courses" && (
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-[15px] font-semibold text-slate-800 tracking-tight flex items-center gap-2"><BookOpen className="w-4 h-4 text-emerald-600" /> My Courses <span className="ml-1 text-xs font-normal text-slate-400">— {allCourses.length} enrolled</span></h3>
              <p className="text-xs text-slate-500 mt-1 hidden sm:block">Tap a course to open materials, notes & tests.</p>
            </div>
            <Link href="/courses" className="text-xs font-medium text-slate-600 hover:text-emerald-700 flex items-center gap-1 border border-slate-200 rounded-full px-3 py-1.5 bg-white hover:bg-slate-50">Browse courses <ChevronRight className="w-3 h-3" /></Link>
          </div>

          {allCourses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-3"><BookOpen className="w-6 h-6 text-slate-400" /></div>
              <p className="text-sm font-medium text-slate-700">No courses yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">You haven&apos;t enrolled in any course. Explore our Government Recognized programs and start learning.</p>
              <Link href="/courses" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#1F3354] px-5 py-2 text-sm font-medium text-white hover:bg-[#162640]">Explore Courses <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {allCourses.map((c, i) => {
                const meta = c.course;
                const courseHref = c.courseId ? `/courses/${c.courseId}` : `/courses?search=${encodeURIComponent(c.name)}`;
                const learnHref = c.courseId ? `/student/course/${c.courseId}` : `/student`;
                const isPending = c.status === "pending";
                if (isPending) {
                  // Pending — show enroll card, not clickable to learn
                  return (
                    <div key={i} className="group relative flex flex-col overflow-hidden rounded-2xl border border-amber-200 bg-white opacity-95">
                      <div className="relative h-28 overflow-hidden bg-amber-50 flex items-center justify-center">
                        {meta?.imageUrl ? <img src={meta.imageUrl} alt={c.name} className="h-full w-full object-cover opacity-60" /> : <BookOpen className="w-10 h-10 text-amber-300" />}
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border shadow-sm bg-amber-50 text-amber-700 border-amber-200"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Pending verification</span>
                        {c.enrollmentId && <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-mono border">{c.enrollmentId}</span>}
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                        <p className="text-xs text-amber-700 mt-1">Payment verification pending — admin 2-4 hrs me approve karega. Tab tak Study nahi khulega.</p>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={i} className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-md">
                    {/* banner — now goes to LEARNING page, not enroll */}
                    <Link href={learnHref} className="relative h-28 overflow-hidden bg-slate-50 block">
                      {meta?.imageUrl ? (
                        <img src={meta.imageUrl} alt={c.name} className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center" style={{ background: i % 2 === 0 ? "#f0fdf4" : "#fef3f2" }}>
                          <BookOpen className={`w-10 h-10 ${i % 2 === 0 ? "text-emerald-300" : "text-red-300"}`} />
                        </div>
                      )}
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border shadow-sm bg-emerald-50 text-emerald-700 border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Enrolled — Active
                      </span>
                      {c.enrollmentId && <span className="absolute right-3 top-3 rounded-full bg-white/90 backdrop-blur px-2 py-1 text-[10px] font-mono text-slate-600 border border-slate-200">{c.enrollmentId}</span>}
                    </Link>
                    {/* body */}
                    <div className="flex flex-1 flex-col p-4">
                      <Link href={learnHref} className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2 hover:text-[#1F3354] hover:underline">{c.name}</Link>
                      <p className="mt-1 text-xs text-slate-500 flex items-center gap-2">
                        {meta?.duration && <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{meta.duration}</span>}
                        {meta?.category && <><span className="h-1 w-1 rounded-full bg-slate-300" />{meta.category}</>}
                        {!meta?.duration && !meta?.category && <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Your learning</span>}
                      </p>
                      {(() => {
                        const expText = formatExpiry(c.expiresAt, c.accessDays, c.accessValue, c.accessUnit);
                        const isExpired = expText === "Expired";
                        const isLifetime = expText === "Lifetime Access";
                        return expText ? (
                          <p className={`mt-1.5 inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border w-fit ${isExpired ? "bg-red-50 text-red-700 border-red-200" : isLifetime ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                            <Clock className="h-3 w-3" /> {expText}{c.expiresAt && !isLifetime && !isExpired ? ` • ${new Date(c.expiresAt).toLocaleDateString("en-IN", {day:"2-digit", month:"short", year:"numeric"})}` : ""}
                          </p>
                        ) : null;
                      })()}
                      <div className="mt-3 flex items-center gap-2">
                        <Link href={learnHref} className="flex-1 inline-flex items-center justify-center gap-1 rounded-full bg-[#1F3354] px-3 py-2 text-xs font-semibold text-white hover:bg-[#162640]">▶ Start Learning <ArrowRight className="w-3 h-3" /></Link>
                        <Link href={courseHref} className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-[#1F3354] border border-slate-200 rounded-full px-3 py-2 bg-white">Details</Link>
                      </div>
                      <p className="mt-2 text-center text-[11px] text-slate-400">Tap Start Learning — video / PDF / text inside</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {enrollments.filter((e:any)=>e.status==="pending_verification").length>0 && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
              <p className="text-xs font-semibold text-amber-800 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Pending — admin will verify in 2-4 hrs</p>
              <div className="mt-2 space-y-1">
                {enrollments.filter((e:any)=>e.status==="pending_verification").map((e:any)=>(
                  <p key={e.id} className="text-xs text-amber-700">• {e.courseName} — {e.enrollmentId} <span className="text-amber-600">• UTR {e.utr.slice(0,8)}…</span></p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Certificates ─────────────────────────────────────────────── */}
      {activeSection === "certs" && (
        <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Award className="w-4 h-4 text-amber-600" /> My Certificates</h3>
            <span className="text-xs text-slate-500">{certs.filter((c:any) => c.isSentToStudent).length} sent</span>
          </div>
          {certs.length === 0 ? <p className="px-5 py-10 text-center text-sm text-slate-500">No certificates yet. Contact admin.</p> : (
            <div className="divide-y divide-slate-100">
              {certs.map((c) => (
                <div key={c.id} className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50 ${!c.isSentToStudent ? "bg-amber-50/40" : ""}`}>
                  <span className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.isSentToStudent ? "bg-amber-50 text-amber-600" : "bg-amber-100 text-amber-700 border border-amber-200"}`}><Award className="w-5 h-5" /></span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{c.courseName} — {c.certificateNumber}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-2"><Calendar className="w-3 h-3" />{c.issueDate} • {c.status}
                      {c.isSentToStudent ? <span className="ml-2 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-semibold">Sent</span>
                        : <span className="ml-2 bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-semibold">Pending</span>}
                    </p>
                  </div>
                  <button onClick={() => setPreview(toPreview(c))}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Marksheets ───────────────────────────────────────────────── */}
      {activeSection === "marks" && (
        <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2"><FileText className="w-4 h-4 text-blue-600" /> My Marksheets</h3>
            <span className="text-xs text-slate-500">{marks.filter((m:any) => m.isSentToStudent).length} sent</span>
          </div>
          {marks.length === 0 ? <p className="px-5 py-10 text-center text-sm text-slate-500">No marksheets yet.</p> : (
            <div className="divide-y divide-slate-100">
              {marks.map((m) => (
                <div key={m.id} className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50 ${!m.isSentToStudent ? "bg-blue-50/40" : ""}`}>
                  <span className={`w-10 h-10 rounded-lg flex items-center justify-center ${m.isSentToStudent ? "bg-blue-50 text-blue-600" : "bg-amber-100 text-amber-700 border border-amber-200"}`}><FileText className="w-5 h-5" /></span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{m.courseName} — {m.certificateNumber}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-2"><Calendar className="w-3 h-3" />{m.issueDate} • {m.status}
                      {m.isSentToStudent ? <span className="ml-2 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-semibold">Sent</span>
                        : <span className="ml-2 bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-semibold">Pending</span>}
                    </p>
                  </div>
                  <button onClick={() => setPreview(toPreview(m))}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Mock Tests ───────────────────────────────────────────────── */}
      {activeSection === "tests" && (
        <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-red-600" />
              Mock Tests — {focusCourse || student?.course} {focusLoading && <span className="ml-2 h-3 w-3 animate-spin rounded-full border-2 border-slate-200 border-t-red-600" />}
            </h3>
            <div className="flex items-center gap-2">
              {focusCourse && <button onClick={()=>{ setFocusCourse(null); setActiveSection("courses"); }} className="text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-full px-2 py-1">← Back</button>}
              <Link href="/mock-test" className="text-xs text-red-600 hover:underline flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></Link>
            </div>
          </div>
          {tests.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500 mb-3">No mock tests for {focusCourse || student?.course} yet.</p>
              <Link href="/mock-test" className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:underline">
                Browse all tests <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {tests.map(t => {
                const qCount = t.questions?.length ?? 0;
                return (
                  <div key={t.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50">
                    <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{t.title}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{t.duration}m</span>
                        <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3" />{qCount} questions</span>
                      </p>
                    </div>
                    {qCount > 0 ? (
                      <Link href={`/mock-test/${t.id}`}
                        className="shrink-0 inline-flex items-center gap-1 rounded border border-[#1F3354] px-3 py-1.5 text-xs text-[#1F3354] hover:bg-[#1F3354] hover:text-white transition-colors">
                        Start <ArrowRight className="w-3 h-3" />
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-400">Coming soon</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── E-Notes ──────────────────────────────────────────────────── */}
      {activeSection === "notes" && (
        <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <NotebookText className="w-4 h-4 text-violet-600" />
              Study Notes — {focusCourse || student?.course} {focusLoading && <span className="ml-2 h-3 w-3 animate-spin rounded-full border-2 border-slate-200 border-t-violet-600" />}
            </h3>
            <div className="flex items-center gap-2">
              {focusCourse && <button onClick={()=>{ setFocusCourse(null); }} className="text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-full px-2 py-1">← Back</button>}
              <span className="text-xs text-slate-500">{enotes.length} resources</span>
            </div>
          </div>
          {enotes.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <NotebookText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No study notes for {focusCourse || student?.course} yet.</p>
              <p className="text-xs text-slate-400 mt-1">Check back soon — we add new material regularly.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {enotes.map(n => (
                <div key={n.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${n.accessType === "free" ? "bg-emerald-50 text-emerald-600" : "bg-violet-50 text-violet-600"}`}>
                    {n.accessType === "free" ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 leading-snug">{n.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{n.description}</p>
                    <span className={`inline-block mt-1 text-[10px] rounded-full px-2 py-0.5 font-semibold ${n.accessType === "free" ? "bg-emerald-100 text-emerald-700" : "bg-violet-100 text-violet-700"}`}>
                      {n.accessType === "free" ? "Free" : "Enrolled"}
                    </span>
                  </div>
                  {n.fileUrl ? (
                    <a href={n.fileUrl} target="_blank" rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1 rounded border border-violet-200 px-3 py-1.5 text-xs text-violet-700 hover:bg-violet-600 hover:text-white transition-colors">
                      Open <ArrowRight className="w-3 h-3" />
                    </a>
                  ) : n.content ? (
                    <span className="shrink-0 text-xs text-slate-400">Inline note</span>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Certificate/Marksheet preview modal */}
      <Modal open={!!preview} onClose={() => setPreview(null)} title="Document Preview" size="xl">
        {preview && (
          <>
            <div style={{ height: "70vh", overflowY: "auto", overflowX: "hidden" }}>
              <CertificatePreview data={preview} hideToolbar />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <span className="text-xs text-slate-500">
                Single-page A4 format ready for printing or saving as PDF
              </span>
              <button
                type="button"
                onClick={() => {
                  const docName = `RCCACE_${preview.documentType === "marksheet" ? "Marksheet" : "Certificate"}_${preview.studentName?.replace(/\s+/g, "_") || "Student"}`;
                  printCertificateDirectly(docName);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep shadow-sm transition-colors"
              >
                <Printer className="w-4 h-4" /> Print / Save as PDF
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
