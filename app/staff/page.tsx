"use client";

import { useStaffUser } from "@/components/staff/StaffLayout";
import { hasPerm } from "@/lib/staffPermissions";
import { STAFF_PAGES } from "@/lib/staff-pages";
import {
  Users, Award, BookOpen, FileText, Star, Image as ImageIcon,
  Trophy, Bell, Mail, Building2, Settings, ClipboardList, ShieldCheck,
  Eye, Pencil, Trash2,
} from "lucide-react";
import Link from "next/link";

const PAGE_META: Record<string, { label: string; href: string; icon: React.ElementType }> = {
  dashboard:    { label: "Dashboard",    href: "/staff",              icon: Users },
  students:     { label: "Students",     href: "/staff/students",     icon: Users },
  certificates: { label: "Certificates", href: "/staff/certificates", icon: Award },
  marksheets:   { label: "Marksheets",   href: "/staff/marksheets",   icon: FileText },
  courses:      { label: "Courses",      href: "/staff/courses",      icon: BookOpen },
  "mock-tests": { label: "Mock Tests",   href: "/staff/mock-tests",   icon: ClipboardList },
  testimonials: { label: "Testimonials", href: "/staff/testimonials", icon: Star },
  banners:      { label: "Banners",      href: "/staff/banners",      icon: ImageIcon },
  achievements: { label: "Achievements", href: "/staff/achievements", icon: Trophy },
  notices:      { label: "Notices",      href: "/staff/notices",      icon: Bell },
  messages:     { label: "Messages",     href: "/staff/messages",     icon: Mail },
  franchise:    { label: "Franchise",    href: "/staff/franchise",    icon: Building2 },
  settings:     { label: "Settings",     href: "/staff/settings",     icon: Settings },
};

export default function StaffDashboard() {
  const staff = useStaffUser();
  if (!staff) return null;

  const grantedPages = STAFF_PAGES.filter((p) =>
    hasPerm(staff.permissions, p, "read") ||
    hasPerm(staff.permissions, p, "write") ||
    hasPerm(staff.permissions, p, "delete")
  );

  const initials = staff.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-xl bg-gradient-to-r from-[#1F3354] to-[#2d4a7a] p-6 text-white">
        <div className="flex items-center gap-4">
          {staff.avatarUrl ? (
            <img src={staff.avatarUrl} alt={staff.name} className="h-14 w-14 rounded-full object-cover border-2 border-white/30" />
          ) : (
            <div className="h-14 w-14 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center text-xl font-bold">{initials}</div>
          )}
          <div>
            <p className="text-sm text-slate-300">Welcome back,</p>
            <h1 className="text-2xl font-bold">{staff.name}</h1>
            <p className="text-slate-300 text-sm mt-0.5">{staff.email}</p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2">
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
            <div>
              <p className="text-xs text-slate-300">Access</p>
              <p className="text-sm font-bold">{grantedPages.length} pages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions overview */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Your Access Permissions</h2>
        {grantedPages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <ShieldCheck className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No pages assigned yet.</p>
            <p className="text-xs text-slate-400 mt-1">Ask your admin to assign permissions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {grantedPages.map((page) => {
              const meta = PAGE_META[page];
              if (!meta) return null;
              const Icon = meta.icon;
              const canRead   = hasPerm(staff.permissions, page, "read");
              const canWrite  = hasPerm(staff.permissions, page, "write");
              const canDelete = hasPerm(staff.permissions, page, "delete");

              return (
                <Link
                  key={page}
                  href={meta.href}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-[#1F3354]/30 transition-all group"
                >
                  <div className="h-10 w-10 rounded-lg bg-[#1F3354]/10 flex items-center justify-center shrink-0 group-hover:bg-[#1F3354]/20 transition-colors">
                    <Icon className="h-5 w-5 text-[#1F3354]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{meta.label}</p>
                    <div className="flex gap-1 mt-1">
                      {canRead   && <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 rounded px-1.5 py-0.5"><Eye className="h-2.5 w-2.5" />Read</span>}
                      {canWrite  && <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-blue-50 border border-blue-200 text-blue-700 rounded px-1.5 py-0.5"><Pencil className="h-2.5 w-2.5" />Write</span>}
                      {canDelete && <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-red-50 border border-red-200 text-red-700 rounded px-1.5 py-0.5"><Trash2 className="h-2.5 w-2.5" />Delete</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
