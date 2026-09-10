"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Award, BookOpen, FileText, Star,
  Image as ImageIcon, Trophy, Bell, Mail, Building2, Settings,
  Menu, X, LogOut, ExternalLink, Briefcase, ClipboardList,
  ShieldAlert,
} from "lucide-react";
import type { PagePermission } from "@/lib/staffPermissions";
import { hasPerm, getAccessiblePages } from "@/lib/staffPermissions";
import type { StaffPage } from "@/models/StaffPermission";

// ─── Context ──────────────────────────────────────────────────────────────────

interface StaffUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  permissions: PagePermission[];
}

const StaffCtx = createContext<StaffUser | null>(null);
export const useStaffUser = () => useContext(StaffCtx);

// ─── Nav config ───────────────────────────────────────────────────────────────

const ALL_NAV: { href: string; label: string; icon: React.ElementType; page: StaffPage }[] = [
  { href: "/staff",              label: "Dashboard",     icon: LayoutDashboard, page: "dashboard" },
  { href: "/staff/students",     label: "Students",      icon: Users,           page: "students" },
  { href: "/staff/certificates", label: "Certificates",  icon: Award,           page: "certificates" },
  { href: "/staff/marksheets",   label: "Marksheets",    icon: FileText,        page: "marksheets" },
  { href: "/staff/courses",      label: "Courses",       icon: BookOpen,        page: "courses" },
  { href: "/staff/mock-tests",   label: "Mock Tests",    icon: ClipboardList,   page: "mock-tests" },
  { href: "/staff/testimonials", label: "Testimonials",  icon: Star,            page: "testimonials" },
  { href: "/staff/banners",      label: "Banners",       icon: ImageIcon,       page: "banners" },
  { href: "/staff/achievements", label: "Achievements",  icon: Trophy,          page: "achievements" },
  { href: "/staff/notices",      label: "Notices",       icon: Bell,            page: "notices" },
  { href: "/staff/messages",     label: "Messages",      icon: Mail,            page: "messages" },
  { href: "/staff/franchise",    label: "Franchise",     icon: Building2,       page: "franchise" },
  { href: "/staff/settings",     label: "Settings",      icon: Settings,        page: "settings" },
];

const TITLES: Record<string, string> = {
  "/staff":              "Dashboard",
  "/staff/students":     "Students",
  "/staff/certificates": "Certificates",
  "/staff/marksheets":   "Marksheets",
  "/staff/courses":      "Courses",
  "/staff/mock-tests":   "Mock Tests",
  "/staff/testimonials": "Testimonials",
  "/staff/banners":      "Banners",
  "/staff/achievements": "Achievements",
  "/staff/notices":      "Notices",
  "/staff/messages":     "Messages",
  "/staff/franchise":    "Franchise",
  "/staff/settings":     "Settings",
};

// ─── Layout ───────────────────────────────────────────────────────────────────

export function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [staffUser, setStaffUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Bypass layout on login page
  if (pathname === "/staff/login") return <>{children}</>;

  useEffect(() => {
    fetch("/api/staff/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setStaffUser(j.data);
        else router.push("/staff/login");
      })
      .catch(() => router.push("/staff/login"))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const isActive = (href: string) =>
    href === "/staff" ? pathname === "/staff" : pathname.startsWith(href);

  // Only show nav items the staff has at least one permission on
  const accessiblePages = staffUser ? getAccessiblePages(staffUser.permissions) : [];
  const visibleNav = ALL_NAV.filter(
    (n) => n.page === "dashboard" || accessiblePages.includes(n.page)
  );

  const title = TITLES[pathname] ?? "Staff Panel";

  const initials = (staffUser?.name || "S")
    .split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#1F3354]" />
      </div>
    );
  }

  return (
    <StaffCtx.Provider value={staffUser}>
      <div className="flex min-h-screen bg-slate-50">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#1F3354] text-slate-200 transition-transform duration-200 print:hidden md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
            <img src="/logo.jpeg" alt="Logo" className="h-9 w-9 rounded-md object-contain bg-white" />
            <div>
              <p className="text-sm font-semibold text-white">Rama Coaching</p>
              <p className="text-xs text-amber-300 font-medium">Staff Panel</p>
            </div>
            <button type="button" onClick={() => setSidebarOpen(false)} className="ml-auto rounded-md p-1 text-slate-300 hover:bg-white/10 md:hidden">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
            {visibleNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              // Show permission badges
              const perm = staffUser?.permissions.find((p) => p.page === item.page);
              const badges = perm
                ? [perm.read && "R", perm.write && "W", perm.delete && "D"].filter(Boolean)
                : [];

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.page !== "dashboard" && badges.length > 0 && (
                    <span className="flex gap-0.5">
                      {badges.map((b, bi) => (
                        <span key={bi} className={`text-[9px] font-bold rounded px-1 py-0.5 ${b === "R" ? "bg-emerald-500/30 text-emerald-300" : b === "W" ? "bg-blue-500/30 text-blue-300" : "bg-red-500/30 text-red-300"}`}>{b}</span>
                      ))}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-3">
            <Link href="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
              <ExternalLink className="h-4 w-4" /> View Website
            </Link>
          </div>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Main */}
        <div className="flex min-h-screen w-full flex-1 flex-col md:ml-64">
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 print:hidden sm:px-6">
            <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden">
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-amber-600" />
              <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
            </div>

            <div className="ml-auto flex items-center gap-3">
              {/* Staff badge */}
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700">
                <Briefcase className="h-3 w-3" /> Staff
              </span>

              {/* Avatar */}
              <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                {staffUser?.avatarUrl ? (
                  <img src={staffUser.avatarUrl} alt={staffUser.name} className="h-8 w-8 rounded-full object-cover border border-slate-200" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1F3354] text-xs font-bold text-white">{initials}</span>
                )}
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-700">{staffUser?.name}</p>
                  <p className="text-xs text-slate-400">staff</p>
                </div>
              </div>

              <button type="button" onClick={handleLogout} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" title="Logout">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </StaffCtx.Provider>
  );
}

// ─── Permission Guard component ───────────────────────────────────────────────

export function PermGuard({
  page,
  action,
  children,
  fallback,
}: {
  page: StaffPage;
  action: "read" | "write" | "delete";
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const staff = useStaffUser();
  if (!staff) return null;
  if (!hasPerm(staff.permissions, page, action)) {
    return fallback ? <>{fallback}</> : null;
  }
  return <>{children}</>;
}

// ─── No Access page ───────────────────────────────────────────────────────────

export function NoAccess({ page }: { page: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <div className="h-16 w-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
        <ShieldAlert className="h-8 w-8 text-red-400" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Access Denied</h2>
        <p className="text-sm text-slate-500 mt-1">
          You don&apos;t have permission to access <span className="font-medium text-slate-700">{page}</span>.
        </p>
        <p className="text-xs text-slate-400 mt-2">Contact your admin to request access.</p>
      </div>
      <Link href="/staff" className="rounded-lg bg-[#1F3354] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#162640]">
        Go to Dashboard
      </Link>
    </div>
  );
}
