"use client";
import { StaffSectionPage } from "@/components/staff/StaffSectionPage";

export default function StaffFranchisePage() {
  return (
    <StaffSectionPage
      page="franchise"
      title="Franchise Applications"
      subtitle="View franchise enquiries and applications"
      apiUrl="/api/franchise?limit=100"
      columns={[
        { key: "name",    label: "Name" },
        { key: "email",   label: "Email" },
        { key: "phone",   label: "Phone" },
        { key: "city",    label: "City" },
        { key: "state",   label: "State" },
        { key: "status",  label: "Status", render: (r) => (
          <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${r.status === "approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : r.status === "rejected" ? "bg-red-50 text-red-600 border border-red-200" : r.status === "contacted" ? "bg-blue-50 text-blue-600 border border-blue-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
            {r.status}
          </span>
        )},
        { key: "date",    label: "Date", render: (r) => r.date ? new Date(r.date).toLocaleDateString("en-IN") : "—" },
      ]}
      emptyMessage="No franchise applications found."
    />
  );
}
