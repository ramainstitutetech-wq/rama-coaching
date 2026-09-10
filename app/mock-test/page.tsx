"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ClipboardList, Clock, Target, HelpCircle, BookOpen, ArrowRight,
  NotebookText,
} from "lucide-react";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import type { MockTest } from "@/data/types";

const TABS = ["All", "General", "O-Level", "CCC", "CCC+", "ADCA", "DCA", "Tally", "Digital Marketing", "RSCIT", "Other"] as const;
type Tab = (typeof TABS)[number];

export default function MockTestListPage() {
  const [tests,  setTests]  = useState<MockTest[]>([]);
  const [loading, setLoading]  = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("All");

  useEffect(() => {
    fetch("/api/mock-tests?public=1&limit=100", { cache: "no-store" })
      .then(r => r.json())
      .then(j => { if (j.success) setTests(j.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredTests = useMemo(() =>
    activeTab === "All" ? tests : tests.filter(t => t.courseCategory === activeTab),
    [tests, activeTab]
  );

  const tabCount = (tab: Tab) => tab === "All" ? tests.length : tests.filter(t => t.courseCategory === tab).length;
  const visibleTabs = TABS.filter(t => t === "All" || tabCount(t) > 0);

  return (
    <>
      <SiteNav />

      {/* ── Hero banner ──────────────────────────────────────────────────── */}
      <section className="relative w-full">
        <img src="/test-bg.png" alt="Free Mock Test" className="w-full object-cover" />
        <div className="absolute inset-y-0 right-0 flex w-[52%] sm:w-[45%] lg:w-[38%] items-center px-4 sm:px-6 lg:px-10">
          <div className="w-full bg-black/50 backdrop-blur-sm border border-white/15 px-4 py-4 sm:px-5 sm:py-5">
            <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-white/50 mb-1.5 hidden sm:block">Rama Coaching Centre</p>
            <h2 className="text-sm sm:text-base lg:text-xl font-semibold text-white leading-snug">
              Test Yourself. <span className="text-yellow-400">Know Where You Stand.</span>
            </h2>
            <p className="mt-1.5 text-[10px] sm:text-xs text-white/65 leading-relaxed hidden sm:block">
              Free mock tests · No registration · Instant results
            </p>
            <a href="#tests" className="mt-3 inline-flex items-center bg-red-600 hover:bg-red-700 text-white text-[10px] sm:text-xs px-3 py-1.5 sm:px-4 sm:py-2 transition-colors">
              Browse Tests →
            </a>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            {[
              { n: "1", title: "Pick a Test", desc: "Choose from our curated subject-wise mock tests." },
              { n: "2", title: "Answer Questions", desc: "Select from 4 options per question within the time limit." },
              { n: "3", title: "See Your Score", desc: "Get instant results with correct answers and explanations." },
            ].map((s) => (
              <div key={s.n} className="flex items-start gap-3 px-6 py-4 sm:py-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-medium text-white mt-0.5">{s.n}</span>
                <div>
                  <p className="text-sm font-medium text-slate-800">{s.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Tabs ─────────────────────────────────────────────────── */}
      <section id="tests" className="bg-white pt-10 pb-0">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-red-600 mb-1">Study Material</p>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">Mock Tests</h2>
            <p className="text-sm text-slate-500 mt-1">Practice tests by course category — free, no login required</p>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 overflow-x-auto pb-0 scrollbar-hide border-b border-slate-200">
            {visibleTabs.map(tab => {
              const count = tabCount(tab);
              const active = activeTab === tab;
              return (
                <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                  className={`shrink-0 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                    active
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                  }`}>
                  {tab}
                  {count > 0 && (
                    <span className={`ml-1.5 text-[10px] rounded-full px-1.5 py-0.5 ${active ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Content area ─────────────────────────────────────────────────── */}
      <section className="bg-white py-8">
        <div className="mx-auto max-w-6xl px-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-slate-100 bg-slate-50 h-56" />
              ))}
            </div>
          ) : (
            <>
              {/* Mock Tests grid */}
              {filteredTests.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredTests.map(test => <TestCard key={test.id} test={test} />)}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
                  <ClipboardList className="h-10 w-10 text-slate-300" />
                  <p className="font-medium text-slate-500">No tests for {activeTab} yet</p>
                  <p className="text-sm text-slate-400">Check back soon — we add new tests regularly.</p>
                </div>
              )}

              {/* Link to E-Notes / Study Material */}
              <div className="mt-8 flex items-center justify-between rounded-xl border border-violet-100 bg-violet-50/60 px-5 py-4">
                <div className="flex items-center gap-3">
                  <NotebookText className="h-5 w-5 text-violet-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">Looking for study notes & PDFs?</p>
                    <p className="text-xs text-slate-500">Browse E-Notes under Study Material section</p>
                  </div>
                </div>
                <Link href="/e-notes"
                  className="shrink-0 text-xs font-medium text-violet-700 border border-violet-200 rounded px-3 py-1.5 hover:bg-violet-600 hover:text-white transition-colors">
                  Study Material →
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

// ── Test Card ─────────────────────────────────────────────────────────────────
function TestCard({ test }: { test: MockTest }) {
  const qCount = test.questions?.length ?? 0;
  const canStart = qCount > 0;
  const passPercent = test.totalMarks > 0 ? Math.round((test.passingMarks / test.totalMarks) * 100) : 0;

  return (
    <div className="group flex flex-col rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="bg-[#1F3354] px-5 py-4">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 rounded bg-white/15 px-2.5 py-1 text-[11px] uppercase tracking-wide text-white/70">
            <BookOpen className="h-3 w-3" /> {test.courseCategory || test.subject}
          </span>
          {test.isFree !== false && (
            <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-900/30 rounded px-2 py-0.5">FREE</span>
          )}
        </div>
        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 mt-1">{test.title}</h3>
      </div>
      <div className="flex flex-1 flex-col px-5 py-4">
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{test.description}</p>
        <div className="mt-4 flex items-center gap-5 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-400" />{test.duration} min</span>
          <span className="flex items-center gap-1.5"><HelpCircle className="h-3.5 w-3.5 text-slate-400" />{qCount} questions</span>
          <span className="flex items-center gap-1.5"><Target className="h-3.5 w-3.5 text-slate-400" />{test.totalMarks} marks</span>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
            <span>Passing score</span>
            <span className="font-semibold text-slate-600">{test.passingMarks}/{test.totalMarks}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${passPercent}%` }} />
          </div>
        </div>
        <div className="mt-5">
          {canStart ? (
            <Link href={`/mock-test/${test.id}`}
              className="flex items-center justify-between w-full rounded border border-[#1F3354] bg-white px-4 py-2.5 text-sm text-[#1F3354] hover:bg-[#1F3354] hover:text-white transition-colors group/btn">
              <span>Start Test</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
            </Link>
          ) : (
            <div className="flex items-center justify-center w-full rounded border border-dashed border-slate-200 px-4 py-2.5 text-sm text-slate-400">
              Questions coming soon
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

