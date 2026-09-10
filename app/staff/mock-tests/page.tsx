"use client";
import { StaffSectionPage } from "@/components/staff/StaffSectionPage";

export default function StaffMockTestsPage() {
  return (
    <StaffSectionPage
      page="mock-tests"
      title="Mock Tests"
      subtitle="View mock tests and questions"
      apiUrl="/api/mock-tests?limit=100"
      columns={[
        { key: "title",        label: "Title" },
        { key: "subject",      label: "Subject" },
        { key: "duration",     label: "Duration", render: (r) => `${r.duration} min` },
        { key: "totalMarks",   label: "Marks" },
        { key: "questions",    label: "Questions", render: (r) => r.questions?.length ?? 0 },
        { key: "status",       label: "Status", render: (r) => (
          <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${r.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-50 text-slate-500 border border-slate-200"}`}>
            {r.status}
          </span>
        )},
      ]}
      emptyMessage="No mock tests found."
    />
  );
}
