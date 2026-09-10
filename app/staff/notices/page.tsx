"use client";
import { StaffSectionPage } from "@/components/staff/StaffSectionPage";

export default function StaffNoticesPage() {
  return (
    <StaffSectionPage
      page="notices"
      title="Notices"
      subtitle="View and manage notices"
      apiUrl="/api/notices?limit=100"
      columns={[
        { key: "title",       label: "Title" },
        { key: "priority",    label: "Priority", render: (r) => (
          <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${r.priority === "high" ? "bg-red-50 text-red-600 border border-red-200" : r.priority === "normal" ? "bg-blue-50 text-blue-600 border border-blue-200" : "bg-slate-50 text-slate-500 border border-slate-200"}`}>
            {r.priority}
          </span>
        )},
        { key: "date",        label: "Date", render: (r) => r.date ? new Date(r.date).toLocaleDateString("en-IN") : "—" },
        { key: "published",   label: "Published", render: (r) => (
          <span className={`text-xs font-medium ${r.published ? "text-emerald-600" : "text-slate-400"}`}>{r.published ? "Yes" : "No"}</span>
        )},
      ]}
      emptyMessage="No notices found."
    />
  );
}
