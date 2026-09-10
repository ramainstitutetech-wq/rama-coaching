"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Award,
  BookOpen,
  FileText,
  Star,
  Image as ImageIcon,
  Trophy,
  Bell,
  Mail,
  Building2,
  Settings,
  Menu,
  X,
  Search,
  LogOut,
  ExternalLink,
  ChevronDown,
  ClipboardList,
  Briefcase,
  NotebookText,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/staff", label: "Staff", icon: Briefcase },
  { href: "/admin/certificates", label: "Certificates", icon: Award },
  { href: "/admin/marksheets", label: "Marksheets", icon: FileText },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/mock-tests", label: "Mock Tests", icon: ClipboardList },
  { href: "/admin/enotes", label: "E-Notes", icon: NotebookText },
  { href: "/admin/testimonials", label: "Testimonials", icon: Star },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/achievements", label: "Achievements", icon: Trophy },
  { href: "/admin/notices", label: "Notices", icon: Bell },
  { href: "/admin/enrollments", label: "Enrollments", icon: FileText },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/franchise", label: "Franchise", icon: Building2 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

const TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/students": "Students",
  "/admin/staff": "Staff Management",
  "/admin/certificates": "Certificates",
  "/admin/marksheets": "Marksheets",
  "/admin/courses": "Courses",
  "/admin/mock-tests": "Mock Tests",
  "/admin/enotes": "E-Notes",
  "/admin/testimonials": "Testimonials",
  "/admin/banners": "Banners",
  "/admin/achievements": "Achievements",
  "/admin/notices": "Notices",
  "/admin/messages": "Messages",
  "/admin/enrollments": "Enrollments — QR Verification",
  "/admin/franchise": "Franchise Applications",
  "/admin/settings": "Settings",
  "/admin/profile": "My Profile",
};

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Don't show admin chrome on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const title = TITLES[pathname] ?? "Admin";

  const notifications = [
    { label: "3 new contact messages", time: "Just now" },
    { label: "2 franchise applications pending", time: "1h ago" },
    { label: "Notice #4 needs review", time: "3h ago" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-navy-deep text-slate-200 transition-transform duration-200 print:hidden md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <img src="/logo.jpeg" alt="Logo" className="h-9 w-9 rounded-md object-contain bg-white" />
          <div>
            <p className="text-sm font-semibold text-white">Rama Coaching</p>
            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-md p-1 text-slate-300 hover:bg-white/10 md:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <Link
            href="/"
            prefetch={true}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" />
            View Website
          </Link>
        </div>
      </aside>

      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      {/* Main column */}
      <div className="flex min-h-screen w-full flex-1 flex-col md:ml-64">
        <header         className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 print:hidden sm:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <h1 className="text-lg font-semibold text-slate-800">{title}</h1>

          <div className="relative ml-auto hidden max-w-xs flex-1 lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen((v) => !v)}
              className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
            {notifOpen ? (
              <div className="absolute right-0 z-30 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Notifications
                </p>
                {notifications.map((n, i) => (
                  <div key={i} className="rounded-lg px-3 py-2 hover:bg-slate-50">
                    <p className="text-sm text-slate-700">{n.label}</p>
                    <p className="text-xs text-slate-400">{n.time}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <Link href="/admin/profile" className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 transition-colors">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
                A
              </span>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-700">Admin</p>
                <p className="text-xs text-slate-400">administrator</p>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
            </Link>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
