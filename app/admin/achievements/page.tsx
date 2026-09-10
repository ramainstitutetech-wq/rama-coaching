"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Trophy,
  Search,
  Users,
  BookOpen,
  GraduationCap,
  CalendarCheck,
  Building2,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Achievement } from "@/data/types";

const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  BookOpen,
  Trophy,
  GraduationCap,
  CalendarCheck,
  Building2,
  Star,
};
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput, SelectInput } from "@/components/ui/SearchInput";
import { Badge } from "@/components/ui/Badge";
import { EmptyState, Spinner } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/Field";
import { courseStatusVariant, titleCase } from "@/lib/status";

type FormState = {
  id: string;
  value: string;
  label: string;
  description: string;
  icon: string;
  status: "active" | "inactive";
};

const emptyForm: FormState = {
  id: "",
  value: "",
  label: "",
  description: "",
  icon: "Star",
  status: "active",
};

export default function AchievementsPage() {
  const [items, setItems] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Achievement | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<{ value?: string; label?: string }>({});
  const [deleteTarget, setDeleteTarget] = useState<Achievement | null>(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/achievements", { cache: "no-store" });
      const j = await res.json();
      if (j.success) setItems(j.data);
    } catch {}
    setLoading(false);
  };
  useEffect(() => { fetchList(); }, []);

  const filtered = useMemo(() => {
    return items.filter((a) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        a.label.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || a.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [items, query, statusFilter]);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(a: Achievement) {
    setEditing(a);
    setForm({
      id: a.id,
      value: a.value,
      label: a.label,
      description: a.description,
      icon: a.icon,
      status: a.status,
    });
    setErrors({});
    setModalOpen(true);
  }

  async function handleSave() {
    const nextErrors: { value?: string; label?: string } = {};
    if (!form.value.trim()) nextErrors.value = "Value is required";
    if (!form.label.trim()) nextErrors.label = "Label is required";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    const payload = {
      value: form.value.trim(),
      label: form.label.trim(),
      description: form.description.trim(),
      icon: form.icon.trim() || "Star",
      status: form.status,
    };
    try {
      const url = editing ? `/api/achievements/${editing.id}` : "/api/achievements";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const j = await res.json();
      if (!j.success) { alert(j.error || "Failed to save achievement"); return; }
      await fetchList();
      setModalOpen(false);
    } catch { alert("Network error while saving achievement"); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/achievements/${deleteTarget.id}`, { method: "DELETE" });
      const j = await res.json();
      if (!j.success) { alert(j.error || "Failed to delete"); return; }
      await fetchList();
    } catch { alert("Network error while deleting achievement"); }
    setDeleteTarget(null);
  }

  if (loading) return <Spinner label="Loading achievements..." />;

  return (
    <div>
      <PageHeader
        title="Achievements"
        subtitle="Manage the stats displayed across the site."
        actions={
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep"
          >
            <Plus className="h-4 w-4" /> Add Achievement
          </button>
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by label or description..."
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

      {filtered.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No achievements found"
          description="Try a different search or add a new achievement to get started."
          action={
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep"
            >
              <Plus className="h-4 w-4" /> Add Achievement
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => {
            const Icon = ICON_MAP[a.icon] ?? Star;
            return (
              <div
                key={a.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy/10 text-navy">
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge variant={courseStatusVariant[a.status]}>
                    {titleCase(a.status)}
                  </Badge>
                </div>
                <p className="mt-4 text-3xl font-bold text-slate-800">{a.value}</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{a.label}</p>
                <p className="mt-1 text-sm text-slate-500">{a.description}</p>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(a)}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(a)}
                    className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Achievement" : "Add Achievement"}
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
              onClick={handleSave}
              className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep"
            >
              {editing ? "Save Changes" : "Add Achievement"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Value" required error={errors.value}>
            <TextInput
              value={form.value}
              error={errors.value}
              onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              placeholder="e.g. 500+"
            />
          </Field>
          <Field label="Label" required error={errors.label}>
            <TextInput
              value={form.label}
              error={errors.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              placeholder="e.g. Students Trained"
            />
          </Field>
          <Field label="Description">
            <TextArea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Short description"
              rows={3}
            />
          </Field>
          <Field label="Icon">
            <TextInput
              value={form.icon}
              onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
              placeholder="lucide icon name, e.g. Users"
            />
          </Field>
          <Field label="Status">
            <SelectField
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  status: e.target.value as "active" | "inactive",
                }))
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </SelectField>
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Achievement"
        message={`Are you sure you want to delete "${deleteTarget?.label}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
