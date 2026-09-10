"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, FileText, Award, LogOut, User, BookOpen } from "lucide-react";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    fetch("/api/student/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => { if (j.success) setStudent(j.data); else router.push("/login"); })
      .catch(() => router.push("/login"));
  }, [router]);

  async function logout() {
    // Clear student_token by calling logout (reuse admin logout but need student logout)
    await fetch("/api/auth/student/logout", { method: "POST" }).catch(() => {});
    document.cookie = "student_token=; Max-Age=0; path=/";
    // Also clear via direct cookie delete
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/student" prefetch={true} className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="logo" className="w-9 h-9 rounded-md object-contain border" />
            <div>
              <p className="text-sm font-bold text-slate-800">Student Portal</p>
              <p className="text-xs text-slate-500">{student?.fullName || "Rama Coaching"}</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/student" prefetch={true} className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-navy"><BookOpen className="w-4 h-4" /> Dashboard</Link>
            <div className="flex items-center gap-2">
              {student?.photoUrl ? <img src={student.photoUrl} alt={student.fullName} className="w-8 h-8 rounded-full object-cover border" /> : <span className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-xs">{student?.fullName?.split(" ").map((p:string)=>p[0]).slice(0,2).join("") || "S"}</span>}
              <span className="hidden sm:block text-sm font-medium text-slate-700">{student?.fullName}</span>
            </div>
            <button onClick={logout} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"><LogOut className="w-4 h-4" /> Logout</button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
