"use client";
import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, FileText, Link as LinkIcon, Lock, Globe, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { SearchInput, SelectInput } from "@/components/ui/SearchInput";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/Field";
import { EmptyState, Spinner } from "@/components/ui/EmptyState";
import { ImageUploadField } from "@/components/ui/ImageUploadField";

const CATEGORIES = ["All", "General", "O-Level", "CCC", "CCC+", "ADCA", "DCA", "Tally", "Digital Marketing", "RSCIT", "Other"];

interface ENote {
  id: string; title: string; description: string;
  courseCategory: string; accessType: string;
  imageUrl: string; fileUrl: string; content: string; order: number; status: string;
}

const emptyDraft = {
  title: "", description: "", courseCategory: "General", accessType: "enrolled",
  imageUrl: "", fileUrl: "", content: "", order: 0, status: "active",
};

export default function ENotesAdminPage() {
  const [items, setItems]         = useState<ENote[]>([]);
  const [loading, setLoading]     = useState(true);
  const [query, setQuery]         = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [accFilter, setAccFilter] = useState("all");

  const [modalOpen, setModalOpen]   = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [draft, setDraft]           = useState<typeof emptyDraft>(emptyDraft);
  const [errors, setErrors]         = useState<Record<string, string>>({});

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId]       = useState<string | null>(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (catFilter !== "all") p.set("category", catFilter);
      if (accFilter !== "all") p.set("access", accFilter);
      const j = await fetch("/api/enotes?" + p.toString(), { cache: "no-store" }).then(r => r.json());
      if (j.success) setItems(j.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchList(); }, [catFilter, accFilter]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(n =>
      !q || n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q)
    );
  }, [items, query]);

  function openAdd() { setEditingId(null); setDraft(emptyDraft); setErrors({}); setModalOpen(true); }
  function openEdit(n: ENote) {
    setEditingId(n.id);
    setDraft({ title: n.title, description: n.description, courseCategory: n.courseCategory,
      accessType: n.accessType, imageUrl: n.imageUrl ?? "", fileUrl: n.fileUrl, content: n.content,
      order: n.order, status: n.status });
    setErrors({}); setModalOpen(true);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!draft.title.trim()) e.title = "Title is required";
    if (!draft.description.trim()) e.description = "Description is required";
    if (!draft.courseCategory) e.courseCategory = "Category is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function save() {
    if (!validate()) return;
    try {
      const url = editingId ? `/api/enotes/${editingId}` : "/api/enotes";
      const j = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      }).then(r => r.json());
      if (!j.success) { setErrors({ title: j.error || "Failed" }); return; }
      await fetchList(); setModalOpen(false);
    } catch { setErrors({ title: "Network error" }); }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try { await fetch(`/api/enotes/${deleteId}`, { method: "DELETE" }); await fetchList(); } catch {}
    setDeleteId(null);
  }

  const accessVariant = (t: string) => t === "free" ? "success" : "info";

  return (
    <>
      <PageHeader title="E-Notes" subtitle="Manage study notes and resources by course category"
        actions={
          <button type="button" onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep">
            <Plus className="h-4 w-4" /> Add E-Note
          </button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1"><SearchInput value={query} onChange={setQuery} placeholder="Search notes..." /></div>
        <SelectInput value={catFilter} onChange={setCatFilter}
          options={CATEGORIES.map(c => ({ value: c === "All" ? "all" : c, label: c }))} />
        <SelectInput value={accFilter} onChange={setAccFilter}
          options={[{ value: "all", label: "All Access" }, { value: "free", label: "Free" }, { value: "enrolled", label: "Enrolled Only" }]} />
      </div>

      {loading ? <Spinner label="Loading E-Notes..." /> : filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No E-Notes found" description="Add study notes and resources for each course category."
          action={<button type="button" onClick={openAdd} className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep"><Plus className="h-4 w-4" /> Add E-Note</button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(n => (
            <div key={n.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="h-1 bg-gradient-to-r from-navy to-navy-deep" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">{n.title}</h3>
                  <Badge variant={n.status === "active" ? "success" : "neutral"}>{n.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="brand">{n.courseCategory}</Badge>
                  <Badge variant={accessVariant(n.accessType)}>
                    {n.accessType === "free" ? <Globe className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                    {n.accessType === "free" ? "Free" : "Enrolled only"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{n.description}</p>
                {n.fileUrl && (
                  <a href={n.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-navy hover:underline mb-3">
                    <LinkIcon className="h-3 w-3" /> View Resource
                  </a>
                )}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => openEdit(n)}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button type="button" onClick={() => { setDeleteId(n.id); setConfirmOpen(true); }}
                    className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                  <span className="ml-auto text-xs text-slate-400">Order: {n.order}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editingId ? "Edit E-Note" : "Add E-Note"} size="lg"
        footer={
          <>
            <button type="button" onClick={() => setModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="button" onClick={save}
              className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep">
              {editingId ? "Save Changes" : "Create E-Note"}
            </button>
          </>
        }>
        <div className="space-y-4">
          <Field label="Title" required error={errors.title}>
            <TextInput value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. O-Level M1 Theory Notes" />
          </Field>
          <Field label="Description" required error={errors.description}>
            <TextArea rows={2} value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} placeholder="Short description of this resource..." />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Course Category" required error={errors.courseCategory}>
              <SelectField value={draft.courseCategory} onChange={e => setDraft({ ...draft, courseCategory: e.target.value })}>
                {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
              </SelectField>
            </Field>
            <Field label="Access Type">
              <SelectField value={draft.accessType} onChange={e => setDraft({ ...draft, accessType: e.target.value })}>
                <option value="free">Free — visible to all</option>
                <option value="enrolled">Enrolled students only</option>
              </SelectField>
            </Field>
          </div>
          <ImageUploadField
            label="Cover Image"
            value={draft.imageUrl ?? ""}
            onChange={(url) => setDraft({ ...draft, imageUrl: url })}
          />
          <Field label="Resource URL (PDF / Google Drive / etc.)">
            <TextInput value={draft.fileUrl} onChange={e => setDraft({ ...draft, fileUrl: e.target.value })} placeholder="https://drive.google.com/..." />
          </Field>
          <Field label="Inline Content (optional — shown directly on page)">
            <TextArea rows={4} value={draft.content} onChange={e => setDraft({ ...draft, content: e.target.value })} placeholder="Paste notes content here..." />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Display Order">
              <TextInput type="number" min={0} value={draft.order} onChange={e => setDraft({ ...draft, order: Number(e.target.value) })} />
            </Field>
            <Field label="Status">
              <SelectField value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </SelectField>
            </Field>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmDelete}
        title="Delete E-Note" confirmText="Delete" message="This will permanently delete this note. This action cannot be undone." />
    </>
  );
}
