"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Clock, BookOpen, ArrowLeft, CheckCircle2, ClipboardList,
  NotebookText, Phone, Mail, ArrowRight, Lock, Globe,
  GraduationCap, IndianRupee, AlertTriangle,
} from "lucide-react";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import type { MockTest } from "@/data/types";

interface CourseDetail {
  id: string; name: string; description: string;
  duration: string; fees: string; category: string; accent: string;
  imageUrl?: string;
}

interface ENote {
  id: string; title: string; description: string;
  courseCategory: string; accessType: string; fileUrl: string; content: string;
}

// ── Course features by category ───────────────────────────────────────────────
const COURSE_FEATURES: Record<string, string[]> = {
  "O-Level": ["NIELIT O-Level Certification", "Programming in C / Python", "Internet & Web Tech", "Practical Lab Sessions", "Government Recognized"],
  "CCC": ["NIELIT CCC Certificate", "MS Office Suite", "Internet & Email", "Basic IT Tools", "Government Exam Prep"],
  "CCC+": ["Advanced CCC Content", "Database Basics", "Spreadsheet Mastery", "Online Communication Tools"],
  "ADCA": ["Advanced Diploma in Computer Applications", "Programming Basics", "Web Development", "DTP & Graphics", "Project Work"],
  "DCA": ["Diploma in Computer Applications", "MS Office", "Tally Basics", "Internet Browsing", "Government Certificate"],
  "Tally": ["Tally Prime Complete", "GST & Taxation", "Inventory Management", "Payroll Processing", "Financial Accounting"],
  "Digital Marketing": ["SEO & SEM", "Social Media Marketing", "Google Ads", "Content Marketing", "Analytics"],
  "RSCIT": ["RSCIT Certification", "Rajasthan Govt Recognized", "Basic Computer Skills", "Internet & Email", "Digital Literacy"],
  "default": ["Government Recognized Certificate", "Expert Faculty", "Practical Training", "Placement Support", "Study Material Provided"],
};

function getFeatures(category: string) {
  return COURSE_FEATURES[category] || COURSE_FEATURES["default"];
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CourseDetailPage() {
  const { id } = useParams() as { id: string };

  const [course,  setCourse]  = useState<CourseDetail | null>(null);
  const [tests,   setTests]   = useState<MockTest[]>([]);
  const [enotes,  setEnotes]  = useState<ENote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolledStatus, setEnrolledStatus] = useState<string | null>(null);

  const [testsLoading, setTestsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Parallel: course + enrollment check (no category needed) — fastest first paint
        const [cRes, meJson, enrJson] = await Promise.all([
          fetch(`/api/courses/${id}`).then(r=>r.json()).catch(()=>null),
          fetch(`/api/student/me`).then(r=>r.json()).catch(()=>null),
          fetch(`/api/enrollments/my`).then(r=>r.json()).catch(()=>null),
        ]);
        if (!cRes?.success) { setError("Course not found."); setLoading(false); return; }

        const course: CourseDetail = {
          id: cRes.data.id, name: cRes.data.name, description: cRes.data.description,
          duration: cRes.data.duration, fees: cRes.data.fees,
          category: cRes.data.category, accent: cRes.data.accent,
          imageUrl: cRes.data.imageUrl || "",
        };
        setCourse(course);
        setLoading(false); // show course header immediately — no 6s blank

        // Load free mock tests + free notes for this course's category — in background
        Promise.all([
          fetch(`/api/mock-tests?public=1&free=1&category=${encodeURIComponent(course.category)}&limit=6`).then(r => r.json()).catch(()=>null),
          fetch(`/api/enotes?public=1&access=free&category=${encodeURIComponent(course.category)}`).then(r => r.json()).catch(()=>null),
        ]).then(([tRes, nRes]) => {
          if (tRes?.success) setTests(tRes.data);
          if (nRes?.success) setEnotes(nRes.data);
          setTestsLoading(false);
        });

        // Check if already enrolled — use already fetched me/enr
        try {
          const meRes = meJson;
          const enrRes = enrJson;
          const meCourseId = meRes?.success ? String(meRes.data?.courseId || meRes.data?.id || "") : "";
          // Student model has courseId not exposed via /api/student/me — fallback via courseName match
          const meCourseName = meRes?.success ? String(meRes.data?.course || "") : "";
          let enrolled = false;
          let status: string | null = null;

          // Primary course (student.course)
          if (meCourseName && meCourseName.toLowerCase().trim() === course.name.toLowerCase().trim()) {
            enrolled = true; status = "approved";
          }
          // Check Enrollments
          if (enrRes?.success && Array.isArray(enrRes.data)) {
            const found = enrRes.data.find((e: any) => String(e.courseId) === String(course.id) || String(e.courseName).toLowerCase() === course.name.toLowerCase());
            if (found) { enrolled = true; status = found.status; }
          }
          // Also check raw student courseId if available
          if (meCourseId && meCourseId === String(course.id)) { enrolled = true; status = "approved"; }

          if (enrolled) { setIsEnrolled(true); setEnrolledStatus(status); }
        } catch {}
      } catch { setError("Network error. Please try again."); }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return (
    <>
      <SiteNav />
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-red-600" />
      </div>
      <SiteFooter />
    </>
  );

  if (error || !course) return (
    <>
      <SiteNav />
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-400" />
        <p className="text-base text-slate-700">{error || "Course not found."}</p>
        <Link href="/courses" className="inline-flex items-center gap-2 rounded bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700">
          <ArrowLeft className="h-4 w-4" /> Back to Courses
        </Link>
      </div>
      <SiteFooter />
    </>
  );

  const features = getFeatures(course.category);

  return (
    <>
      <SiteNav />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="bg-[#1F3354] text-white">
        <div className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-10 items-start">

            {/* ── Left — image only (full, clean) ── */}
            <div className="flex flex-col gap-4">
              <Link href="/courses" className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white text-sm transition-colors w-fit">
                <ArrowLeft className="h-4 w-4" /> All Courses
              </Link>
              <h1 className="text-3xl lg:text-4xl font-bold leading-tight">{course.name}</h1>
              <p className="text-slate-300 leading-relaxed text-sm">{course.description}</p>
              {course.imageUrl?.trim() ? (
                <div className="rounded-xl overflow-hidden w-full mt-1 shadow-lg">
                  <img
                    src={course.imageUrl}
                    alt={course.name}
                    className="w-full object-cover"
                    style={{ maxHeight: 320 }}
                  />
                </div>
              ) : (
                <div className="rounded-xl bg-white/5 border border-white/10 w-full flex items-center justify-center" style={{ height: 200 }}>
                  <BookOpen className="h-16 w-16 text-white/20" />
                </div>
              )}
            </div>

            {/* ── Right — fees card ── */}
            <div className="bg-white text-slate-800 rounded-xl shadow-xl overflow-hidden mt-16">
              {/* Course meta strip */}
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-slate-400" />
                  {course.duration}
                </span>
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-slate-400" />
                  Government Recognized
                </span>
              </div>

              <div className="p-6">
                <div className="text-center mb-5">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Course Fee</p>
                  <p className="text-4xl font-bold text-[#1F3354] flex items-center justify-center gap-1">
                    <IndianRupee className="h-7 w-7" />
                    {course.fees.replace(/[₹,]/g, "")}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">One-time payment · All inclusive</p>
                </div>

                <ul className="space-y-2 mb-6">
                  {features.slice(0, 4).map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>

                {isEnrolled ? (
                  <div className="w-full rounded bg-emerald-50 border-2 border-emerald-200 text-emerald-700 py-3 text-sm font-semibold flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-5 w-5" /> Already Enrolled {enrolledStatus === "pending_verification" ? "— Pending" : ""}
                  </div>
                ) : (
                  <Link href={`/enroll/${course.id}`} className="flex items-center justify-center gap-2 w-full rounded bg-red-600 hover:bg-red-700 text-white py-3 text-sm font-semibold transition-colors">
                    Enroll Now — {course.fees} <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
                <p className="text-center text-xs text-slate-400 mt-3">
                  Visit our center or <a href="tel:08299121689" className="text-red-600 hover:underline">call 08299121689</a>
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── What you'll learn ─────────────────────────────────────────── */}
      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">What you'll learn</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map(f => (
              <div key={f} className="flex items-center gap-3 bg-white rounded border border-slate-100 px-4 py-3 shadow-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-sm text-slate-700">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Free Trial Mock Tests — skeleton while loading ───────────── */}
      {testsLoading ? (
        <section className="bg-white py-12">
          <div className="mx-auto max-w-6xl px-6">
            <div className="h-6 w-48 bg-slate-100 rounded animate-pulse mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3].map(i=> <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 animate-pulse"><div className="h-4 bg-slate-100 rounded w-3/4 mb-3"/><div className="h-3 bg-slate-50 rounded w-full mb-2"/><div className="h-8 bg-slate-100 rounded"/></div>)}
            </div>
          </div>
        </section>
      ) : tests.length > 0 && (
        <section className="bg-white py-12">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-red-600 mb-1">Practice for free</p>
                <h2 className="text-xl font-semibold text-slate-800">Free Mock Tests for {course.category}</h2>
              </div>
              <Link href="/mock-test" className="text-sm text-red-600 hover:underline">View all →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {tests.map(test => (
                <TrialTestCard key={test.id} test={test} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Free E-Notes ─────────────────────────────────────────────── */}
      {testsLoading ? (
        <section className="bg-slate-50 py-12">
          <div className="mx-auto max-w-6xl px-6">
            <div className="h-6 w-48 bg-slate-100 rounded animate-pulse mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i=> <div key={i} className="rounded-xl border border-violet-100 bg-white p-5 animate-pulse"><div className="h-4 bg-slate-100 rounded w-3/4 mb-3"/><div className="h-3 bg-slate-50 rounded w-full"/></div>)}
            </div>
          </div>
        </section>
      ) : enotes.length > 0 && (
        <section className="bg-slate-50 py-12">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-1">Study resources</p>
                <h2 className="text-xl font-semibold text-slate-800">Free Study Notes</h2>
              </div>
              <Link href="/mock-test" className="text-sm text-violet-600 hover:underline">View all →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {enotes.map(note => (
                <FreeNoteCard key={note.id} note={note} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Enroll CTA ───────────────────────────────────────────────── */}
      <section className="bg-red-700 py-12">
        <div className="mx-auto max-w-4xl px-6 text-center text-white">
          <h2 className="text-2xl font-semibold mb-2">Ready to join {course.name}?</h2>
          <p className="text-red-100 text-sm mb-7">Enroll today and get access to all study materials, mock tests, and expert guidance.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact"
              className="inline-flex items-center gap-2 bg-white text-red-700 px-6 py-3 rounded font-semibold text-sm hover:bg-red-50 transition-colors">
              <Mail className="h-4 w-4" /> Enquire Now
            </Link>
            <a href="tel:08299121689"
              className="inline-flex items-center gap-2 border border-white/40 text-white px-6 py-3 rounded font-medium text-sm hover:bg-white/10 transition-colors">
              <Phone className="h-4 w-4" /> Call: 08299121689
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

// ── Trial Test Card ───────────────────────────────────────────────────────────
function TrialTestCard({ test }: { test: MockTest }) {
  const qCount = test.questions?.length ?? 0;
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-1 bg-red-600" />
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <ClipboardList className="h-4 w-4 text-red-600 shrink-0" />
          <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 rounded px-2 py-0.5">FREE TRIAL</span>
        </div>
        <h3 className="text-sm font-semibold text-slate-800 leading-snug mb-1 line-clamp-2">{test.title}</h3>
        <p className="text-xs text-slate-500 mb-3 line-clamp-2">{test.description}</p>
        <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{test.duration}m</span>
          <span className="flex items-center gap-1"><ClipboardList className="h-3 w-3" />{qCount} Qs</span>
        </div>
        {qCount > 0 ? (
          <Link href={`/mock-test/${test.id}`}
            className="flex items-center justify-between w-full rounded border border-[#1F3354] px-3 py-2 text-xs text-[#1F3354] hover:bg-[#1F3354] hover:text-white transition-colors">
            Start Free Test <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <div className="text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded py-2">Coming soon</div>
        )}
      </div>
    </div>
  );
}

// ── Free Note Card ────────────────────────────────────────────────────────────
function FreeNoteCard({ note }: { note: ENote }) {
  return (
    <div className="rounded-xl border border-violet-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-1 bg-violet-600" />
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <NotebookText className="h-4 w-4 text-violet-600 shrink-0" />
          <Globe className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-xs text-emerald-600 font-semibold">Free</span>
        </div>
        <h3 className="text-sm font-semibold text-slate-800 leading-snug mb-1 line-clamp-2">{note.title}</h3>
        <p className="text-xs text-slate-500 mb-4 line-clamp-2">{note.description}</p>
        {note.fileUrl ? (
          <a href={note.fileUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between w-full rounded border border-violet-200 px-3 py-2 text-xs text-violet-700 hover:bg-violet-600 hover:text-white transition-colors">
            View / Download <ArrowRight className="h-3.5 w-3.5" />
          </a>
        ) : (
          <p className="text-xs text-slate-500 bg-slate-50 rounded p-2 line-clamp-3">{note.content}</p>
        )}
      </div>
    </div>
  );
}
