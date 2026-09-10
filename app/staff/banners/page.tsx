"use client";
import { StaffSectionPage } from "@/components/staff/StaffSectionPage";

export default function StaffBannersPage() {
  return (
    <StaffSectionPage
      page="banners"
      title="Banners"
      subtitle="View and manage site banners"
      apiUrl="/api/banners"
      columns={[
        { key: "heading",     label: "Heading" },
        { key: "description", label: "Description", render: (r) => <span className="line-clamp-1 max-w-xs">{r.description}</span> },
        { key: "buttonText",  label: "Button" },
        { key: "active",      label: "Status", render: (r) => (
          <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${r.active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-50 text-slate-500 border border-slate-200"}`}>
            {r.active ? "Active" : "Inactive"}
          </span>
        )},
      ]}
      emptyMessage="No banners found."
    />
  );
}
