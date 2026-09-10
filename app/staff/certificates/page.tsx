"use client";
import { StaffSectionPage } from "@/components/staff/StaffSectionPage";

export default function StaffCertificatesPage() {
  return (
    <StaffSectionPage
      page="certificates"
      title="Certificates"
      subtitle="View issued certificates"
      apiUrl="/api/certificates?limit=200"
      columns={[
        { key: "certificateNumber", label: "Cert. No." },
        { key: "studentName",       label: "Student" },
        { key: "rollNumber",        label: "Roll No." },
        { key: "course",            label: "Course" },
        { key: "issueDate",         label: "Issue Date", render: (r) => r.issueDate ? new Date(r.issueDate).toLocaleDateString("en-IN") : "—" },
        { key: "status",            label: "Status", render: (r) => (
          <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${r.status === "issued" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : r.status === "revoked" ? "bg-red-50 text-red-600 border border-red-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
            {r.status}
          </span>
        )},
      ]}
      emptyMessage="No certificates found."
    />
  );
}
