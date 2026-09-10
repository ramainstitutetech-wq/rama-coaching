"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    setMsg("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!data.success) {
        setErr(data.error || "Failed to send reset link");
        return;
      }
      setSent(true);
      setMsg(data.message || "Reset link sent to your email.");
    } catch {
      setErr("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden p-4">
      <div className="absolute inset-0">
        <img src="/login-bg.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#0f172a]/75" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-white shadow-2xl overflow-hidden">
        <div className="bg-[#1F3354] px-8 py-7 text-center">
          <h1 className="text-xl font-bold text-white">Forgot Password</h1>
          <p className="text-slate-300 text-sm mt-1">Rama Coaching Center</p>
        </div>

        <div className="px-8 py-7">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-800">Check your email</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                {msg} <br />
                Link <strong>15 minutes</strong> ke liye valid hai. Spam folder bhi check karein.
              </p>
              <Link href="/login" className="inline-flex items-center gap-2 mt-6 text-sm font-medium text-[#1F3354] hover:underline">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500 mb-6">
                Apna registered email enter karein. Hum aapko password reset link bhej denge (Brevo se 1-2 sec me).
              </p>

              {err && (
                <div className="mb-4 border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{err}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Account Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["student", "staff", "admin"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`py-2.5 text-xs font-medium capitalize border transition-colors ${role === r ? "bg-[#1F3354] text-white border-[#1F3354]" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="your@email.com"
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 focus:border-[#1F3354] focus:ring-1 focus:ring-[#1F3354]/20 outline-none text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#1F3354] hover:bg-[#162640] text-white font-semibold py-3 transition-colors disabled:opacity-60"
                >
                  {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/login" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-[#1F3354]">
                  <ArrowLeft className="w-3 h-3" /> Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
