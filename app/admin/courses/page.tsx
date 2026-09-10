"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  BookOpen,
  Clock,
  IndianRupee,
  Tag,
  Layers,
  Play,
  FileText,
  Image as ImageIcon,
  Presentation,
  Type,
} from "lucide-react";

import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { SearchInput, SelectInput } from "@/components/ui/SearchInput";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/Field";
import { EmptyState, Spinner } from "@/components/ui/EmptyState";
import { courseStatusVariant } from "@/lib/status";
import { ImageUploadField } from "@/components/ui/ImageUploadField";

// courses loaded from API
import type { Course } from "@/data/types";

type CourseDraft = Omit<Course, "id"> & { durationValue?: number | null; durationUnit?: "week"|"month"|"year"; accessValue?: number; accessUnit?: "week"|"month"|"year" };

const emptyDraft: CourseDraft = {
  name: "",
  description: "",
  duration: "",
  fees: "",
  category: "",
  accent: "#1F3354",
  imageUrl: "",
  status: "active",
  durationValue: null as any,
  durationUnit: "month" as any,
  accessValue: 0 as any,
  accessUnit: "month" as any,
};

export default function CoursesAdminPage() {
  const [items, setItems] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CourseDraft>(emptyDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [viewItem, setViewItem] = useState<Course | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ── Lessons (per course) ────────────────────────────────────────────
  const [lessonsOpen, setLessonsOpen] = useState(false);
  const [lessonsCourse, setLessonsCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [lessonDraft, setLessonDraft] = useState({ title: "", type: "video_youtube" as any, fileUrl: "", content: "", duration: "", status: "published" as any });
  const [lessonEditingId, setLessonEditingId] = useState<string | null>(null);
  const [lessonSaving, setLessonSaving] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("search", query);
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch("/api/courses?" + params.toString(), { cache: "no-store" });
      const j = await res.json();
      if (j.success) setItems(j.data);
    } catch {}
    setLoading(false);
  };
  useEffect(() => { fetchList(); }, []);
  useEffect(() => { fetchList(); }, [query, statusFilter]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((c) => {
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || c.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [items, query, statusFilter]);

  function openAdd() {
    setEditingId(null);
    setDraft(emptyDraft);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(c: any) {
    setEditingId(c.id);
    setDraft({
      name: c.name,
      description: c.description,
      duration: c.duration,
      fees: c.fees,
      category: c.category,
      accent: c.accent,
      imageUrl: c.imageUrl ?? "",
      status: c.status,
      durationValue: c.durationValue ?? null,
      durationUnit: c.durationUnit || "month",
      accessValue: c.accessValue ?? 0,
      accessUnit: c.accessUnit || "month",
    } as any);
    setErrors({});
    setModalOpen(true);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!draft.name.trim()) e.name = "Name is required";
    if (!draft.description.trim()) e.description = "Description is required";
    // Duration can be via value+unit or old text
    if ((draft as any).durationValue == null && !draft.duration.trim()) e.duration = "Duration is required";
    if (!draft.fees.trim()) e.fees = "Fees is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function save() {
    if (!validate()) return;
    setSaving(true);
    try {
      const url = editingId ? `/api/courses/${editingId}` : "/api/courses";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
      const j = await res.json();
      if (!j.success) { setErrors({ name: j.error || "Failed" }); return; }
      await fetchList();
      setModalOpen(false);
    } catch { setErrors({ name: "Network error" }); }
    finally { setSaving(false); }
  }

  function askDelete(id: string) {
    setDeleteId(id);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try { const r = await fetch(`/api/courses/${deleteId}`, { method: "DELETE" }); const j = await r.json(); if (j.success) await fetchList(); } catch {}
    setDeleteId(null);
  }

  // ── Lessons helpers ─────────────────────────────────────────────────
  async function openLessons(c: Course) {
    setLessonsCourse(c);
    setLessonsOpen(true);
    setLessonsLoading(true);
    try {
      const res = await fetch(`/api/courses/${c.id}/lessons?admin=1`, { cache: "no-store" }).then(r=>r.json());
      if (res.success) setLessons(res.data);
      else setLessons([]);
    } catch { setLessons([]); }
    setLessonsLoading(false);
  }

  async function saveLesson() {
    if (!lessonsCourse || !lessonDraft.title.trim()) return;
    setLessonSaving(true);
    try {
      const url = lessonEditingId ? `/api/lessons/${lessonEditingId}` : `/api/courses/${lessonsCourse.id}/lessons`;
      const method = lessonEditingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(lessonDraft) }).then(r=>r.json());
      if (!res.success) { alert(res.error || "Failed"); setLessonSaving(false); return; }
      setLessonDraft({ title: "", type: "video_youtube", fileUrl: "", content: "", duration: "", status: "published" });
      setLessonEditingId(null);
      // reload
      const r2 = await fetch(`/api/courses/${lessonsCourse.id}/lessons?admin=1`, { cache: "no-store" }).then(r=>r.json());
      if (r2.success) setLessons(r2.data);
    } catch {}
    setLessonSaving(false);
  }

  async function deleteLesson(id: string) {
    if (!confirm("Delete this lesson?")) return;
    await fetch(`/api/lessons/${id}`, { method: "DELETE" });
    if (lessonsCourse) {
      const r2 = await fetch(`/api/courses/${lessonsCourse.id}/lessons?admin=1`, { cache: "no-store" }).then(r=>r.json());
      if (r2.success) setLessons(r2.data);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        subtitle="Manage course catalog, fees and availability"
        actions={
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep"
          >
            <Plus className="h-4 w-4" /> Add Course
          </button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by name, description or category..."
          />
        </div>
        <SelectInput
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "All Status" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
        />
      </div>

      {loading ? (
        <Spinner label="Loading courses..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses found"
          description="Try a different search or add a new course to get started."
          action={
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep"
            >
              <Plus className="h-4 w-4" /> Add Course
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div
                style={{ backgroundColor: c.accent }}
                className="h-2"
              />
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-800">
                    {c.name}
                  </h3>
                  <Badge variant={courseStatusVariant[c.status]}>
                    {c.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="info">
                    <Tag className="h-3 w-3" /> {c.category}
                  </Badge>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-4 w-4 text-slate-400" /> {c.duration}
                  </span>
                  <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                    <IndianRupee className="h-4 w-4 text-slate-400" /> {c.fees}
                  </span>
                  {(c as any).accessDays != null && (
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${(c as any).accessDays === 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                      <Clock className="h-3 w-3" /> {(c as any).accessDays === 0 ? "Lifetime" : `Expires: ${(c as any).accessValue} ${(c as any).accessUnit}`}
                    </span>
                  )}
                </div>

                <p className="mt-3 line-clamp-2 text-sm text-slate-500">
                  {c.description}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openLessons(c)}
                    className="inline-flex items-center gap-1 rounded-md bg-[#1F3354] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#162640]"
                  >
                    <Layers className="h-3.5 w-3.5" /> Content
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewItem(c)}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <Eye className="h-3.5 w-3.5" /> View
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(c)}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => askDelete(c.id)}
                    className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Course" : "Add Course"}
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? (
                <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />Saving…</>
              ) : (
                editingId ? "Save Changes" : "Create Course"
              )}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Course Name" required error={errors.name}>
            <TextInput
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="e.g. ADCA — Advanced Diploma"
            />
          </Field>

          <Field label="Description" required error={errors.description}>
            <TextArea
              rows={3}
              value={draft.description}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
              placeholder="Short overview of the course"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Duration (Value)" required error={errors.duration}>
              <TextInput type="number" min={1} value={(draft as any).durationValue ?? ""} onChange={(e) => setDraft({ ...draft, durationValue: e.target.value ? Number(e.target.value) : null } as any)} placeholder="e.g. 6" />
            </Field>
            <Field label="Unit">
              <SelectField value={(draft as any).durationUnit || "month"} onChange={(e) => setDraft({ ...draft, durationUnit: e.target.value as any } as any)}>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </SelectField>
            </Field>
            <Field label="Fees" required error={errors.fees}>
              <TextInput value={draft.fees} onChange={(e) => setDraft({ ...draft, fees: e.target.value })} placeholder="e.g. ₹9,500" />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Expires In (for Student)">
              <TextInput type="number" min={0} value={(draft as any).accessValue ?? 0} onChange={(e) => setDraft({ ...draft, accessValue: Number(e.target.value) } as any)} placeholder="0 = Lifetime" />
            </Field>
            <Field label="Expires Unit">
              <SelectField value={(draft as any).accessUnit || "month"} onChange={(e) => setDraft({ ...draft, accessUnit: e.target.value as any } as any)}>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </SelectField>
            </Field>
            <div className="flex items-end pb-1">
              <p className="text-[11px] text-slate-500 leading-tight">0 = Lifetime. Student enroll ke baad auto expire: {(draft as any).accessValue ? `${(draft as any).accessValue} ${(draft as any).accessUnit}` : "Never"}.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Category">
              <TextInput
                value={draft.category}
                onChange={(e) =>
                  setDraft({ ...draft, category: e.target.value })
                }
                placeholder="e.g. Diploma"
              />
            </Field>
            <Field label="Status">
              <SelectField
                value={draft.status}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    status: e.target.value as CourseDraft["status"],
                  })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </SelectField>
            </Field>
          </div>

          <ImageUploadField
            label="Course Image"
            value={(draft as any).imageUrl ?? ""}
            onChange={(url) => setDraft({ ...draft, imageUrl: url } as any)}
          />

          <Field label="Accent Color">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={draft.accent}
                onChange={(e) =>
                  setDraft({ ...draft, accent: e.target.value })
                }
                className="h-10 w-16 cursor-pointer rounded-lg border border-slate-300"
              />
              <TextInput
                value={draft.accent}
                onChange={(e) =>
                  setDraft({ ...draft, accent: e.target.value })
                }
                placeholder="#1F3354"
              />
            </div>
          </Field>
        </div>
      </Modal>

      <Modal
        open={viewItem !== null}
        onClose={() => setViewItem(null)}
        title="Course Details"
        size="lg"
        footer={
          <button
            type="button"
            onClick={() => setViewItem(null)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        }
      >
        {viewItem ? (
          <div className="space-y-4">
            <div
              style={{ backgroundColor: viewItem.accent }}
              className="h-2 rounded-full"
            />
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">
                {viewItem.name}
              </h3>
              <Badge variant={courseStatusVariant[viewItem.status]}>
                {viewItem.status === "active" ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="info">{viewItem.category}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4 text-sm">
              <div>
                <p className="text-xs uppercase text-slate-400">Duration</p>
                <p className="font-medium text-slate-700">
                  {viewItem.duration}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Fees</p>
                <p className="font-medium text-slate-700">{viewItem.fees}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">{viewItem.description}</p>
          </div>
        ) : null}
      </Modal>

      {/* ── Lessons Manager ─────────────────────────────────────────── */}
      <Modal open={lessonsOpen} onClose={() => setLessonsOpen(false)} title={lessonsCourse ? `Content — ${lessonsCourse.name}` : "Course Content"} size="xl"
        footer={<button type="button" onClick={() => setLessonsOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">Close</button>}>
        {lessonsCourse && (
          <div className="space-y-5">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 flex items-center gap-3">
              <span className="h-8 w-8 rounded-lg bg-[#1F3354] text-white flex items-center justify-center"><Layers className="h-4 w-4" /></span>
              <div>
                <p className="text-sm font-semibold text-slate-800">{lessonsCourse.name}</p>
                <p className="text-xs text-slate-500">Add video (YouTube/Drive), PDF, PPT, Text, Image — YouTube/Drive link free, PDF/PPT upload 20MB</p>
              </div>
            </div>

            {/* Add / Edit lesson */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <p className="text-sm font-semibold text-slate-800">{lessonEditingId ? "Edit Lesson" : "Add Lesson"} {lessonEditingId && <button onClick={()=>{setLessonEditingId(null); setLessonDraft({title:"", type:"video_youtube", fileUrl:"", content:"", duration:"", status:"published"});}} className="ml-2 text-xs text-slate-500 underline">Cancel</button>}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Title" required>
                  <TextInput value={lessonDraft.title} onChange={e=>setLessonDraft({...lessonDraft, title:e.target.value})} placeholder="e.g. Chapter 1 — Intro" />
                </Field>
                <Field label="Type">
                  <SelectField value={lessonDraft.type} onChange={e=>setLessonDraft({...lessonDraft, type:e.target.value as any})}>
                    <option value="video_youtube">Video — YouTube link</option>
                    <option value="video_drive">Video — Google Drive link</option>
                    <option value="pdf">PDF</option>
                    <option value="ppt">PPT / PPTX</option>
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                  </SelectField>
                </Field>
              </div>

              {lessonDraft.type === "video_youtube" && (
                <Field label="YouTube URL" required>
                  <TextInput value={lessonDraft.fileUrl} onChange={e=>setLessonDraft({...lessonDraft, fileUrl:e.target.value})} placeholder="https://www.youtube.com/watch?v=..." />
                  <p className="text-[11px] text-slate-400 mt-1">Unlisted link paste karo — free unlimited, embed ho jayega.</p>
                </Field>
              )}
              {lessonDraft.type === "video_drive" && (
                <Field label="Google Drive Share Link" required>
                  <TextInput value={lessonDraft.fileUrl} onChange={e=>setLessonDraft({...lessonDraft, fileUrl:e.target.value})} placeholder="https://drive.google.com/file/d/.../view" />
                  <p className="text-[11px] text-slate-400 mt-1">Share → Anyone with link → paste.</p>
                </Field>
              )}
              {(lessonDraft.type === "pdf" || lessonDraft.type === "ppt" || lessonDraft.type === "image") && (
                <Field label={lessonDraft.type === "pdf" ? "PDF File / URL" : lessonDraft.type === "ppt" ? "PPT File / URL" : "Image File / URL"}>
                  <div className="flex gap-2">
                    <TextInput value={lessonDraft.fileUrl} onChange={e=>setLessonDraft({...lessonDraft, fileUrl:e.target.value})} placeholder="Paste URL or upload" className="flex-1" />
                    <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium cursor-pointer hover:bg-slate-50">
                      <input type="file" accept={lessonDraft.type==="pdf" ? ".pdf" : lessonDraft.type==="ppt" ? ".ppt,.pptx" : "image/*"} className="hidden" onChange={async(e)=>{
                        const f=(e.target as HTMLInputElement).files?.[0]; if(!f) return;
                        const fd=new FormData(); fd.append("file", f);
                        const r=await fetch("/api/upload",{method:"POST", body:fd}).then(r=>r.json());
                        if(r.success) setLessonDraft({...lessonDraft, fileUrl: r.data.url});
                        else alert(r.error);
                      }} /> Upload
                    </label>
                  </div>
                </Field>
              )}
              {lessonDraft.type === "text" && (
                <Field label="Text Content" required>
                  <TextArea rows={4} value={lessonDraft.content} onChange={e=>setLessonDraft({...lessonDraft, content:e.target.value})} placeholder="Lesson text / HTML" />
                </Field>
              )}
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Duration"><TextInput value={lessonDraft.duration} onChange={e=>setLessonDraft({...lessonDraft, duration:e.target.value})} placeholder="e.g. 12 min" /></Field>
                <Field label="Status"><SelectField value={lessonDraft.status} onChange={e=>setLessonDraft({...lessonDraft, status:e.target.value as any})}><option value="published">Published</option><option value="draft">Draft</option></SelectField></Field>
              </div>
              <button type="button" onClick={saveLesson} disabled={lessonSaving || !lessonDraft.title.trim()} className="inline-flex items-center gap-2 rounded-lg bg-[#1F3354] px-4 py-2 text-sm font-semibold text-white hover:bg-[#162640] disabled:opacity-50">
                {lessonSaving ? "Saving…" : lessonEditingId ? "Update Lesson" : "Add Lesson"}
              </button>
            </div>

            {/* Lessons list */}
            {lessonsLoading ? <p className="text-sm text-slate-500">Loading…</p> : lessons.length===0 ? <p className="text-sm text-slate-500 text-center py-6">No lessons yet. Add first lesson above.</p> : (
              <div className="space-y-2">
                {lessons.map((l:any, idx:number)=> {
                  const icons:any = {video_youtube: Play, video_drive: Play, pdf: FileText, ppt: Presentation, text: Type, image: ImageIcon};
                  const Icon = icons[l.type] || FileText;
                  return (
                    <div key={l.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                      <span className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center"><Icon className="h-3.5 w-3.5 text-slate-600" /></span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{idx+1}. {l.title}</p>
                        <p className="text-xs text-slate-500 truncate">{l.type} {l.duration ? `• ${l.duration}` : ""} {l.status==="draft" ? "• Draft" : ""}</p>
                      </div>
                      <button onClick={()=>{setLessonDraft({title:l.title, type:l.type, fileUrl:l.fileUrl||"", content:l.content||"", duration:l.duration||"", status:l.status}); setLessonEditingId(l.id);}} className="p-1.5 rounded border hover:bg-slate-50"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={()=>deleteLesson(l.id)} className="p-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Course"
        message="This action cannot be undone. Are you sure you want to delete this course?"
        confirmText="Delete"
      />
    </div>
  );
}
