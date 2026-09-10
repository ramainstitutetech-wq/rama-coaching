"use client";
import { StaffSectionPage } from "@/components/staff/StaffSectionPage";

export default function StaffMarksheetsPage() {
  return (
    <StaffSectionPage
      page="marksheets"
      title="Marksheets"
      subtitle="View student marksheets"
      apiUrl="/api/certificates?limit=200"
      columns={[
        { key: "certificateNumber", label: "Cert. No." },
        { key: "studentName",       label: "Student" },
        { key: "rollNumber",        label: "Roll No." },
        { key: "course",            label: "Course" },
        { key: "type",              label: "Type", render: (r) => (
          <span className="capitalize text-xs">{r.type}</span>
        )},
        { key: "issueDate", label: "Date", render: (r) => r.issueDate ? new Date(r.issueDate).toLocaleDateString("en-IN") : "—" },
      ]}
      emptyMessage="No marksheets found."
    />
  );
}
