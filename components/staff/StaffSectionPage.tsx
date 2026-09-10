"use client";

/**
 * Generic staff section page.
 * - Checks if staff has READ permission on the page.
 * - Shows NoAccess if not.
 * - Shows read-only data fetched from the same admin API.
 * - Write/Delete actions are hidden unless staff has those permissions.
 */

import { useEffect, useState } from "react";
import { Eye, Pencil, Trash2, ShieldAlert, Loader2 } from "lucide-react";
import { useStaffUser, NoAccess } from "@/components/staff/StaffLayout";
import { hasPerm } from "@/lib/staffPermissions";
import type { StaffPage } from "@/models/StaffPermission";

interface Column {
  key: string;
  label: string;
  render?: (row: any) => React.ReactNode;
}

interface StaffSectionProps {
  page: StaffPage;
  title: string;
  subtitle: string;
  apiUrl: string;
  columns: Column[];
  onWrite?: (row: any) => void;
  onDelete?: (row: any) => void;
  writeLabel?: string;
  emptyMessage?: string;
  dataKey?: string; // key in API response (default: "data")
}

export function StaffSectionPage({
  page,
  title,
  subtitle,
  apiUrl,
  columns,
  onWrite,
  onDelete,
  writeLabel = "Edit",
  emptyMessage = "No records found.",
  dataKey = "data",
}: StaffSectionProps) {
  const staff = useStaffUser();
  const [rows, setRows]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const canRead   = staff ? hasPerm(staff.permissions, page, "read")   : false;
  const canWrite  = staff ? hasPerm(staff.permissions, page, "write")  : false;
  const canDelete = staff ? hasPerm(staff.permissions, page, "delete") : false;

  useEffect(() => {
    if (!canRead) { setLoading(false); return; }
    fetch(apiUrl, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => { if (j.success) setRows(j[dataKey] ?? j.data ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [canRead, apiUrl]);

  if (!staff) return null;
  if (!canRead) return <NoAccess page={title} />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">{title}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
      </div>

      {/* Permission badges */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full px-3 py-1">
          <Eye className="h-3 w-3" /> Read — allowed
        </span>
        {canWrite ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-3 py-1">
            <Pencil className="h-3 w-3" /> Write — allowed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-400 rounded-full px-3 py-1">
            <Pencil className="h-3 w-3" /> Write — not allowed
          </span>
        )}
        {canDelete ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-50 border border-red-200 text-red-700 rounded-full px-3 py-1">
            <Trash2 className="h-3 w-3" /> Delete — allowed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-400 rounded-full px-3 py-1">
            <Trash2 className="h-3 w-3" /> Delete — not allowed
          </span>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
            <ShieldAlert className="h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-400">{emptyMessage}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {columns.map((col) => (
                    <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {col.label}
                    </th>
                  ))}
                  {(canWrite || canDelete) && (
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map((row, i) => (
                  <tr key={row.id || i} className="hover:bg-slate-50/60 transition-colors">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-slate-700">
                        {col.render ? col.render(row) : (row[col.key] ?? "—")}
                      </td>
                    ))}
                    {(canWrite || canDelete) && (
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {canWrite && onWrite && (
                            <button
                              type="button"
                              onClick={() => onWrite(row)}
                              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
                            >
                              <Pencil className="h-3 w-3" /> {writeLabel}
                            </button>
                          )}
                          {canDelete && onDelete && (
                            <button
                              type="button"
                              onClick={() => onDelete(row)}
                              className="inline-flex items-center gap-1 rounded-md border border-red-100 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-3 w-3" /> Delete
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
