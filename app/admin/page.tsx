"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Award, BookOpen, Building2, Mail, Plus, FilePlus2, ArrowRight, TrendingUp, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { certificateStatusVariant, franchiseStatusVariant, titleCase } from "@/lib/status";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

function StatCard({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value: number; hint: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy/10 text-navy"><Icon className="h-5 w-5" /></span>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600"><TrendingUp className="h-3.5 w-3.5" />{hint}</span>
      </div>
      <p className="mt-4 text-3xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<{
    totalStudents: number; issuedCertificates: number; activeCourses: number; pendingFranchise: number; newMessages: number;
    recentCertificates: Array<{ id: string; certificateNumber: string; studentName: string; course: string; status: string }>;
    recentStudents: Array<{ id: string; fullName: string; rollNumber: string; course: string; batch: string; avatarColor: string }>;
    recentApplications: Array<{ id: string; name: string; city: string; date: string; status: string }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => { if (j.success) setData(j.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (!data) return <div className="text-center py-10 text-slate-500">Failed to load dashboard. Try refreshing.</div>;

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-navy-deep to-navy p-6 text-white sm:p-8">
        <p className="text-sm text-white/70">Welcome back, Admin</p>
        <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Rama Coaching Center Dashboard</h2>
        <p className="mt-2 max-w-xl text-sm text-white/80">Manage students, certificates, courses and more from one place. Here is a snapshot of your institute.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/admin/certificates" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:bg-slate-100"><FilePlus2 className="h-4 w-4" />Issue Certificate</Link>
          <Link href="/admin/students" className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"><Plus className="h-4 w-4" />Add Student</Link>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard icon={Users} label="Total Students" value={data.totalStudents} hint="+12%" />
        <StatCard icon={Award} label="Certificates Issued" value={data.issuedCertificates} hint="+8%" />
        <StatCard icon={BookOpen} label="Active Courses" value={data.activeCourses} hint="+2" />
        <StatCard icon={Building2} label="Pending Franchise" value={data.pendingFranchise} hint="action" />
        <StatCard icon={Mail} label="New Messages" value={data.newMessages} hint="unread" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h3 className="text-sm font-semibold text-slate-800">Recent Certificates</h3><Link href="/admin/certificates" className="text-xs font-medium text-navy hover:underline">View all</Link></div>
          <div className="divide-y divide-slate-100">
            {data.recentCertificates.length === 0 ? <p className="px-5 py-8 text-center text-sm text-slate-400">No certificates yet</p> : data.recentCertificates.map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-5 py-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><Award className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-800">{c.studentName}</p><p className="truncate text-xs text-slate-500">{c.certificateNumber} · {c.course}</p></div><Badge variant={certificateStatusVariant[c.status as keyof typeof certificateStatusVariant]}>{titleCase(c.status)}</Badge></div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800">Quick Actions</h3>
          <div className="mt-4 space-y-2">
            <Link href="/admin/certificates" className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:border-navy hover:text-navy">Issue Certificate <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/admin/students" className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:border-navy hover:text-navy">Manage Students <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/admin/courses" className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:border-navy hover:text-navy">Manage Courses <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/admin/franchise" className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:border-navy hover:text-navy">Franchise Requests <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h3 className="text-sm font-semibold text-slate-800">Recent Students</h3><Link href="/admin/students" className="text-xs font-medium text-navy hover:underline">View all</Link></div>
          <div className="divide-y divide-slate-100">
            {data.recentStudents.length === 0 ? <p className="px-5 py-8 text-center text-sm text-slate-400">No students yet</p> : data.recentStudents.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3"><span className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white" style={{ backgroundColor: s.avatarColor }}>{s.fullName.split(" ").map((p) => p[0]).slice(0, 2).join("")}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-800">{s.fullName}</p><p className="truncate text-xs text-slate-500">{s.rollNumber} · {s.course}</p></div><span className="text-xs text-slate-400">{s.batch}</span></div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h3 className="text-sm font-semibold text-slate-800">Recent Franchise Applications</h3><Link href="/admin/franchise" className="text-xs font-medium text-navy hover:underline">View all</Link></div>
          <div className="divide-y divide-slate-100">
            {data.recentApplications.length === 0 ? <p className="px-5 py-8 text-center text-sm text-slate-400">No applications</p> : data.recentApplications.map((f) => (
              <div key={f.id} className="flex items-center gap-3 px-5 py-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><Building2 className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-800">{f.name} · {f.city}</p><p className="truncate text-xs text-slate-500">{f.date}</p></div><Badge variant={franchiseStatusVariant[f.status as keyof typeof franchiseStatusVariant]}>{titleCase(f.status)}</Badge></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
