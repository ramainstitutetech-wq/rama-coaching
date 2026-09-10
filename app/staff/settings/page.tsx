"use client";
import { useEffect, useState } from "react";
import { useStaffUser, NoAccess } from "@/components/staff/StaffLayout";
import { hasPerm } from "@/lib/staffPermissions";
import { Eye } from "lucide-react";

interface Settings {
  instituteName: string;
  phone: string;
  email: string;
  address: string;
  website?: string;
}

export default function StaffSettingsPage() {
  const staff = useStaffUser();
  const [settings, setSettings] = useState<Settings | null>(null);

  const canRead = staff ? hasPerm(staff.permissions, "settings", "read") : false;

  useEffect(() => {
    if (!canRead) return;
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => { if (j.success) setSettings(j.data); });
  }, [canRead]);

  if (!staff) return null;
  if (!canRead) return <NoAccess page="Settings" />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Institute information — read-only view</p>
      </div>
      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full px-3 py-1">
        <Eye className="h-3 w-3" /> Read — allowed (changes must be made by admin)
      </span>
      {settings && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
          {[
            { label: "Institute Name", value: settings.instituteName },
            { label: "Phone",          value: settings.phone },
            { label: "Email",          value: settings.email },
            { label: "Address",        value: settings.address },
            { label: "Website",        value: settings.website || "—" },
          ].map((row) => (
            <div key={row.label} className="px-5 py-3.5 flex items-center gap-4">
              <span className="w-36 text-xs font-semibold text-slate-400 uppercase tracking-wide shrink-0">{row.label}</span>
              <span className="text-sm text-slate-700">{row.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
