"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2, Eye, MailOpen, Inbox } from "lucide-react";
import type { ContactMessage } from "@/data/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput, SelectInput } from "@/components/ui/SearchInput";
import { Badge } from "@/components/ui/Badge";
import { EmptyState, Spinner } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Tabs, Avatar } from "@/components/ui/Tabs";
import { messageStatusVariant, titleCase } from "@/lib/status";

export default function MessagesPage() {
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tab, setTab] = useState("all");
  const [viewTarget, setViewTarget] = useState<ContactMessage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/messages", { cache: "no-store" });
      const j = await res.json();
      if (j.success) setItems(j.data);
    } catch {}
    setLoading(false);
  };
  useEffect(() => { fetchList(); }, []);

  const unreadCount = useMemo(
    () => items.filter((m) => m.status === "unread").length,
    [items]
  );

  const filtered = useMemo(() => {
    const activeTab = tab !== "all" ? tab : statusFilter;
    return items.filter((m) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.phone.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q);
      const matchesStatus = activeTab === "all" || m.status === activeTab;
      return matchesQuery && matchesStatus;
    });
  }, [items, query, statusFilter, tab]);

  async function markRead(m: ContactMessage) {
    try {
      const res = await fetch(`/api/messages/${m.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "read" }) });
      const j = await res.json();
      if (!j.success) { alert(j.error || "Failed to update status"); return; }
      await fetchList();
    } catch { alert("Network error while updating message"); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/messages/${deleteTarget.id}`, { method: "DELETE" });
      const j = await res.json();
      if (!j.success) { alert(j.error || "Failed to delete"); return; }
      await fetchList();
    } catch { alert("Network error while deleting message"); }
    setDeleteTarget(null);
  }

  if (loading) return <Spinner label="Loading messages..." />;

  return (
    <div>
      <PageHeader
        title="Contact Messages"
        subtitle={`${unreadCount} unread message${unreadCount === 1 ? "" : "s"}`}
      />

      <div className="mb-4">
        <Tabs
          tabs={[
            { key: "all", label: "All" },
            { key: "unread", label: "Unread" },
            { key: "read", label: "Read" },
          ]}
          active={tab}
          onChange={(k) => {
            setTab(k);
            setStatusFilter("all");
          }}
        />
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by name, email, phone or message..."
          />
        </div>
        <SelectInput
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v);
            setTab("all");
          }}
          options={[
            { value: "all", label: "All Status" },
            { value: "unread", label: "Unread" },
            { value: "read", label: "Read" },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No messages found"
          description="No contact messages match your search or filters."
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Sender</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={m.name} size={36} />
                      <span className="font-medium text-slate-800">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{m.email}</td>
                  <td className="px-4 py-3 text-slate-600">{m.phone}</td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="line-clamp-1 text-slate-600">{m.message}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{m.date}</td>
                  <td className="px-4 py-3">
                    <Badge variant={messageStatusVariant[m.status]}>
                      {titleCase(m.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setViewTarget(m);
                          if (m.status === "unread") markRead(m);
                        }}
                        className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {m.status === "unread" ? (
                        <button
                          type="button"
                          onClick={() => markRead(m)}
                          className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
                          title="Mark as read"
                        >
                          <MailOpen className="h-4 w-4" />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(m)}
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
        open={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title="Message Details"
        size="lg"
      >
        {viewTarget ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={viewTarget.name} size={48} />
              <div>
                <p className="font-semibold text-slate-800">{viewTarget.name}</p>
                <Badge variant={messageStatusVariant[viewTarget.status]}>
                  {titleCase(viewTarget.status)}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-slate-400">Email</p>
                <p className="text-sm text-slate-700">{viewTarget.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Phone</p>
                <p className="text-sm text-slate-700">{viewTarget.phone}</p>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Date</p>
              <p className="text-sm text-slate-700">{viewTarget.date}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Message</p>
              <p className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                {viewTarget.message}
              </p>
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Message"
        message={`Are you sure you want to delete the message from "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
