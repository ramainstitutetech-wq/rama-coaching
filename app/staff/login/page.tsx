"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Eye, EyeOff, LogIn, Briefcase, ArrowRight } from "lucide-react";

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Invalid credentials");
        return;
      }
      if (data.data?.role !== "staff") {
        setError("This portal is for staff accounts only.");
        // Clear the cookie we just set
        await fetch("/api/auth/logout", { method: "POST" });
        return;
      }
      router.push("/staff");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0">
        <img src="/login-bg.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px]" />
      </div>

      {/* Back link */}
      <Link href="/" className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-white/95 backdrop-blur px-3 py-2 rounded-lg shadow-lg hover:bg-white transition">
        <img src="/logo.jpeg" alt="Rama" className="w-8 h-8 rounded-md object-contain" />
        <span className="text-sm font-bold text-slate-800 hidden sm:block">Rama Coaching</span>
      </Link>

      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#1F3354] px-8 py-7 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 flex items-center justify-center mb-3 border border-white/20">
            <Briefcase className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Staff Login</h1>
          <p className="text-slate-300 text-sm mt-1">Rama Coaching Center — Staff Portal</p>
        </div>

        {/* Form */}
        <div className="px-8 py-7">
          {error && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="staff@ramacoaching.com"
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1F3354]/20 focus:border-[#1F3354] outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <Link href="/forgot-password" className="text-xs font-medium text-[#1F3354] hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1F3354]/20 focus:border-[#1F3354] outline-none text-sm"
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#1F3354] hover:bg-[#162640] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
            >
              {loading
                ? <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in…</>
                : <><LogIn className="w-4 h-4" /> Sign In</>}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2 text-center text-xs text-slate-400">
            <Link href="/admin/login" className="inline-flex items-center justify-center gap-1 text-slate-500 hover:text-[#1F3354]">
              Login as Admin <ArrowRight className="w-3 h-3" />
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center gap-1 text-slate-500 hover:text-[#1F3354]">
              Student Login <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
