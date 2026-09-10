"use client";
import { StaffSectionPage } from "@/components/staff/StaffSectionPage";

export default function StaffAchievementsPage() {
  return (
    <StaffSectionPage
      page="achievements"
      title="Achievements"
      subtitle="View institute achievement stats"
      apiUrl="/api/achievements"
      columns={[
        { key: "value",       label: "Value" },
        { key: "label",       label: "Label" },
        { key: "description", label: "Description" },
        { key: "status",      label: "Status", render: (r) => (
          <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${r.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-50 text-slate-500 border border-slate-200"}`}>
            {r.status}
          </span>
        )},
      ]}
      emptyMessage="No achievements found."
    />
  );
}
