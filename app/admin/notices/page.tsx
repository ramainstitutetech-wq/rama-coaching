"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Eye, Megaphone, Upload, Download } from "lucide-react";
import type { Notice } from "@/data/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput, SelectInput } from "@/components/ui/SearchInput";
import { Badge } from "@/components/ui/Badge";
import { EmptyState, Spinner } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/Field";
import { noticePriorityVariant, boolStatusVariant, titleCase } from "@/lib/status";

type FormState = {
  id: string;
  title: string;
  description: string;
  date: string;
  priority: "low" | "normal" | "high";
  published: boolean;
};

const todayStr = () => new Date().toISOString().slice(0, 10);

const emptyForm: FormState = {
  id: "",
  title: "",
  description: "",
  date: todayStr(),
  priority: "normal",
  published: true,
};

export default function NoticesPage() {
  const [items, setItems] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [pubFilter, setPubFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Notice | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [deleteTarget, setDeleteTarget] = useState<Notice | null>(null);
  const [viewTarget, setViewTarget] = useState<Notice | null>(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notices", { cache: "no-store" });
      const j = await res.json();
      if (j.success) setItems(j.data);
    } catch {}
    setLoading(false);
  };
  useEffect(() => { fetchList(); }, []);

  const filtered = useMemo(() => {
    return items.filter((n) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q);
      const matchesPub =
        pubFilter === "all" ||
        (pubFilter === "published" && n.published) ||
        (pubFilter === "unpublished" && !n.published);
      const matchesPriority =
        priorityFilter === "all" || n.priority === priorityFilter;
      return matchesQuery && matchesPub && matchesPriority;
    });
  }, [items, query, pubFilter, priorityFilter]);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(n: Notice) {
    setEditing(n);
    setForm({
      id: n.id,
      title: n.title,
      description: n.description,
      date: n.date,
      priority: n.priority,
      published: n.published,
    });
    setErrors({});
    setModalOpen(true);
  }

  async function handleSave() {
    const nextErrors: { title?: string; description?: string } = {};
    if (!form.title.trim()) nextErrors.title = "Title is required";
    if (!form.description.trim()) nextErrors.description = "Description is required";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      date: form.date,
      priority: form.priority,
      published: form.published,
    };
    try {
      const url = editing ? `/api/notices/${editing.id}` : "/api/notices";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const j = await res.json();
      if (!j.success) { alert(j.error || "Failed to save notice"); return; }
      await fetchList();
      setModalOpen(false);
    } catch { alert("Network error while saving notice"); }
  }

  async function togglePublish(n: Notice) {
    try {
      const res = await fetch(`/api/notices/${n.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: !n.published }) });
      const j = await res.json();
      if (!j.success) { alert(j.error || "Failed to update"); return; }
      await fetchList();
    } catch { alert("Network error while updating notice"); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/notices/${deleteTarget.id}`, { method: "DELETE" });
      const j = await res.json();
      if (!j.success) { alert(j.error || "Failed to delete"); return; }
      await fetchList();
    } catch { alert("Network error while deleting notice"); }
    setDeleteTarget(null);
  }

  if (loading) return <Spinner label="Loading notices..." />;

  return (
    <div>
      <PageHeader
        title="Notices"
        subtitle="Publish and manage institute announcements."
        actions={
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep"
          >
            <Plus className="h-4 w-4" /> Add Notice
          </button>
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by title or description..."
          />
        </div>
        <SelectInput
          value={pubFilter}
          onChange={setPubFilter}
          options={[
            { value: "all", label: "All Notices" },
            { value: "published", label: "Published" },
            { value: "unpublished", label: "Unpublished" },
          ]}
        />
        <SelectInput
          value={priorityFilter}
          onChange={setPriorityFilter}
          options={[
            { value: "all", label: "All Priority" },
            { value: "low", label: "Low" },
            { value: "normal", label: "Normal" },
            { value: "high", label: "High" },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No notices found"
          description="Try adjusting your filters or add a new notice."
          action={
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep"
            >
              <Plus className="h-4 w-4" /> Add Notice
            </button>
          }
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((n) => (
                <tr key={n.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{n.title}</p>
                    <p className="line-clamp-1 text-xs text-slate-500">{n.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={noticePriorityVariant[n.priority]}>
                      {titleCase(n.priority)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={boolStatusVariant(n.published)}>
                      {n.published ? "Published" : "Unpublished"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{n.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setViewTarget(n)}
                        className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(n)}
                        className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePublish(n)}
                        className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
                        title={n.published ? "Unpublish" : "Publish"}
                      >
                        {n.published ? (
                          <Download className="h-4 w-4" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(n)}
                        className="rounded-md p-2 text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Notice" : "Add Notice"}
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
              onClick={handleSave}
              className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep"
            >
              {editing ? "Save Changes" : "Add Notice"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Title" required error={errors.title}>
            <TextInput
              value={form.title}
              error={errors.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. New Batch Starting"
            />
          </Field>
          <Field label="Description" required error={errors.description}>
            <TextArea
              value={form.description}
              error={errors.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Notice details"
              rows={4}
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Date">
              <TextInput
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </Field>
            <Field label="Priority">
              <SelectField
                value={form.priority}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    priority: e.target.value as "low" | "normal" | "high",
                  }))
                }
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </SelectField>
            </Field>
          </div>
          <Field label="Published">
            <SelectField
              value={form.published ? "yes" : "no"}
              onChange={(e) =>
                setForm((f) => ({ ...f, published: e.target.value === "yes" }))
              }
            >
              <option value="yes">Published</option>
              <option value="no">Unpublished</option>
            </SelectField>
          </Field>
        </div>
      </Modal>

      <Modal
        open={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title="Notice Details"
        size="lg"
      >
        {viewTarget ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={noticePriorityVariant[viewTarget.priority]}>
                {titleCase(viewTarget.priority)}
              </Badge>
              <Badge variant={boolStatusVariant(viewTarget.published)}>
                {viewTarget.published ? "Published" : "Unpublished"}
              </Badge>
              <span className="text-xs text-slate-500">{viewTarget.date}</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800">
              {viewTarget.title}
            </h3>
            <p className="text-sm text-slate-600">{viewTarget.description}</p>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Notice"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
