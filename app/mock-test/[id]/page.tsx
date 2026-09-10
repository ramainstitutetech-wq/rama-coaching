"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Trophy,
  AlertTriangle,
  BookOpen,
  Target,
  HelpCircle,
  Send,
  RotateCcw,
  ArrowLeft,
  Circle,
  ShieldCheck,
  BadgeCheck,
  X,
  ClipboardList,
  ShieldAlert,
  Maximize,
  EyeOff,
} from "lucide-react";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";

interface PublicQuestion {
  id: string;
  questionText: string;
  questionTextHi?: string;
  options: string[];
  optionsHi?: string[];
  marks: number;
}

interface TestMeta {
  id: string;
  title: string;
  subject: string;
  description: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  questions: PublicQuestion[];
}

interface BreakdownItem {
  questionId: string;
  questionText: string;
  questionTextHi?: string;
  options: string[];
  optionsHi?: string[];
  selectedOption: number;
  correctOption: number;
  explanation: string;
  explanationHi?: string;
  isCorrect: boolean;
  marks: number;
  marksEarned: number;
}

interface TestResult {
  score: number;
  totalMarks: number;
  passingMarks: number;
  totalQuestions: number;
  attempted: number;
  correct: number;
  passed: boolean;
  percentage: number;
  grade?: string;
  breakdown: BreakdownItem[];
}

type Phase = "instructions" | "test" | "submitting" | "result";

const NIELIT_IMG = "https://www.uxdt.nic.in/wp-content/uploads/2020/06/NIELIT-Preview.png";

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function MockTestPage() {
  const params = useParams();
  const testId = params.id as string;

  const [test, setTest] = useState<TestMeta | null>(null);
  const [loadError, setLoadError] = useState("");
  const [phase, setPhase] = useState<Phase>("instructions");

  const [displayName, setDisplayName] = useState("");
  const [loginId] = useState(() => Math.random().toString(16).slice(2, 10).toUpperCase());

  const [isRamaChecked, setIsRamaChecked] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [rollNumber, setRollNumber] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [verifySuccess, setVerifySuccess] = useState("");
  const [verifiedFullName, setVerifiedFullName] = useState("");

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [result, setResult] = useState<TestResult | null>(null);
  const [resultTab, setResultTab] = useState<"summary" | "review">("summary");

  // security states
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [violationReason, setViolationReason] = useState("");
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    fetch(`/api/mock-tests?public=1&limit=100`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          const found = j.data.find((t: TestMeta) => t.id === testId);
          if (found) {
            setTest(found);
            setTimeLeft(found.duration * 60);
          } else setLoadError("Test not found or unavailable.");
        } else setLoadError("Failed to load test.");
      })
      .catch(() => setLoadError("Network error. Please try again."));
  }, [testId]);

  useEffect(() => {
    if (phase !== "test") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((p) => {
        if (p <= 1) {
          clearInterval(timerRef.current!);
          submitTest(true);
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [phase]);

  // ---------- security: fullscreen + anti-cheat ----------
  const enterFullscreen = useCallback(() => {
    try {
      const el: any = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if (el.msRequestFullscreen) el.msRequestFullscreen();
    } catch {}
  }, []);

  const exitFullscreen = useCallback(() => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen();
    } catch {}
  }, []);

  useEffect(() => {
    if (phase !== "test") return;

    // enter fullscreen on start
    enterFullscreen();
    let lastViolation = 0;
    const triggerViolation = (reason: string) => {
      const now = Date.now();
      if (now - lastViolation < 1200) return; // debounce same burst
      lastViolation = now;
      setTabSwitchCount((c) => {
        const n = c + 1;
        if (n <= 3) {
          // Show blocking warning modal — student must acknowledge
          const reasonText =
            reason === "fullscreen" ? "आपने fullscreen mode छोड़ा" :
            reason === "key" ? "आपने prohibited key दबाई" :
            "आपने exam window से बाहर switch किया";
          setViolationReason(reasonText);
          setShowViolationModal(true);
        }
        if (n >= 4) {
          // 4th violation — auto submit
          setTimeout(() => submitTest(true), 600);
        }
        return n;
      });
    };
    const onFullscreenChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      if (!fs) triggerViolation("fullscreen");
    };
    const onVisibilityChange = () => {
      if (document.hidden) triggerViolation("visibility");
    };
    const onWindowBlur = () => {
      // catches Alt+Tab, Win key, task switch
      triggerViolation("blur");
    };
    const onPageHide = () => triggerViolation("pagehide");
    const onContextMenu = (e: MouseEvent) => e.preventDefault();
    const onCopy = (e: ClipboardEvent) => e.preventDefault();
    const onCut = (e: ClipboardEvent) => e.preventDefault();
    const onKeyDown = (e: KeyboardEvent) => {
      // block F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+P, Ctrl+S, PrintScreen, Alt+Tab
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && ["U", "P", "S", "C", "A", "V"].includes(e.key.toUpperCase())) ||
        (e.altKey && e.key === "Tab") ||
        (e.altKey && e.code === "Tab") ||
        e.key === "PrintScreen"
      ) {
        e.preventDefault();
        triggerViolation("key");
        return false;
      }
      // Alt pressed alone often precedes Tab
      if (e.altKey) {
        // do not block Alt itself but watch next Tab
      }
    };
    const onSelectStart = (e: Event) => e.preventDefault();

    // polling hasFocus for Alt+Tab that bypasses visibilitychange on some OS/browsers
    const focusPoll = setInterval(() => {
      if (!document.hasFocus() && phase === "test") {
        triggerViolation("poll");
      }
    }, 700);

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onWindowBlur);
    window.addEventListener("pagehide", onPageHide as any);
    document.addEventListener("contextmenu", onContextMenu as any);
    document.addEventListener("copy", onCopy as any);
    document.addEventListener("cut", onCut as any);
    document.addEventListener("keydown", onKeyDown as any);
    // disable text selection via css is applied; also block selectstart
    document.addEventListener("selectstart", onSelectStart as any);

    return () => {
      clearInterval(focusPoll);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onWindowBlur);
      window.removeEventListener("pagehide", onPageHide as any);
      document.removeEventListener("contextmenu", onContextMenu as any);
      document.removeEventListener("copy", onCopy as any);
      document.removeEventListener("cut", onCut as any);
      document.removeEventListener("keydown", onKeyDown as any);
      document.removeEventListener("selectstart", onSelectStart as any);
    };
  }, [phase, enterFullscreen]);

  function handleRamaCheckChange(checked: boolean) {
    setIsRamaChecked(checked);
    if (checked) {
      if (!verified) {
        setShowVerifyModal(true);
        setVerifyError("");
        setVerifySuccess("");
      }
    } else {
      setVerified(false);
      setVerifyError("");
      setVerifySuccess("");
      setRollNumber("");
      setVerifiedFullName("");
    }
  }

  async function handleVerifyRoll() {
    const rn = rollNumber.trim();
    if (!rn) {
      setVerifyError("Please enter roll number");
      return;
    }
    setVerifying(true);
    setVerifyError("");
    setVerifySuccess("");
    try {
      const res = await fetch("/api/mock-tests/verify-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollNumber: rn }),
      });
      const j = await res.json();
      if (j.success && j.verified) {
        setVerified(true);
        setVerifySuccess("Student Verified Successfully");
        setVerifiedFullName(j.student?.fullName || "");
        setVerifyError("");
        if (!displayName.trim() && j.student?.fullName) setDisplayName(j.student.fullName);
        setTimeout(() => setShowVerifyModal(false), 900);
      } else {
        setVerifyError(j.error || "Student record not found. Please check your roll number.");
        setVerified(false);
      }
    } catch {
      setVerifyError("Verification failed. Please try again.");
      setVerified(false);
    } finally {
      setVerifying(false);
    }
  }

  function startTest() {
    if (!displayName.trim()) {
      alert("Please enter your name to start the exam.");
      return;
    }
    if (isRamaChecked && !verified) {
      alert("Please verify your roll number first or uncheck the box to continue as public student.");
      setShowVerifyModal(true);
      return;
    }
    setAnswers({});
    setCurrentQ(0);
    setTimeLeft((test?.duration ?? 30) * 60);
    setTabSwitchCount(0);
    setShowViolationModal(false);
    setPhase("test");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // submit helper - actual submit after confirm
  async function doSubmit(auto = false) {
    if (!test) return;
    clearInterval(timerRef.current!);
    setShowSubmitConfirm(false);
    // exit fullscreen on submit
    exitFullscreen();
    setPhase("submitting");
    try {
      const res = await fetch(`/api/mock-tests/${testId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          studentName: displayName.trim(),
          isRamaStudent: isRamaChecked && verified,
          rollNumber: isRamaChecked && verified ? rollNumber.trim() : "",
        }),
      });
      const j = await res.json();
      if (j.success) {
        setResult(j.result);
        setPhase("result");
        setResultTab("summary");
      } else {
        alert(j.error || "Submission failed. Please try again.");
        setPhase("test");
      }
    } catch {
      alert("Network error.");
      setPhase("test");
    }
  }

  async function submitTest(auto = false) {
    if (!test) return;
    if (auto) {
      // auto submit on time up or violations
      doSubmit(true);
      return;
    }
    // show confirmation modal with remaining time
    setShowSubmitConfirm(true);
  }

  function handleSubmitAnswer() {
    if (!test) return;
    const q = test.questions[currentQ];
    if (answers[q.id] === undefined) {
      // if no selection, just nudge
      const el = document.getElementById(`q-${q.id}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    // go to next question if exists, else show submit confirm
    if (currentQ < test.questions.length - 1) {
      setCurrentQ((p) => p + 1);
    } else {
      // last question -> show submit confirm
      setShowSubmitConfirm(true);
    }
  }

  function resetCurrentAnswer() {
    if (!test) return;
    const q = test.questions[currentQ];
    setAnswers((prev) => {
      const n = { ...prev };
      delete n[q.id];
      return n;
    });
  }

  if (!test && !loadError) {
    return (
      <>
        <SiteNav />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-white">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#DED8C9] border-t-[#b91c1c]" />
          <p className="text-sm text-[#5C574C]">Loading test…</p>
        </div>
        <SiteFooter />
      </>
    );
  }

  if (loadError) {
    return (
      <>
        <SiteNav />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center bg-white">
          <AlertTriangle className="h-12 w-12 text-amber-400" />
          <p className="text-base text-[#23211C]">{loadError}</p>
          <Link href="/mock-test" className="inline-flex items-center gap-2 rounded bg-[#b91c1c] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#991b1b]">
            <ArrowLeft className="h-4 w-4" /> Back to Tests
          </Link>
        </div>
        <SiteFooter />
      </>
    );
  }

  // ── Instructions ──
  if (phase === "instructions") {
    const totalQ = test!.questions.length;
    return (
      <>
        <SiteNav />
        <div className="min-h-screen bg-white">
          <div className="mx-auto max-w-3xl px-4 py-8">
            <div className="bg-[#EDEDED] border border-[#DED8C9] rounded-sm">
              <div className="px-6 sm:px-10 pt-10 pb-8">
                <p className="text-center text-sm text-[#5C574C]">
                  Test Name: <span className="font-medium text-[#E76B2A]">{test!.title.toLowerCase()}</span>
                </p>

                <div className="mt-10">
                  <p className="text-sm font-medium text-[#23211C]">INSTRUCTIONS:-</p>
                  <ul className="mt-3 space-y-2.5 text-sm text-[#23211C] leading-6">
                    <li className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#23211C] shrink-0" />
                      <span>Total Questions: {totalQ} MCQ</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#23211C] shrink-0" />
                      <span>Total Time: {test!.duration} Minutes</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#23211C] shrink-0" />
                      <span>
                        <span className="font-medium">Note:</span> After answering all the questions, click on Exam Finished / सभी प्रश्नों के उत्तर देने के बाद Exam Finished पर Click करे
                      </span>
                    </li>
                  </ul>

                  {/* Security notes highlighted */}
                  <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="text-xs font-medium text-amber-900 flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4" /> High Security Exam — Please read:
                    </p>
                    <ul className="mt-2 space-y-1.5 text-xs text-amber-900 leading-5 list-disc list-inside">
                      <li>Test starts in <span className="font-medium">full-screen</span> mode — do not minimize or exit.</li>
                      <li>Maximum <span className="font-medium">3 warnings</span> milenge — 3rd warning ke baad 4th violation par test <span className="font-medium">auto-submit</span> hoga.</li>
                      <li>
                        Copy, right-click, text selection and shortcuts (Ctrl+C, Ctrl+V, F12, PrintScreen) are <span className="font-medium">disabled</span> during test.
                      </li>
                      <li>Any attempt to open developer tools will be blocked.</li>
                      <li>Timer runs continuously — auto submit when time is over.</li>
                    </ul>
                  </div>

                  <p className="mt-4 text-center text-sm font-medium tracking-wide text-[#23211C]">***************** GOOD LUCK *****************</p>
                </div>

                <div className="mt-10 flex flex-col items-center gap-4">
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full max-w-[260px] rounded border border-[#DED8C9] bg-white px-3 py-2 text-sm text-[#23211C] placeholder:text-[#9A9A9A] focus:outline-none focus:border-[#1F3354] focus:ring-1 focus:ring-[#1F3354]"
                  />

                  <label className="flex items-center gap-2 text-sm text-[#23211C] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isRamaChecked}
                      onChange={(e) => handleRamaCheckChange(e.target.checked)}
                      className="h-4 w-4 rounded border-[#DED8C9] text-[#1F3354] focus:ring-[#1F3354]"
                    />
                    <span>Are you a student of Rama Coaching Center?</span>
                    {verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] text-emerald-700">
                        <BadgeCheck className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </label>
                  {isRamaChecked && !verified && <p className="text-xs text-amber-600">Please verify your roll number to continue as Rama student</p>}
                  {verified && verifiedFullName && (
                    <p className="text-xs text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> Verified as {verifiedFullName} ({rollNumber})
                    </p>
                  )}

                  {test!.questions.length === 0 ? (
                    <div className="rounded border border-dashed border-[#DED8C9] bg-white px-6 py-4 text-center w-full max-w-[320px]">
                      <p className="text-sm text-[#5C574C]">No questions added yet.</p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={startTest}
                      className="rounded bg-[#E76B2A] hover:bg-[#d55e1e] text-white text-sm font-medium px-8 py-2.5 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isRamaChecked && !verified}
                    >
                      Start Exam
                    </button>
                  )}
                  {isRamaChecked && !verified && (
                    <button type="button" onClick={() => setShowVerifyModal(true)} className="text-xs text-[#1F3354] underline">
                      Verify Roll Number
                    </button>
                  )}
                </div>
              </div>

              <div className="h-8 bg-[#EDEDED] border-t border-[#DED8C9]" />
            </div>

            <div className="mt-6">
              <LeaderboardBlock mockTestId={test!.id} />
            </div>
          </div>
        </div>

        {showVerifyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowVerifyModal(false)} />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-[#DED8C9]">
              <button type="button" onClick={() => setShowVerifyModal(false)} className="absolute right-3 top-3 p-1 rounded hover:bg-slate-100 text-[#5C574C]">
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="h-5 w-5 text-[#1F3354]" />
                <h3 className="text-base font-medium text-[#23211C]">Verify Rama Student</h3>
              </div>
              <p className="text-xs text-[#5C574C] mb-3">Enter your Roll Number assigned by Rama Coaching Center</p>
              <input
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="Enter your Roll Number"
                className="w-full rounded border border-[#DED8C9] bg-white px-3 py-2.5 text-sm text-[#23211C] placeholder:text-[#9A9A9A] focus:outline-none focus:border-[#1F3354] focus:ring-1 focus:ring-[#1F3354]"
              />
              {verifyError && <p className="mt-3 text-xs text-[#b91c1c] bg-red-50 border border-red-200 rounded px-3 py-2">{verifyError}</p>}
              {verifySuccess && (
                <p className="mt-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-2 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {verifySuccess}
                </p>
              )}
              <div className="mt-5 flex gap-3">
                <button type="button" onClick={() => setShowVerifyModal(false)} className="flex-1 rounded border border-[#DED8C9] bg-white px-4 py-2.5 text-sm text-[#5C574C] hover:bg-slate-50">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerifyRoll}
                  disabled={verifying}
                  className="flex-1 rounded bg-[#1F3354] hover:bg-[#16233B] text-white px-4 py-2.5 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {verifying ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Verifying...
                    </>
                  ) : (
                    "Verify"
                  )}
                </button>
              </div>
              <p className="mt-3 text-[11px] text-[#5C574C]/70 text-center">Not a Rama student? Close this and uncheck the box to continue as public.</p>
            </div>
          </div>
        )}

        <SiteFooter />
      </>
    );
  }

  // ── Test in progress ──
  if (phase === "test") {
    const q = test!.questions[currentQ];
    const total = test!.questions.length;
    const attempted = Object.keys(answers).length;
    const notAttempted = total - attempted;

    return (
      <div className="min-h-screen bg-[#EDEDED] flex flex-col select-none" style={{ userSelect: "none" }}>
        {/* tab switch warning */}
        {/* ── Violation Warning Modal (blocking) ── */}
        {showViolationModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70" />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border-2 border-red-500">
              {/* Red top bar */}
              <div className="bg-red-600 px-6 py-4 flex items-center gap-3">
                <ShieldAlert className="h-6 w-6 text-white shrink-0" />
                <div>
                  <p className="text-white font-bold text-base">⚠️ Warning / चेतावनी</p>
                  <p className="text-red-100 text-xs mt-0.5">Rule Violation Detected</p>
                </div>
              </div>
              <div className="px-6 py-5 space-y-4">
                {/* Violation reason */}
                <p className="text-sm text-slate-700 leading-relaxed">
                  <span className="font-semibold text-red-700">{violationReason}</span>
                </p>
                {/* Warning count */}
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className={`flex-1 rounded-full h-2.5 ${n <= tabSwitchCount ? "bg-red-500" : "bg-slate-200"}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-600">
                  Warning <span className="font-bold text-red-600">{tabSwitchCount}</span> of 3 —{" "}
                  {tabSwitchCount < 3
                    ? `${3 - tabSwitchCount} more warning${3 - tabSwitchCount > 1 ? "s" : ""} remaining before auto-submit`
                    : <span className="font-semibold text-red-700">अगली बार exam auto-submit हो जाएगा!</span>}
                </p>
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 leading-5 space-y-1">
                  <p className="font-semibold">Exam Rules / परीक्षा नियम:</p>
                  <p>• Fullscreen mode में रहें — बाहर न जाएं</p>
                  <p>• Tab / Window switch न करें</p>
                  <p>• कोई भी prohibited key न दबाएं</p>
                  <p>• 3 violations के बाद exam auto-submit हो जाएगा</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowViolationModal(false);
                    // Re-enter fullscreen after acknowledging
                    enterFullscreen();
                  }}
                  className="w-full rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold py-3 text-sm transition-colors"
                >
                  समझ गया — Exam जारी रखें (I Understand)
                </button>
              </div>
            </div>
          </div>
        )}
        {!isFullscreen && (
          <div className="bg-amber-100 border-b border-amber-300 text-amber-900 px-4 py-2 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5">
              <Maximize className="h-4 w-4" /> Fullscreen required for secure test
            </span>
            <button onClick={enterFullscreen} className="rounded bg-amber-600 text-white px-3 py-1 font-medium hover:bg-amber-700">
              Enter Fullscreen
            </button>
          </div>
        )}

        <div className="bg-white border-b border-slate-200">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-12 gap-0 border border-slate-200">
              <div className="col-span-12 lg:col-span-9 border-r border-slate-200">
                <div className="flex items-stretch">
                  <div className="hidden sm:flex items-center px-3 border-r border-slate-200">
                    <img src={NIELIT_IMG} alt="NIELIT" className="h-[92px] w-auto object-contain" style={{ height: "92px", width: "auto" }} />
                  </div>
                  <div className="flex-1 grid grid-cols-3 gap-0">
                    <div className="px-3 sm:px-4 py-3 border-r border-slate-200">
                      <p className="text-[11px] font-medium tracking-wide text-slate-600">Exam Name</p>
                      <p className="text-[13px] font-semibold text-slate-900 mt-1 leading-tight">{test!.title.toUpperCase()}</p>
                    </div>
                    <div className="px-3 sm:px-4 py-3 border-r border-slate-200">
                      <p className="text-[11px] font-medium tracking-wide text-slate-600">Login ID</p>
                      <p className="text-[13px] font-semibold text-slate-900 mt-1">{loginId}</p>
                      <p className="text-[11px] font-medium tracking-wide text-slate-600 mt-2">Language</p>
                      <p className="text-xs font-semibold text-emerald-600 mt-1">
                        {(() => {
                          const q0 = test!.questions[0];
                          const hasHi = q0?.questionTextHi?.trim();
                          const hasEn = q0?.questionText?.trim();
                          if (hasHi && hasEn) return "HINDI / ENGLISH";
                          if (hasHi) return "HINDI";
                          return "ENGLISH";
                        })()}
                      </p>
                    </div>
                    <div className="px-3 sm:px-4 py-3 flex flex-col justify-center">
                      <p className="text-[11px] font-medium tracking-wide text-slate-600">Name</p>
                      <p className="text-[13px] font-semibold text-slate-900 mt-1 flex items-center gap-1.5">
                        {displayName || "STUDENT"} {isRamaChecked && verified && <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />}
                      </p>
                      {isRamaChecked && verified && <p className="text-[11px] font-medium text-emerald-600 mt-1">Rama Verified • {rollNumber}</p>}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-5 divide-x divide-slate-200 border-t border-slate-200 text-xs text-center">
                  <div className="py-2.5 font-semibold text-slate-800">QN.{currentQ + 1}</div>
                  <div className="py-2.5 font-medium text-slate-700">Total Marks:<span className="font-semibold text-slate-900 ml-1">{test!.totalMarks}</span></div>
                  <div className="py-2.5 font-medium text-slate-700">Total Time:<span className="font-semibold text-slate-900 ml-1">{test!.duration} Minutes</span></div>
                  <div className="py-2.5 bg-red-50/60">
                    <span className="font-semibold text-red-700 text-sm tracking-wide">Remaining Time: {fmt(timeLeft)}</span>
                  </div>
                  <div className="py-2.5 font-medium text-slate-700">Mark:<span className="font-semibold text-slate-900 ml-1">{q.marks}</span></div>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-3 bg-white">
                <div className="border-b border-slate-200 p-2">
                  <button
                    type="button"
                    onClick={() => submitTest(false)}
                    className="w-full bg-[#0b7ae0] hover:bg-[#095fb0] text-white text-sm font-medium py-2.5 rounded-full shadow"
                  >
                    Exam Finished
                  </button>
                </div>
                <div className="text-[11px]">
                  <div className="bg-slate-50 text-center py-1.5 border-b border-slate-100 text-slate-700">Question Status</div>
                  <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 text-center">
                    <div className="py-2 flex flex-col items-center gap-1">
                      <span className="text-slate-600">Attempted</span>
                      <span className="h-4 w-4 rounded-full bg-[#1DB954] border border-[#0f7a33] inline-block" />
                      <span className="font-medium text-slate-800">{attempted}</span>
                    </div>
                    <div className="py-2 flex flex-col items-center gap-1">
                      <span className="text-slate-600">Not Attempted</span>
                      <span className="h-4 w-4 bg-[#E53935] border border-[#8a1a1a] inline-block" />
                      <span className="font-medium text-[#E53935]">{notAttempted}</span>
                    </div>
                    <div className="py-2 flex flex-col items-center gap-1">
                      <span className="text-slate-600">Current</span>
                      <span className="h-4 w-4 bg-[#FFC107] border border-[#9a7200] inline-block" />
                      <span className="font-medium text-slate-800">1</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 text-center py-1.5 border-b border-slate-100 text-slate-700">Choose Question</div>
                  <div className="p-2">
                    <div className="grid grid-cols-6 gap-1">
                      {test!.questions.map((qq, i) => {
                        const isAnswered = answers[qq.id] !== undefined;
                        const isCurrent = i === currentQ;
                        return (
                          <button
                            key={qq.id}
                            type="button"
                            onClick={() => setCurrentQ(i)}
                            className={`h-6 w-full text-[11px] border flex items-center justify-center ${
                              isCurrent ? "bg-[#FFC107] text-slate-900 border-[#9a7200]" : isAnswered ? "bg-[#1DB954] text-white border-[#0f7a33]" : "bg-[#E53935] text-white border-[#8a1a1a]"
                            }`}
                          >
                            {i + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 py-6">
          <div className="mx-auto max-w-6xl px-2 sm:px-4">
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col min-h-[460px] relative">
              {/* professional watermark — subtle tiled */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.035] select-none">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-10 p-8">
                  <span className="text-4xl font-light tracking-[0.25em] text-[#1F3354] whitespace-nowrap">Rama Coaching Center</span>
                  <span className="text-2xl font-light tracking-[0.4em] text-[#1F3354] whitespace-nowrap">Rama Coaching Center • Computer Education</span>
                </div>
              </div>

              <div className="relative flex-1 flex flex-col p-6 sm:p-8">
                {/* human-coded question header */}
                <div className="flex items-center gap-2 mb-5 text-sm">
                  <span className="h-2 w-2 rounded-full bg-[#1F3354]"></span>
                  <span className="font-medium text-slate-800">Question {currentQ + 1}</span>
                  <span className="text-slate-400">/</span>
                  <span className="text-slate-500">{total}</span>
                  <span className="ml-auto text-xs text-slate-500 border border-slate-200 rounded px-2 py-1 bg-slate-50">{q.marks} Mark{q.marks !== 1 ? "s" : ""}</span>
                </div>

                {/* bilingual — Hindi left, English right, synced selection */}
                {(() => {
                  const hasHindi = !!(q.questionTextHi?.trim());
                  const hasEnglish = !!(q.questionText?.trim());
                  const bothAvailable = hasHindi && hasEnglish;

                  // Single handler — selecting from either panel updates same answer
                  const selectOption = (i: number) => setAnswers({ ...answers, [q.id]: i });

                  const renderOptionList = (opts: string[], accentBg: string) =>
                    opts.map((opt, i) => {
                      const selected = answers[q.id] === i;
                      return (
                        <label
                          key={i}
                          onClick={() => selectOption(i)}
                          className={`flex items-center gap-2.5 rounded-md border px-3 py-2.5 cursor-pointer text-sm transition-colors select-none ${
                            selected
                              ? `border-[#1F3354] ${accentBg} text-[#1F3354] shadow-sm`
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {/* Hidden radio — single name keeps browser group in sync */}
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            value={i}
                            checked={selected}
                            onChange={() => selectOption(i)}
                            className="h-4 w-4 accent-[#1F3354] shrink-0 pointer-events-none"
                            tabIndex={-1}
                          />
                          <span className="text-xs font-medium shrink-0">({String.fromCharCode(65 + i)})</span>
                          <span className="flex-1 leading-snug">{opt}</span>
                          {selected && <CheckCircle2 className="h-3.5 w-3.5 text-[#1F3354] shrink-0" />}
                        </label>
                      );
                    });

                  return (
                    <div className={`flex-1 grid gap-6 lg:gap-8 ${bothAvailable ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
                      {/* Hindi panel */}
                      {hasHindi && (
                        <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 sm:p-5">
                          <p className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase mb-3">Hindi</p>
                          <h3 className="text-[14px] font-medium leading-7 text-slate-800">{q.questionTextHi}</h3>
                          <div className="mt-4 space-y-2">
                            {renderOptionList(
                              q.optionsHi?.length === 4 ? q.optionsHi : q.options,
                              "bg-white"
                            )}
                          </div>
                        </div>
                      )}
                      {/* English panel */}
                      {hasEnglish && (
                        <div className="rounded-lg border border-slate-100 bg-white p-4 sm:p-5">
                          <p className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase mb-3">English</p>
                          <h3 className="text-[14px] font-medium leading-7 text-slate-800">{q.questionText}</h3>
                          <div className="mt-4 space-y-2">
                            {renderOptionList(q.options, "bg-[#EEF2FF]")}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="mt-6 flex flex-wrap items-center gap-3 pt-5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    className="inline-flex items-center justify-center rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-6 py-2.5 shadow-sm min-w-[136px] h-10"
                  >
                    Submit Answer
                  </button>
                  <button
                    type="button"
                    onClick={resetCurrentAnswer}
                    className="inline-flex items-center justify-center rounded-md bg-white border-2 border-amber-300 text-amber-800 hover:bg-amber-50 hover:border-amber-400 text-sm font-semibold px-6 py-2.5 shadow-sm min-w-[136px] h-10"
                  >
                    Reset Answer
                  </button>
                  <span className={`text-xs font-medium ml-2 rounded-full px-3 py-1 border ${tabSwitchCount === 0 ? "bg-slate-100 border-slate-200 text-slate-600" : tabSwitchCount === 1 ? "bg-amber-50 border-amber-300 text-amber-700" : tabSwitchCount === 2 ? "bg-orange-50 border-orange-300 text-orange-700" : "bg-red-50 border-red-300 text-red-700 font-bold"}`}>
                    ⚠️ Warnings: {tabSwitchCount}/3
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button type="button" onClick={() => setCurrentQ((p) => Math.max(0, p - 1))} disabled={currentQ === 0} className="text-sm text-slate-600 disabled:opacity-40 flex items-center gap-1 hover:text-slate-900">
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              {currentQ < total - 1 ? (
                <button type="button" onClick={() => setCurrentQ((p) => Math.min(total - 1, p + 1))} className="text-sm bg-[#1F3354] text-white px-5 py-2 rounded-md font-medium hover:bg-[#16233B]">
                  Next <ChevronRight className="h-3.5 w-3.5 inline" />
                </button>
              ) : (
                <button type="button" onClick={() => submitTest(false)} className="text-sm bg-[#b91c1c] text-white px-5 py-2 rounded-md font-medium hover:bg-[#991b1b] inline-flex items-center gap-1.5">
                  <Send className="h-3.5 w-3.5" /> Submit Test
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Submit confirmation modal with remaining time */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowSubmitConfirm(false)} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-medium">Confirm Submit</h3>
              </div>
              <div className="px-6 py-5 space-y-4">
                <p className="text-sm text-slate-700">Are you sure you want to finish the exam?</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-center">
                    <p className="text-xs text-amber-700">Time Remaining</p>
                    <p className="text-lg font-medium text-amber-900 mt-1 flex items-center justify-center gap-1.5">
                      <Clock className="h-4 w-4" /> {fmt(timeLeft)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
                    <p className="text-xs text-slate-500">Attempted</p>
                    <p className="text-lg font-medium text-slate-800 mt-1">
                      {attempted}/{total}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{notAttempted} unanswered</p>
                  </div>
                </div>
                {notAttempted > 0 && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{notAttempted} question(s) still not attempted.</p>}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowSubmitConfirm(false)} className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                    Cancel
                  </button>
                  <button onClick={() => doSubmit(false)} className="flex-1 rounded-lg bg-[#b91c1c] hover:bg-[#991b1b] text-white px-4 py-2.5 text-sm font-medium">
                    Confirm Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (phase === "submitting") {
    return (
      <>
        <SiteNav />
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-white">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#DED8C9] border-t-[#b91c1c]" />
          <p className="text-sm font-medium text-[#5C574C]">Evaluating your answers…</p>
        </div>
        <SiteFooter />
      </>
    );
  }

  if (phase === "result" && result) {
    const pct = result.percentage;
    const circ = 2 * Math.PI * 40;
    const offset = circ - (pct / 100) * circ;

    return (
      <>
        <SiteNav />
        <div className="min-h-screen bg-white py-10">
          <div className="mx-auto max-w-3xl px-4 space-y-5">
            <div className={`rounded-xl overflow-hidden shadow-sm ${result.passed ? "bg-[#1DB954]" : "bg-[#1F3354]"}`}>
              <div className="px-8 py-7 flex flex-col sm:flex-row items-center justify-between gap-6 text-white">
                <div>
                  <p className="text-sm opacity-70 mb-1">{test!.title}</p>
                  <h2 className="text-2xl font-semibold">{result.passed ? "Well Done!" : "Keep Going!"}</h2>
                  <p className="mt-1 text-sm opacity-75">
                    {result.passed ? `You passed with ${pct}% — great work.` : `You scored ${pct}%. You need ${result.passingMarks} to pass.`}
                  </p>
                </div>
                <div className="relative h-28 w-28 shrink-0">
                  <svg className="-rotate-90 absolute inset-0" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="9" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="9" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">{pct}%</span>
                    <span className="text-[11px] opacity-70">
                      {result.score}/{result.totalMarks}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Score", val: `${result.score}/${result.totalMarks}`, col: "text-[#23211C]" },
                { label: "Correct", val: result.correct, col: "text-[#1DB954]" },
                { label: "Wrong", val: result.attempted - result.correct, col: "text-[#E53935]" },
                { label: "Skipped", val: result.totalQuestions - result.attempted, col: "text-[#5C574C]" },
              ].map((s) => (
                <div key={s.label} className="rounded border border-[#DED8C9] bg-white p-4 text-center shadow-sm">
                  <p className={`text-2xl font-bold ${s.col}`}>{s.val}</p>
                  <p className="text-xs text-[#5C574C] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex rounded border border-[#DED8C9] bg-white overflow-hidden shadow-sm">
              {(["summary", "review"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setResultTab(tab)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${resultTab === tab ? "bg-[#1F3354] text-white" : "text-[#5C574C] hover:bg-[#FBF9F4]"}`}
                >
                  {tab === "summary" ? "Summary" : `Review Answers (${result.breakdown.length})`}
                </button>
              ))}
            </div>

            {resultTab === "summary" && (
              <div className="bg-white rounded-xl border border-[#DED8C9] p-6 shadow-sm space-y-5">
                <h3 className="text-sm font-medium text-[#23211C]">Performance Breakdown</h3>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { label: "Your Score", value: result.score, max: result.totalMarks, color: result.passed ? "bg-[#1DB954]" : "bg-[#E53935]" },
                    { label: "Passing Mark", value: result.passingMarks, max: result.totalMarks, color: "bg-amber-400" },
                  ].map((bar) => (
                    <div key={bar.label}>
                      <div className="flex justify-between text-xs text-[#5C574C] mb-1.5">
                        <span>{bar.label}</span>
                        <span className="text-[#23211C]">
                          {bar.value}/{bar.max}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full rounded-full ${bar.color}`} style={{ width: `${bar.max > 0 ? (bar.value / bar.max) * 100 : 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {resultTab === "review" && (
              <div className="space-y-3">
                {result.breakdown.map((item, idx) => (
                  <ReviewCard key={item.questionId} item={item} index={idx} />
                ))}
              </div>
            )}

            <LeaderboardBlock mockTestId={test!.id} />

            <div className="flex flex-col sm:flex-row gap-3 pb-10">
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setAnswers({});
                  setCurrentQ(0);
                  setPhase("instructions");
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded border border-[#1F3354] px-5 py-3 text-sm text-[#1F3354] hover:bg-[#1F3354] hover:text-white transition-colors"
              >
                <RotateCcw className="h-4 w-4" /> Retake Test
              </button>
              <Link href="/mock-test" className="flex-1 flex items-center justify-center gap-2 rounded bg-[#b91c1c] px-5 py-3 text-sm font-medium text-white hover:bg-[#991b1b] transition-colors">
                <ArrowLeft className="h-4 w-4" /> All Mock Tests
              </Link>
            </div>
          </div>
        </div>
        <SiteFooter />
      </>
    );
  }

  return null;
}

function LeaderboardBlock({ mockTestId }: { mockTestId: string }) {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/mock-tests/${mockTestId}/leaderboard?limit=20`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j.success) {
          setLeaders(j.leaderboard || []);
          setTotalAttempted(j.totalAttempted || 0);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mockTestId]);

  return (
    <div className="bg-white border border-[#23211C]/15 overflow-hidden">
      <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DED8C9] bg-[#FBF9F4]">
        <div>
          <p className="text-sm font-bold flex items-center gap-1.5 text-[#23211C]">
            <Trophy className="h-4 w-4 text-[#E76B2A]" /> LEADERBOARD: TOP <span className="text-[#E76B2A]">20</span> RANKERS
          </p>
          <Link href="/courses" className="inline-flex items-center gap-1 mt-1.5 rounded-full bg-[#0b5cab] text-white text-[11px] font-semibold px-3 py-1">
            <BookOpen className="h-3 w-3" /> Get Language Courses
          </Link>
        </div>
        <div className="text-right flex flex-col items-end gap-0.5">
          <p className="text-xs font-bold text-[#23211C]">TOTAL ATTEMPTED:</p>
          <p className="text-sm font-bold text-[#1a8a3a] flex items-center gap-1">
            <ClipboardList className="h-4 w-4" /> {totalAttempted}
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-[#0a0a0a] text-white text-[11px]">
              <th className="py-2 px-2 text-center whitespace-nowrap">Rank</th>
              <th className="py-2 px-2 text-left whitespace-nowrap">Name</th>
              <th className="py-2 px-2 text-center whitespace-nowrap">Date</th>
              <th className="py-2 px-2 text-center whitespace-nowrap">Time</th>
              <th className="py-2 px-2 text-center whitespace-nowrap">Score</th>
              <th className="py-2 px-2 text-center whitespace-nowrap">Percentage</th>
              <th className="py-2 px-2 text-center whitespace-nowrap">Grade</th>
              <th className="py-2 px-2 text-left whitespace-nowrap">Student Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#5C574C]">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#DED8C9] border-t-[#1F3354]" /> Loading leaderboard...
                  </span>
                </td>
              </tr>
            ) : leaders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#5C574C] text-xs">
                  No attempts yet. Be the first to take this test.
                </td>
              </tr>
            ) : (
              leaders.map((r: any) => (
                <tr key={`${r.rank}-${r.name}-${r.createdAt}`} className={r.rank % 2 === 0 ? "bg-[#FFF8ED]" : "bg-white"}>
                  <td className="py-2 px-2 text-center border-t border-[#DED8C9]/50 font-semibold">{r.rank}</td>
                  <td className="py-2 px-2 border-t border-[#DED8C9]/50">
                    <span className="font-medium text-[#23211C]">{r.name}</span>
                  </td>
                  <td className="py-2 px-2 text-center border-t border-[#DED8C9]/50 whitespace-nowrap">{r.date}</td>
                  <td className="py-2 px-2 text-center border-t border-[#DED8C9]/50 whitespace-nowrap">{r.time}</td>
                  <td className="py-2 px-2 text-center border-t border-[#DED8C9]/50">
                    {r.score}/{r.totalMarks}
                  </td>
                  <td className="py-2 px-2 text-center border-t border-[#DED8C9]/50 font-semibold">{r.percentage}%</td>
                  <td className="py-2 px-2 text-center border-t border-[#DED8C9]/50">{r.grade}</td>
                  <td className="py-2 px-2 border-t border-[#DED8C9]/50 whitespace-nowrap">
                    {r.isRamaStudent ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF4FF] border border-[#B8D4F0] px-2 py-0.5 text-[10px] font-medium text-[#0b5cab]">
                        <BadgeCheck className="h-3 w-3" /> Student of Rama Coaching Center
                      </span>
                    ) : (
                      <span className="text-[#5C574C]/40">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReviewCard({ item, index }: { item: BreakdownItem; index: number }) {
  const labels = ["A", "B", "C", "D"];
  const skipped = item.selectedOption === -1;
  const hasHindi = !!(item.questionTextHi?.trim());

  const OptionRow = ({
    opts, hiOpts, prefix,
  }: { opts: string[]; hiOpts?: string[]; prefix: string }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {opts.map((opt, i) => {
        const correct   = i === item.correctOption;
        const wrongPick = i === item.selectedOption && !correct;
        return (
          <div key={`${prefix}-${i}`}
            className={`flex flex-col gap-0.5 rounded border px-3.5 py-2.5 text-xs ${
              correct    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : wrongPick ? "border-red-200 bg-red-50 text-red-800"
              : "border-[#DED8C9]/50 bg-[#FBF9F4] text-[#5C574C]"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-medium ${
                correct ? "bg-emerald-500 text-white" : wrongPick ? "bg-red-500 text-white" : "bg-[#DED8C9] text-[#5C574C]"
              }`}>{labels[i]}</span>
              <span className="flex-1 leading-snug">{opt}</span>
              {correct    && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
              {wrongPick  && <XCircle      className="h-3.5 w-3.5 shrink-0 text-red-500" />}
            </div>
            {/* Hindi sub-text */}
            {hiOpts?.[i]?.trim() && (
              <p className="ml-9 text-[10px] text-slate-400 leading-snug">{hiOpts[i]}</p>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="bg-white rounded border border-[#DED8C9] overflow-hidden shadow-sm">
      {/* Status strip */}
      <div className={`flex items-center justify-between px-5 py-2.5 text-xs ${
        skipped      ? "bg-[#FBF9F4] text-[#5C574C] border-b border-[#DED8C9]"
        : item.isCorrect ? "bg-emerald-50 text-emerald-700 border-b border-emerald-100"
        : "bg-red-50 text-red-700 border-b border-red-100"
      }`}>
        <span className="flex items-center gap-1.5 font-medium">
          {skipped ? <Circle className="h-3.5 w-3.5" /> : item.isCorrect ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
          Q{index + 1} — {skipped ? "Skipped" : item.isCorrect ? "Correct" : "Incorrect"}
        </span>
        <span>{item.marks} {item.marks === 1 ? "mark" : "marks"}</span>
      </div>

      <div className="px-5 py-5">
        {/* Question — bilingual if available */}
        {hasHindi ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
            {/* Hindi */}
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Hindi</p>
              <p className="text-sm leading-relaxed text-[#23211C]">{item.questionTextHi}</p>
            </div>
            {/* English */}
            <div className="rounded-lg border border-slate-100 bg-white px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">English</p>
              <p className="text-sm leading-relaxed text-[#23211C]">{item.questionText}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-[#23211C] mb-4">{item.questionText}</p>
        )}

        {/* Options */}
        <OptionRow opts={item.options} hiOpts={item.optionsHi} prefix="opt" />

        {/* Explanation */}
        {item.explanation && (
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3">
            <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <div className="text-xs leading-relaxed text-amber-800">
              <span className="font-semibold">Explanation: </span>
              {item.explanation}
              {item.explanationHi?.trim() && (
                <p className="mt-1 text-amber-700 border-t border-amber-200 pt-1">{item.explanationHi}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
