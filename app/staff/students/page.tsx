"use client";
import { StaffSectionPage } from "@/components/staff/StaffSectionPage";
import { Badge } from "@/components/ui/Badge";

export default function StaffStudentsPage() {
  return (
    <StaffSectionPage
      page="students"
      title="Students"
      subtitle="View and manage student records"
      apiUrl="/api/students?limit=200"
      columns={[
        { key: "rollNumber", label: "Roll No." },
        { key: "fullName",   label: "Name" },
        { key: "course",     label: "Course" },
        { key: "batch",      label: "Batch" },
        { key: "phone",      label: "Phone" },
        { key: "status",     label: "Status", render: (r) => (
          <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${r.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-50 text-slate-500 border border-slate-200"}`}>
            {r.status}
          </span>
        )},
      ]}
      emptyMessage="No students found."
    />
  );
}
