"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, LogIn, GraduationCap, Briefcase, ShieldCheck } from "lucide-react";

type Role = "student" | "staff" | "admin";

const ROLES: { id: Role; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "student", label: "Student",  icon: GraduationCap, desc: "Student portal" },
  { id: "staff",   label: "Staff",    icon: Briefcase,     desc: "Staff panel"    },
  { id: "admin",   label: "Admin",    icon: ShieldCheck,   desc: "Admin panel"    },
];

const PLACEHOLDER: Record<Role, string> = {
  student: "student@example.com",
  staff:   "staff@ramacoaching.com",
  admin:   "admin@ramacoaching.com",
};

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole]         = useState<Role>("student");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const apiUrl    = role === "student" ? "/api/auth/student/login" : "/api/auth/login";
      const redirectTo = role === "student" ? "/student" : role === "staff" ? "/staff" : "/admin";

      const res  = await fetch(apiUrl, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!data.success) { setError(data.error || "Invalid credentials"); return; }

      if (role === "staff" && data.data?.role !== "staff") {
        setError("This account is not a staff account.");
        await fetch("/api/auth/logout", { method: "POST" });
        return;
      }
      if (role === "admin" && data.data?.role !== "admin") {
        setError("This account is not an admin account.");
        await fetch("/api/auth/logout", { method: "POST" });
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden p-4">
      {/* Background */}
      <div className="absolute inset-0">
        <img src="/login-bg.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#0f172a]/75" />
      </div>

      <div className="relative z-10 w-full max-w-3xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden shadow-2xl">

        {/* ── LEFT — Branding ───────────────────────────── */}
        <div className="hidden lg:flex flex-col justify-between bg-[#1F3354] px-9 py-10">

          {/* Logo + name */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 bg-white flex items-center justify-center shrink-0">
                <img src="/logo.jpeg" alt="Rama" className="h-10 w-10 object-contain" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Rama Coaching Center</p>
                <p className="text-xs text-slate-400">And Computer Education Center</p>
              </div>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed mb-10">
              Sign in to access your portal. Students, staff, and admins each have their own dedicated section.
            </p>

            {/* Feature list */}
            <ul className="space-y-3">
              {[
                "Government Recognised Certificates",
                "Instant Online Verification",
                "Secure & Fast Student Portal",
                "55+ Centres Across Uttar Pradesh",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <p className="text-xs text-slate-600">© 2026 Rama Coaching Center, Fatehpur, UP</p>
        </div>

        {/* ── RIGHT — Form ──────────────────────────────── */}
        <div className="bg-white flex flex-col justify-center px-7 py-9 sm:px-9">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-7">
            <img src="/logo.jpeg" alt="Rama" className="h-9 w-9 object-contain border border-slate-200" />
            <p className="text-sm font-semibold text-slate-800">Rama Coaching Center</p>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-800">Sign in</h2>
            <p className="text-sm text-slate-400 mt-0.5">Choose your role and enter your credentials</p>
          </div>

          {/* ── Role tabs ── */}
          <div className="mb-6">
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Sign in as</p>
            <div className="grid grid-cols-3 border border-slate-200 divide-x divide-slate-200">
              {ROLES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => { setRole(id); setError(""); setEmail(""); }}
                  className={`flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
                    role === id
                      ? "bg-[#1F3354] text-white"
                      : "bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={PLACEHOLDER[role]}
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-300 focus:border-[#1F3354] focus:ring-1 focus:ring-[#1F3354]/20 outline-none text-sm bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm text-slate-600">Password</label>
                <Link href="/forgot-password" className="text-xs font-medium text-[#1F3354] hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 border border-slate-300 focus:border-[#1F3354] focus:ring-1 focus:ring-[#1F3354]/20 outline-none text-sm transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm text-white transition-colors mt-1 disabled:opacity-60 ${
                role === "student" ? "bg-emerald-600 hover:bg-emerald-700" :
                role === "staff"   ? "bg-[#1F3354] hover:bg-[#162640]"   :
                                     "bg-red-700 hover:bg-red-800"
              }`}
            >
              {loading ? (
                <><span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in…</>
              ) : (
                <><LogIn className="h-4 w-4" /> Sign in as {ROLES.find(r => r.id === role)?.label}</>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-400 space-y-1">
            <p>
              By signing in, you agree to our{" "}
              <Link href="/contact" className="text-slate-600 hover:underline">Terms of Use</Link>
            </p>
            <p>
              Need help?{" "}
              <Link href="/contact" className="font-medium text-[#1F3354] hover:underline">Contact Support</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
