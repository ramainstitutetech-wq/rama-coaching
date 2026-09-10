"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  NotebookText, Globe, Lock, ChevronRight, BookOpen,
  ArrowRight, Search, FileText,
} from "lucide-react";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";

const TABS = ["All", "General", "O-Level", "CCC", "CCC+", "ADCA", "DCA", "Tally", "Digital Marketing", "RSCIT", "Other"] as const;
type Tab = (typeof TABS)[number];

interface ENote {
  id: string; title: string; description: string;
  courseCategory: string; accessType: string;
  imageUrl: string; fileUrl: string; content: string;
}

export default function ENotesPage() {
  const [notes,   setNotes]   = useState<ENote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/enotes?public=1", { cache: "no-store" })
      .then(r => r.json())
      .then(j => { if (j.success) setNotes(j.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = activeTab === "All" ? notes : notes.filter(n => n.courseCategory === activeTab);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(n => n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q));
    }
    return list;
  }, [notes, activeTab, query]);

  // Group by category for "All" tab
  const grouped = useMemo(() => {
    if (activeTab !== "All") return null;
    const map: Record<string, ENote[]> = {};
    for (const n of filtered) {
      if (!map[n.courseCategory]) map[n.courseCategory] = [];
      map[n.courseCategory].push(n);
    }
    return map;
  }, [filtered, activeTab]);

  const tabCount = (tab: Tab) =>
    tab === "All" ? notes.length : notes.filter(n => n.courseCategory === tab).length;

  const visibleTabs = TABS.filter(t => t === "All" || tabCount(t) > 0);

  const freeCount    = notes.filter(n => n.accessType === "free").length;
  const enrolledCount = notes.filter(n => n.accessType === "enrolled").length;

  return (
    <>
      <SiteNav />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="bg-[#1F3354] text-white py-12 lg:py-14">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-slate-300 mb-4">
                <NotebookText className="h-3.5 w-3.5" /> Study Material
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
                E-Notes & Study Material
              </h1>
              <p className="mt-3 text-slate-300 text-sm leading-relaxed max-w-lg">
                Course-wise notes, PDFs and study material. Free notes are open to all.
                Enrolled students get access to premium content on their dashboard.
              </p>
              <div className="mt-5 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/10 rounded px-3 py-1.5">
                  <Globe className="h-4 w-4 text-emerald-400" />
                  <span>{freeCount} Free notes</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded px-3 py-1.5">
                  <Lock className="h-4 w-4 text-violet-400" />
                  <span>{enrolledCount} Enrolled-only</span>
                </div>
              </div>
            </div>

            {/* CTA for non-students */}
            <div className="flex flex-col gap-3 shrink-0">
              <Link href="/login"
                className="inline-flex items-center justify-center gap-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-sm font-medium transition-colors">
                <BookOpen className="h-4 w-4" /> Student Login — Access All Notes
              </Link>
              <Link href="/courses"
                className="inline-flex items-center justify-center gap-2 rounded border border-white/30 text-white hover:bg-white/10 px-5 py-2.5 text-sm transition-colors">
                View Courses & Enroll
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tabs + Search ─────────────────────────────────────────────── */}
      <section className="sticky top-16 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center gap-4 py-2 overflow-x-auto scrollbar-hide">
            {/* Tab bar */}
            <div className="flex gap-0.5 shrink-0">
              {visibleTabs.map(tab => {
                const count = tabCount(tab);
                const active = activeTab === tab;
                return (
                  <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                    className={`shrink-0 px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
                      active
                        ? "border-red-600 text-red-600"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}>
                    {tab}
                    {count > 0 && (
                      <span className={`ml-1 text-[10px] rounded-full px-1.5 py-0.5 ${active ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {/* Search */}
            <div className="relative ml-auto shrink-0 hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search notes..."
                className="pl-8 pr-3 py-1.5 text-xs rounded border border-slate-200 focus:border-slate-400 outline-none w-44"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-10 min-h-[50vh]">
        <div className="mx-auto max-w-6xl px-6">

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse h-40 rounded-xl bg-slate-200" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <NotebookText className="h-12 w-12 text-slate-300" />
              <p className="font-medium text-slate-500">No notes found</p>
              {query && <button onClick={() => setQuery("")} className="text-sm text-red-600 hover:underline">Clear search</button>}
            </div>
          ) : activeTab === "All" && grouped ? (
            // Grouped by category in "All" tab
            <div className="space-y-10">
              {Object.entries(grouped).map(([cat, catNotes]) => (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-red-600 inline-block" />
                      {cat}
                      <span className="text-xs font-normal text-slate-400">({catNotes.length})</span>
                    </h2>
                    <button type="button" onClick={() => setActiveTab(cat as Tab)}
                      className="text-xs text-red-600 hover:underline flex items-center gap-1">
                      View all <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {catNotes.map(note => <NoteCard key={note.id} note={note} />)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Flat grid for specific category
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(note => <NoteCard key={note.id} note={note} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Enroll CTA ────────────────────────────────────────────────── */}
      <section className="bg-[#1F3354] py-10">
        <div className="mx-auto max-w-4xl px-6 text-center text-white">
          <Lock className="h-8 w-8 mx-auto mb-3 opacity-60" />
          <h2 className="text-xl font-semibold mb-2">Enrolled Students Get Full Access</h2>
          <p className="text-slate-300 text-sm mb-6 max-w-md mx-auto">
            Premium notes and course material are visible only to enrolled students. Login to your student dashboard to access them.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/login"
              className="inline-flex items-center gap-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 text-sm font-medium transition-colors">
              <BookOpen className="h-4 w-4" /> Student Login
            </Link>
            <Link href="/courses"
              className="inline-flex items-center gap-2 border border-white/30 text-white hover:bg-white/10 rounded px-6 py-2.5 text-sm transition-colors">
              Enroll in a Course <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

// ── Note Card ─────────────────────────────────────────────────────────────────
function NoteCard({ note }: { note: ENote }) {
  const isFree = note.accessType === "free";

  return (
    <div className={`flex flex-col rounded-xl border overflow-hidden bg-white hover:shadow-md transition-shadow ${isFree ? "border-slate-200" : "border-violet-100"}`}>
      {/* Cover image or top accent */}
      {note.imageUrl?.trim() ? (
        <div className="h-36 w-full overflow-hidden bg-slate-100">
          <img src={note.imageUrl} alt={note.title}
            className="w-full h-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = "none"; }}
          />
        </div>
      ) : (
        <div className={`h-1 ${isFree ? "bg-emerald-500" : "bg-violet-500"}`} />
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isFree ? "bg-emerald-50 text-emerald-600" : "bg-violet-50 text-violet-600"}`}>
            {isFree ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          </div>
          <span className={`text-[10px] font-semibold rounded-full px-2.5 py-0.5 ${isFree ? "bg-emerald-100 text-emerald-700" : "bg-violet-100 text-violet-700"}`}>
            {isFree ? "Free" : "Enrolled only"}
          </span>
        </div>

        <h3 className="text-sm font-semibold text-slate-800 leading-snug mb-1.5 line-clamp-2">{note.title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1">{note.description}</p>

        <div className="mt-4">
          {isFree && note.fileUrl ? (
            <a href={note.fileUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between w-full rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors">
              <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> View / Download</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          ) : isFree && note.content ? (
            <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded p-2.5 line-clamp-3">{note.content}</p>
          ) : !isFree ? (
            <Link href="/login"
              className="flex items-center justify-between w-full rounded border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-700 hover:bg-violet-600 hover:text-white transition-colors">
              <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Login to access</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
