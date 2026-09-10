"use client";
import { StaffSectionPage } from "@/components/staff/StaffSectionPage";

export default function StaffTestimonialsPage() {
  return (
    <StaffSectionPage
      page="testimonials"
      title="Testimonials"
      subtitle="View student testimonials and reviews"
      apiUrl="/api/testimonials?limit=100"
      columns={[
        { key: "studentName", label: "Student" },
        { key: "course",      label: "Course" },
        { key: "rating",      label: "Rating", render: (r) => `${"★".repeat(r.rating || 0)}${"☆".repeat(5 - (r.rating || 0))}` },
        { key: "review",      label: "Review", render: (r) => <span className="line-clamp-1 max-w-xs">{r.review}</span> },
        { key: "published",   label: "Published", render: (r) => (
          <span className={`text-xs font-medium ${r.published ? "text-emerald-600" : "text-slate-400"}`}>{r.published ? "Yes" : "No"}</span>
        )},
      ]}
      emptyMessage="No testimonials found."
    />
  );
}
