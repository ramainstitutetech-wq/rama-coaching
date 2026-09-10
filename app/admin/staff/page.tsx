"use client";

import { useEffect, useState } from "react";
import {
  Plus, Pencil, Trash2, Shield, Eye, Users,
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  EyeOff, Lock, UserCheck, UserX,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field, TextInput } from "@/components/ui/Field";
import { EmptyState, Spinner } from "@/components/ui/EmptyState";
import { STAFF_PAGES, type StaffPage, PAGE_LABELS } from "@/lib/staff-pages";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PagePermission { page: StaffPage; read: boolean; write: boolean; delete: boolean; }
interface StaffMember {
  id: string; name: string; email: string; status: string;
  lastLoginAt: string | null; permissions: PagePermission[];
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminStaffPage() {
  const [list, setList]           = useState<StaffMember[]>([]);
  const [loading, setLoading]     = useState(true);

  // Create/Edit modal
  const [formOpen, setFormOpen]   = useState(false);
  const [editing, setEditing]     = useState<StaffMember | null>(null);
  const [formName, setFormName]   = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPw, setFormPw]       = useState("");
  const [formStatus, setFormStatus] = useState<"active"|"inactive">("active");
  const [showPw, setShowPw]       = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string,string>>({});
  const [formSaving, setFormSaving] = useState(false);
  const [formMsg, setFormMsg]     = useState<{type:"ok"|"err";text:string}|null>(null);

  // Permissions modal
  const [permOpen, setPermOpen]   = useState(false);
  const [permStaff, setPermStaff] = useState<StaffMember | null>(null);
  const [permData, setPermData]   = useState<PagePermission[]>([]);
  const [permSaving, setPermSaving] = useState(false);
  const [permMsg, setPermMsg]     = useState<{type:"ok"|"err";text:string}|null>(null);
  const [expanded, setExpanded]   = useState<StaffPage | null>(null);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/staff", { cache: "no-store" });
      const j = await r.json();
      if (j.success) setList(j.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchList(); }, []);

  // ── Create / Edit ──────────────────────────────────────────────────────────
  function openCreate() {
    setEditing(null);
    setFormName(""); setFormEmail(""); setFormPw(""); setFormStatus("active");
    setFormErrors({}); setFormMsg(null);
    setFormOpen(true);
  }

  function openEdit(s: StaffMember) {
    setEditing(s);
    setFormName(s.name); setFormEmail(s.email); setFormPw(""); setFormStatus(s.status as any);
    setFormErrors({}); setFormMsg(null);
    setFormOpen(true);
  }

  async function saveForm() {
    const errs: Record<string,string> = {};
    if (!formName.trim()) errs.name = "Name is required";
    if (!editing && !formEmail.trim()) errs.email = "Email is required";
    if (!editing && formPw.length < 6) errs.pw = "Password must be at least 6 characters";
    if (editing && formPw && formPw.length < 6) errs.pw = "Password too short";
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setFormSaving(true); setFormMsg(null);
    try {
      let r: Response;
      if (editing) {
        const body: any = { name: formName, status: formStatus };
        if (formPw) body.password = formPw;
        r = await fetch(`/api/admin/staff/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      } else {
        r = await fetch("/api/admin/staff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: formName, email: formEmail, password: formPw, status: formStatus }) });
      }
      const j = await r.json();
      if (j.success) {
        setFormMsg({ type: "ok", text: editing ? "Staff updated!" : "Staff account created!" });
        await fetchList();
        setTimeout(() => setFormOpen(false), 900);
      } else {
        setFormMsg({ type: "err", text: j.error || "Failed to save" });
      }
    } catch { setFormMsg({ type: "err", text: "Network error" }); }
    setFormSaving(false);
  }

  // ── Permissions ────────────────────────────────────────────────────────────
  function openPermissions(s: StaffMember) {
    setPermStaff(s);
    // Build full permissions array with all pages (fill missing with false)
    const existing = s.permissions || [];
    const full: PagePermission[] = STAFF_PAGES.map((page) => {
      const found = existing.find((p) => p.page === page);
      return found ?? { page, read: false, write: false, delete: false };
    });
    setPermData(full);
    setPermMsg(null);
    setExpanded(null);
    setPermOpen(true);
  }

  function togglePerm(page: StaffPage, action: "read"|"write"|"delete") {
    setPermData((prev) => prev.map((p) => {
      if (p.page !== page) return p;
      const next = { ...p, [action]: !p[action] };
      // If write or delete is enabled, read must also be enabled
      if ((action === "write" || action === "delete") && next[action]) {
        next.read = true;
      }
      // If read is disabled, disable write and delete too
      if (action === "read" && !next.read) {
        next.write = false; next.delete = false;
      }
      return next;
    }));
  }

  async function savePermissions() {
    if (!permStaff) return;
    setPermSaving(true); setPermMsg(null);
    try {
      const r = await fetch(`/api/admin/staff/${permStaff.id}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: permData }),
      });
      const j = await r.json();
      if (j.success) {
        setPermMsg({ type: "ok", text: "Permissions saved!" });
        await fetchList();
        setTimeout(() => setPermOpen(false), 900);
      } else {
        setPermMsg({ type: "err", text: j.error || "Failed" });
      }
    } catch { setPermMsg({ type: "err", text: "Network error" }); }
    setPermSaving(false);
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function confirmDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/admin/staff/${deleteTarget.id}`, { method: "DELETE" });
    await fetchList();
    setDeleteTarget(null);
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Management"
        subtitle="Create staff accounts and control their access permissions per page"
        actions={
          <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep">
            <Plus className="h-4 w-4" /> Add Staff
          </button>
        }
      />

      {loading ? <Spinner label="Loading staff..." /> : list.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No staff accounts yet"
          description="Create a staff account and assign page permissions."
          action={<button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep"><Plus className="h-4 w-4" /> Add Staff</button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {list.map((s) => {
            const grantedCount = s.permissions.filter((p) => p.read || p.write || p.delete).length;
            return (
              <div key={s.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-[#1F3354] to-[#2d4a7a]" />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#1F3354] flex items-center justify-center text-sm font-bold text-white shrink-0">
                        {s.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.email}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border ${s.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}>
                      {s.status === "active" ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                      {s.status}
                    </span>
                  </div>

                  {/* Permission summary */}
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <Shield className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs text-slate-500">{grantedCount} page{grantedCount !== 1 ? "s" : ""} with access</span>
                    {s.permissions.filter((p) => p.read || p.write || p.delete).slice(0, 4).map((p) => (
                      <span key={p.page} className="text-[11px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 font-medium">
                        {PAGE_LABELS[p.page]}
                      </span>
                    ))}
                    {grantedCount > 4 && <span className="text-[11px] text-slate-400">+{grantedCount - 4} more</span>}
                  </div>

                  {s.lastLoginAt && (
                    <p className="mt-2 text-xs text-slate-400">
                      Last login: {new Date(s.lastLoginAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => openPermissions(s)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#1F3354] text-white px-3 py-1.5 text-xs font-semibold hover:bg-[#162640]">
                      <Shield className="h-3.5 w-3.5" /> Manage Permissions
                    </button>
                    <button type="button" onClick={() => openEdit(s)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button type="button" onClick={() => setDeleteTarget(s)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? `Edit — ${editing.name}` : "Add New Staff"} size="md"
        footer={
          <>
            <button type="button" onClick={() => setFormOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="button" onClick={saveForm} disabled={formSaving} className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep disabled:opacity-50">
              {formSaving ? "Saving…" : editing ? "Save Changes" : "Create Account"}
            </button>
          </>
        }>
        <div className="space-y-4">
          <Field label="Full Name" required error={formErrors.name}>
            <TextInput value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Ravi Sharma" />
          </Field>
          {!editing && (
            <Field label="Email" required error={formErrors.email}>
              <TextInput type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="staff@ramacoaching.com" />
            </Field>
          )}
          <Field label={editing ? "New Password (leave blank to keep current)" : "Password"} error={formErrors.pw}>
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={formPw} onChange={(e) => setFormPw(e.target.value)}
                placeholder={editing ? "Leave blank to keep current" : "Min 6 characters"}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20" />
              <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>
          <Field label="Status">
            <select value={formStatus} onChange={(e) => setFormStatus(e.target.value as any)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20">
              <option value="active">Active</option>
              <option value="inactive">Inactive (login blocked)</option>
            </select>
          </Field>
          {formMsg && (
            <div className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm ${formMsg.type === "ok" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
              {formMsg.type === "ok" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              {formMsg.text}
            </div>
          )}
        </div>
      </Modal>

      {/* ── Permissions Modal ── */}
      <Modal open={permOpen} onClose={() => setPermOpen(false)} title={`Permissions — ${permStaff?.name || ""}`} size="xl"
        footer={
          <>
            <button type="button" onClick={() => setPermOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="button" onClick={savePermissions} disabled={permSaving} className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep disabled:opacity-50">
              {permSaving ? "Saving…" : "Save Permissions"}
            </button>
          </>
        }>
        <div className="space-y-3">
          {/* Legend */}
          <div className="flex flex-wrap gap-2 text-xs mb-2">
            <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full px-2.5 py-1 font-semibold"><Eye className="h-3 w-3" /> Read — can view</span>
            <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-2.5 py-1 font-semibold"><Pencil className="h-3 w-3" /> Write — can add/edit</span>
            <span className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-700 rounded-full px-2.5 py-1 font-semibold"><Trash2 className="h-3 w-3" /> Delete — can remove</span>
          </div>

          {permData.map((p) => {
            const hasAny = p.read || p.write || p.delete;
            const isExp  = expanded === p.page;
            return (
              <div key={p.page} className={`rounded-xl border overflow-hidden transition-colors ${hasAny ? "border-[#1F3354]/30 bg-slate-50" : "border-slate-200 bg-white"}`}>
                {/* Row header */}
                <button type="button" onClick={() => setExpanded(isExp ? null : p.page)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50/80 transition-colors">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${hasAny ? "bg-[#1F3354] text-white" : "bg-slate-100 text-slate-400"}`}>
                    {PAGE_LABELS[p.page].slice(0, 2).toUpperCase()}
                  </div>
                  <span className="flex-1 text-sm font-medium text-slate-800">{PAGE_LABELS[p.page]}</span>
                  {/* Quick badges */}
                  <div className="flex gap-1 mr-2">
                    {p.read   && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded px-1.5 py-0.5">R</span>}
                    {p.write  && <span className="text-[10px] font-bold bg-blue-100 text-blue-700 rounded px-1.5 py-0.5">W</span>}
                    {p.delete && <span className="text-[10px] font-bold bg-red-100 text-red-700 rounded px-1.5 py-0.5">D</span>}
                  </div>
                  {isExp ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
                </button>

                {/* Expanded permission toggles */}
                {isExp && (
                  <div className="px-4 pb-4 flex flex-wrap gap-3 border-t border-slate-100 pt-3">
                    {(["read", "write", "delete"] as const).map((action) => {
                      const checked = p[action];
                      const colors = { read: { on: "bg-emerald-500 border-emerald-500", off: "border-slate-300", label: "Read", icon: Eye }, write: { on: "bg-blue-500 border-blue-500", off: "border-slate-300", label: "Write", icon: Pencil }, delete: { on: "bg-red-500 border-red-500", off: "border-slate-300", label: "Delete", icon: Trash2 } };
                      const cfg = colors[action];
                      const Icon = cfg.icon;
                      return (
                        <button key={action} type="button" onClick={() => togglePerm(p.page, action)}
                          className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 text-sm font-semibold transition-all ${checked ? `${cfg.on} text-white shadow-sm` : `${cfg.off} text-slate-500 hover:border-slate-400 bg-white`}`}>
                          <Icon className="h-4 w-4" />
                          {cfg.label}
                          {checked && <span className="text-xs opacity-75">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {permMsg && (
            <div className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm ${permMsg.type === "ok" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
              {permMsg.type === "ok" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              {permMsg.text}
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
        title="Delete Staff Account"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete Account"
      />
    </div>
  );
}
