"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus, Pencil, Trash2, Megaphone, ExternalLink,
  Image as ImageIcon, Upload, CheckCircle2, AlertCircle, Globe,
} from "lucide-react";

import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { SearchInput, SelectInput } from "@/components/ui/SearchInput";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field, TextInput, TextArea } from "@/components/ui/Field";
import { EmptyState, Spinner } from "@/components/ui/EmptyState";
import { boolStatusVariant } from "@/lib/status";
import type { Banner } from "@/data/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type BannerDraft = Omit<Banner, "id">;

const emptyDraft: BannerDraft = {
  heading: "",
  description: "",
  buttonText: "",
  buttonLink: "",
  active: true,
  accent: "#1F3354",
};

interface PageImg {
  id: string;
  pageKey: string;
  imageKey: string;
  label: string;
  imageUrl: string;
  updatedAt: string;
}

// Page label map
const PAGE_LABELS: Record<string, string> = {
  home: "🏠 Home",
  about: "ℹ️ About",
  courses: "📚 Courses",
  contact: "📞 Contact",
  franchise: "🤝 Franchise",
  verification: "✅ Verification",
  login: "🔐 Login",
  mocktest: "📝 Mock Test",
};

type Tab = "banners" | "pageImages";

// ═══════════════════════════════════════════════════════════════════════════════
export default function BannersAdminPage() {
  const [tab, setTab] = useState<Tab>("banners");

  return (
    <div className="space-y-6">
      {/* Tab switcher */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("banners")}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${tab === "banners" ? "bg-navy text-white border-navy" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
        >
          <Megaphone className="h-4 w-4" /> Banner Slides
        </button>
        <button
          type="button"
          onClick={() => setTab("pageImages")}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${tab === "pageImages" ? "bg-navy text-white border-navy" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
        >
          <Globe className="h-4 w-4" /> Page Images
        </button>
      </div>

      {tab === "banners" ? <BannersTab /> : <PageImagesTab />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1 — Banner Slides (existing logic, unchanged)
// ═══════════════════════════════════════════════════════════════════════════════

function BannersTab() {
  const [items, setItems] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<BannerDraft>(emptyDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/banners", { cache: "no-store" });
      const j = await res.json();
      if (j.success) setItems(j.data);
    } catch {}
    setLoading(false);
  };
  useEffect(() => { fetchList(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((b) => {
      const matchesQuery = !q || b.heading.toLowerCase().includes(q) || b.description.toLowerCase().includes(q);
      const matchesStatus = activeFilter === "all" ? true : activeFilter === "active" ? b.active : !b.active;
      return matchesQuery && matchesStatus;
    });
  }, [items, query, activeFilter]);

  function openAdd() { setEditingId(null); setDraft(emptyDraft); setErrors({}); setModalOpen(true); }
  function openEdit(b: Banner) {
    setEditingId(b.id);
    setDraft({ heading: b.heading, description: b.description, buttonText: b.buttonText, buttonLink: b.buttonLink, active: b.active, accent: b.accent });
    setErrors({});
    setModalOpen(true);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!draft.heading.trim()) e.heading = "Heading is required";
    if (!draft.description.trim()) e.description = "Description is required";
    if (!draft.buttonText.trim()) e.buttonText = "Button text is required";
    if (!draft.buttonLink.trim()) e.buttonLink = "Button link is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function save() {
    if (!validate()) return;
    try {
      const url = editingId ? `/api/banners/${editingId}` : "/api/banners";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
      const j = await res.json();
      if (!j.success) { setErrors({ heading: j.error || "Failed to save" }); return; }
      await fetchList();
      setModalOpen(false);
    } catch { alert("Network error"); }
  }

  async function toggleActive(id: string) {
    const target = items.find((b) => b.id === id);
    if (!target) return;
    await fetch(`/api/banners/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !target.active }) });
    await fetchList();
  }

  async function confirmDelete() {
    if (!deleteId) return;
    await fetch(`/api/banners/${deleteId}`, { method: "DELETE" });
    await fetchList();
    setDeleteId(null);
  }

  return (
    <>
      <PageHeader
        title="Banner Slides"
        subtitle="Manage hero banners and call-to-action sections"
        actions={
          <button type="button" onClick={openAdd} className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep">
            <Plus className="h-4 w-4" /> Add Banner
          </button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1"><SearchInput value={query} onChange={setQuery} placeholder="Search by heading or description..." /></div>
        <SelectInput value={activeFilter} onChange={setActiveFilter} options={[{ value: "all", label: "All Status" }, { value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]} />
      </div>

      {loading ? <Spinner label="Loading banners..." /> : filtered.length === 0 ? (
        <EmptyState icon={Megaphone} title="No banners found" description="Try a different search or create a new banner."
          action={<button type="button" onClick={openAdd} className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep"><Plus className="h-4 w-4" /> Add Banner</button>} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => (
            <div key={b.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div style={{ backgroundColor: b.accent }} className="h-2" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-800">{b.heading}</h3>
                  <Badge variant={boolStatusVariant(b.active)}>{b.active ? "Active" : "Inactive"}</Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-500">{b.description}</p>
                <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span className="inline-flex items-center gap-1 font-medium text-navy"><ExternalLink className="h-3.5 w-3.5" /> {b.buttonText}</span>
                  <p className="mt-0.5 truncate text-xs text-slate-400">{b.buttonLink}</p>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => toggleActive(b.id)} className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">{b.active ? "Deactivate" : "Activate"}</button>
                  <button type="button" onClick={() => openEdit(b)} className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"><Pencil className="h-3.5 w-3.5" /> Edit</button>
                  <button type="button" onClick={() => { setDeleteId(b.id); setConfirmOpen(true); }} className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Banner" : "Add Banner"} size="lg"
        footer={
          <>
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="button" onClick={save} className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep">{editingId ? "Save Changes" : "Create Banner"}</button>
          </>
        }>
        <div className="space-y-4">
          <Field label="Heading" required error={errors.heading}><TextInput value={draft.heading} onChange={(e) => setDraft({ ...draft, heading: e.target.value })} placeholder="e.g. Build Your Career in Computers" /></Field>
          <Field label="Description" required error={errors.description}><TextArea rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Short banner message" /></Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Button Text" required error={errors.buttonText}><TextInput value={draft.buttonText} onChange={(e) => setDraft({ ...draft, buttonText: e.target.value })} placeholder="e.g. Explore Courses" /></Field>
            <Field label="Button Link" required error={errors.buttonLink}><TextInput value={draft.buttonLink} onChange={(e) => setDraft({ ...draft, buttonLink: e.target.value })} placeholder="e.g. /courses" /></Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Active">
              <select value={draft.active ? "yes" : "no"} onChange={(e) => setDraft({ ...draft, active: e.target.value === "yes" })} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-navy focus:ring-2 focus:ring-navy/20">
                <option value="yes">Active</option><option value="no">Inactive</option>
              </select>
            </Field>
            <Field label="Accent Color">
              <div className="flex items-center gap-3">
                <input type="color" value={draft.accent} onChange={(e) => setDraft({ ...draft, accent: e.target.value })} className="h-10 w-16 cursor-pointer rounded-lg border border-slate-300" />
                <TextInput value={draft.accent} onChange={(e) => setDraft({ ...draft, accent: e.target.value })} placeholder="#1F3354" />
              </div>
            </Field>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmDelete} title="Delete Banner" message="This action cannot be undone." confirmText="Delete" />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2 — Page Images
// ═══════════════════════════════════════════════════════════════════════════════

function PageImagesTab() {
  const [images, setImages] = useState<PageImg[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Record<string, { type: "ok" | "err"; text: string }>>({});
  const [urlInputs, setUrlInputs] = useState<Record<string, string>>({});
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetch("/api/page-images", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setImages(j.data);
          const inputs: Record<string, string> = {};
          j.data.forEach((img: PageImg) => { inputs[`${img.pageKey}__${img.imageKey}`] = img.imageUrl; });
          setUrlInputs(inputs);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function setMsg(key: string, type: "ok" | "err", text: string) {
    setMsgs((p) => ({ ...p, [key]: { type, text } }));
    setTimeout(() => setMsgs((p) => { const n = { ...p }; delete n[key]; return n; }), 3500);
  }

  async function saveUrl(img: PageImg) {
    const key = `${img.pageKey}__${img.imageKey}`;
    const imageUrl = (urlInputs[key] || "").trim();
    if (!imageUrl) { setMsg(key, "err", "URL cannot be empty"); return; }
    setSavingKey(key);
    try {
      const r = await fetch("/api/page-images", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageKey: img.pageKey, imageKey: img.imageKey, imageUrl }),
      });
      const j = await r.json();
      if (j.success) {
        setImages((prev) => prev.map((p) => p.id === img.id ? { ...p, imageUrl } : p));
        setMsg(key, "ok", "Image updated successfully!");
      } else {
        setMsg(key, "err", j.error || "Failed to save");
      }
    } catch { setMsg(key, "err", "Network error"); }
    setSavingKey(null);
  }

  async function handleFileUpload(img: PageImg, file: File) {
    const key = `${img.pageKey}__${img.imageKey}`;
    setSavingKey(key);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      const uploadJson = await uploadRes.json();
      if (!uploadJson.success) { setMsg(key, "err", uploadJson.error || "Upload failed"); setSavingKey(null); return; }
      const imageUrl = uploadJson.data.url;
      const r = await fetch("/api/page-images", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageKey: img.pageKey, imageKey: img.imageKey, imageUrl }),
      });
      const j = await r.json();
      if (j.success) {
        setImages((prev) => prev.map((p) => p.id === img.id ? { ...p, imageUrl } : p));
        setUrlInputs((p) => ({ ...p, [key]: imageUrl }));
        setMsg(key, "ok", "Image uploaded and saved!");
      } else {
        setMsg(key, "err", j.error || "Failed to save");
      }
    } catch { setMsg(key, "err", "Network error"); }
    setSavingKey(null);
  }

  // Group by page
  const grouped = useMemo(() => {
    const map = new Map<string, PageImg[]>();
    images.forEach((img) => {
      if (!map.has(img.pageKey)) map.set(img.pageKey, []);
      map.get(img.pageKey)!.push(img);
    });
    return Array.from(map.entries());
  }, [images]);

  if (loading) return <Spinner label="Loading page images..." />;

  return (
    <>
      <PageHeader
        title="Page Images"
        subtitle="Change banner images, background images and section images for each page"
      />

      <div className="space-y-6">
        {grouped.map(([pageKey, imgs]) => (
          <div key={pageKey} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Page header */}
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center gap-2">
              <Globe className="h-4 w-4 text-navy" />
              <h3 className="text-sm font-semibold text-slate-800">
                {PAGE_LABELS[pageKey] || pageKey}
              </h3>
              <span className="ml-auto text-xs text-slate-400">{imgs.length} image{imgs.length !== 1 ? "s" : ""}</span>
            </div>

            <div className="divide-y divide-slate-100">
              {imgs.map((img) => {
                const key = `${img.pageKey}__${img.imageKey}`;
                const isSaving = savingKey === key;
                const msg = msgs[key];

                return (
                  <div key={img.id} className="p-5">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Preview */}
                      <div className="shrink-0">
                        <div className="h-20 w-32 rounded-lg border border-slate-200 overflow-hidden bg-slate-100">
                          {img.imageUrl ? (
                            <img
                              src={img.imageUrl}
                              alt={img.label}
                              className="h-full w-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-slate-300" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex-1 space-y-3">
                        <p className="text-sm font-medium text-slate-700">{img.label}</p>

                        {/* URL input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={urlInputs[key] || ""}
                            onChange={(e) => setUrlInputs((p) => ({ ...p, [key]: e.target.value }))}
                            placeholder="https://... or /uploads/..."
                            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
                          />
                          <button
                            type="button"
                            onClick={() => saveUrl(img)}
                            disabled={isSaving}
                            className="rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-white hover:bg-navy-deep disabled:opacity-50 whitespace-nowrap"
                          >
                            {isSaving ? (
                              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white inline-block" />
                            ) : "Save URL"}
                          </button>
                        </div>

                        {/* Upload button */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileRefs.current[key]?.click()}
                            disabled={isSaving}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:border-slate-400 disabled:opacity-50 transition-colors"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            Upload from device
                          </button>
                          <span className="text-xs text-slate-400">max 2MB · JPG/PNG/WebP</span>
                          <input
                            type="file"
                            accept="image/*"
                            ref={(el) => { fileRefs.current[key] = el; }}
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(img, f); }}
                            className="hidden"
                          />
                        </div>

                        {/* Message */}
                        {msg && (
                          <div className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium ${msg.type === "ok" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
                            {msg.type === "ok" ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 shrink-0" />}
                            {msg.text}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
