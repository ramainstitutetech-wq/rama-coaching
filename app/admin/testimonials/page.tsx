"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Star, MessageSquareQuote } from "lucide-react";

import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { SearchInput, SelectInput } from "@/components/ui/SearchInput";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/Field";
import { EmptyState, Spinner } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Tabs";
import { boolStatusVariant } from "@/lib/status";

// testimonials loaded from API
import type { Testimonial } from "@/data/types";

type TestimonialDraft = Omit<Testimonial, "id">;

const emptyDraft: TestimonialDraft = {
  studentName: "",
  course: "",
  review: "",
  rating: 5,
  published: false,
  avatarColor: "#1F3354",
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function TestimonialsAdminPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [publishedFilter, setPublishedFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TestimonialDraft>(emptyDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/testimonials", { cache: "no-store" });
      const j = await res.json();
      if (j.success) setItems(j.data);
    } catch {}
    setLoading(false);
  };
  useEffect(() => { fetchList(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((t) => {
      const matchesQuery =
        !q ||
        t.studentName.toLowerCase().includes(q) ||
        t.review.toLowerCase().includes(q);
      const matchesStatus =
        publishedFilter === "all"
          ? true
          : publishedFilter === "published"
            ? t.published
            : !t.published;
      return matchesQuery && matchesStatus;
    });
  }, [items, query, publishedFilter]);

  function openAdd() {
    setEditingId(null);
    setDraft(emptyDraft);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(t: Testimonial) {
    setEditingId(t.id);
    setDraft({
      studentName: t.studentName,
      course: t.course,
      review: t.review,
      rating: t.rating,
      published: t.published,
      avatarColor: t.avatarColor,
    });
    setErrors({});
    setModalOpen(true);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!draft.studentName.trim()) e.studentName = "Student name is required";
    if (!draft.course.trim()) e.course = "Course is required";
    if (!draft.review.trim()) e.review = "Review is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function save() {
    if (!validate()) return;
    try {
      const url = editingId ? `/api/testimonials/${editingId}` : "/api/testimonials";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
      const j = await res.json();
      if (!j.success) { setErrors({ studentName: j.error || "Failed to save" }); alert(j.error || "Failed to save testimonial"); return; }
      await fetchList();
      setModalOpen(false);
    } catch { alert("Network error while saving testimonial"); }
  }

  async function togglePublish(id: string) {
    const target = items.find((t) => t.id === id);
    if (!target) return;
    try {
      const res = await fetch(`/api/testimonials/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: !target.published }) });
      const j = await res.json();
      if (!j.success) { alert(j.error || "Failed to update"); return; }
      await fetchList();
    } catch { alert("Network error while updating testimonial"); }
  }

  function askDelete(id: string) {
    setDeleteId(id);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/testimonials/${deleteId}`, { method: "DELETE" });
      const j = await res.json();
      if (!j.success) { alert(j.error || "Failed to delete"); return; }
      await fetchList();
    } catch { alert("Network error while deleting testimonial"); }
    setDeleteId(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Testimonials"
        subtitle="Manage student reviews and ratings"
        actions={
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep"
          >
            <Plus className="h-4 w-4" /> Add Testimonial
          </button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by student name or review..."
          />
        </div>
        <SelectInput
          value={publishedFilter}
          onChange={setPublishedFilter}
          options={[
            { value: "all", label: "All Status" },
            { value: "published", label: "Published" },
            { value: "unpublished", label: "Unpublished" },
          ]}
        />
      </div>

      {loading ? (
        <Spinner label="Loading testimonials..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={MessageSquareQuote}
          title="No testimonials found"
          description="Try a different search or add a new student review."
          action={
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep"
            >
              <Plus className="h-4 w-4" /> Add Testimonial
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <Avatar name={t.studentName} color={t.avatarColor} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {t.studentName}
                  </p>
                  <p className="text-xs text-slate-500">{t.course}</p>
                  <div className="mt-1">
                    <Stars rating={t.rating} />
                  </div>
                </div>
                <Badge variant={boolStatusVariant(t.published)}>
                  {t.published ? "Published" : "Draft"}
                </Badge>
              </div>

              <p className="mt-3 line-clamp-3 text-sm text-slate-600">
                “{t.review}”
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => togglePublish(t.id)}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  {t.published ? "Unpublish" : "Publish"}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(t)}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => askDelete(t.id)}
                  className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Testimonial" : "Add Testimonial"}
        size="md"
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
              className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep"
            >
              {editingId ? "Save Changes" : "Create Testimonial"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Student Name" required error={errors.studentName}>
            <TextInput
              value={draft.studentName}
              onChange={(e) =>
                setDraft({ ...draft, studentName: e.target.value })
              }
              placeholder="e.g. Rahul Kumar"
            />
          </Field>

          <Field label="Course" required error={errors.course}>
            <TextInput
              value={draft.course}
              onChange={(e) => setDraft({ ...draft, course: e.target.value })}
              placeholder="e.g. ADCA"
            />
          </Field>

          <Field label="Review" required error={errors.review}>
            <TextArea
              rows={4}
              value={draft.review}
              onChange={(e) => setDraft({ ...draft, review: e.target.value })}
              placeholder="What did the student say?"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Rating">
              <SelectField
                value={String(draft.rating)}
                onChange={(e) =>
                  setDraft({ ...draft, rating: Number(e.target.value) })
                }
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} Star{n > 1 ? "s" : ""}
                  </option>
                ))}
              </SelectField>
            </Field>
            <Field label="Published">
              <SelectField
                value={draft.published ? "yes" : "no"}
                onChange={(e) =>
                  setDraft({ ...draft, published: e.target.value === "yes" })
                }
              >
                <option value="yes">Published</option>
                <option value="no">Unpublished</option>
              </SelectField>
            </Field>
          </div>

          <Field label="Avatar Color">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={draft.avatarColor}
                onChange={(e) =>
                  setDraft({ ...draft, avatarColor: e.target.value })
                }
                className="h-10 w-16 cursor-pointer rounded-lg border border-slate-300"
              />
              <TextInput
                value={draft.avatarColor}
                onChange={(e) =>
                  setDraft({ ...draft, avatarColor: e.target.value })
                }
                placeholder="#1F3354"
              />
            </div>
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Testimonial"
        message="This action cannot be undone. Are you sure you want to delete this testimonial?"
        confirmText="Delete"
      />
    </div>
  );
}
