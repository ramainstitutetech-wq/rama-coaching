"use client";
import { StaffSectionPage } from "@/components/staff/StaffSectionPage";

export default function StaffCoursesPage() {
  return (
    <StaffSectionPage
      page="courses"
      title="Courses"
      subtitle="View and manage courses"
      apiUrl="/api/courses?limit=200"
      columns={[
        { key: "name",        label: "Course Name" },
        { key: "category",    label: "Category" },
        { key: "duration",    label: "Duration" },
        { key: "fees",        label: "Fees" },
        { key: "status",      label: "Status", render: (r) => (
          <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${r.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-50 text-slate-500 border border-slate-200"}`}>
            {r.status}
          </span>
        )},
      ]}
      emptyMessage="No courses found."
    />
  );
}
