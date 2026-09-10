"use client";
import { StaffSectionPage } from "@/components/staff/StaffSectionPage";

export default function StaffMessagesPage() {
  return (
    <StaffSectionPage
      page="messages"
      title="Messages"
      subtitle="View contact messages from students and visitors"
      apiUrl="/api/messages?limit=100"
      columns={[
        { key: "name",    label: "Name" },
        { key: "email",   label: "Email" },
        { key: "phone",   label: "Phone" },
        { key: "message", label: "Message", render: (r) => (
          <span className="line-clamp-1 max-w-xs">{r.message}</span>
        )},
        { key: "date",    label: "Date", render: (r) => r.date ? new Date(r.date).toLocaleDateString("en-IN") : "—" },
        { key: "status",  label: "Status", render: (r) => (
          <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${r.status === "unread" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-slate-50 text-slate-500 border border-slate-200"}`}>
            {r.status}
          </span>
        )},
      ]}
      emptyMessage="No messages found."
    />
  );
}
