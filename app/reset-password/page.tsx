"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, CheckCircle2, AlertTriangle } from "lucide-react";

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setVerifying(false);
      setErr("Invalid reset link. Please request a new one.");
      return;
    }
    fetch(`/api/auth/verify-reset-token?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setTokenValid(true);
        else setErr(d.error || "Invalid or expired link");
      })
      .catch(() => setErr("Network error"))
      .finally(() => setVerifying(false));
  }, [token, email]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setErr("Password must be at least 6 characters"); return; }
    if (password !== confirm) { setErr("Passwords do not match"); return; }
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });
      const data = await res.json();
      if (!data.success) { setErr(data.error || "Reset failed"); return; }
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setErr("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (verifying) {
    return (
      <div className="text-center py-10">
        <span className="w-8 h-8 border-2 border-[#1F3354] border-t-transparent rounded-full animate-spin inline-block" />
        <p className="text-sm text-slate-500 mt-3">Verifying link...</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center py-6">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h3 className="font-semibold text-slate-800">Password Reset Successful!</h3>
        <p className="text-sm text-slate-500 mt-2">Redirecting to login...</p>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="text-center py-6">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="font-semibold text-slate-800">Link Invalid or Expired</h3>
        <p className="text-sm text-slate-500 mt-2">{err}</p>
        <Link href="/forgot-password" className="inline-block mt-6 text-sm font-medium text-[#1F3354] hover:underline">Request new link →</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {err && <div className="border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{err}</div>}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input value={email} disabled className="w-full px-4 py-3 border border-slate-200 bg-slate-50 text-sm text-slate-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Min 6 characters"
            className="w-full pl-10 pr-10 py-3 border border-slate-300 focus:border-[#1F3354] focus:ring-1 focus:ring-[#1F3354]/20 outline-none text-sm"
          />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
        <input
          type={show ? "text" : "password"}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          placeholder="Repeat password"
          className="w-full px-4 py-3 border border-slate-300 focus:border-[#1F3354] focus:ring-1 focus:ring-[#1F3354]/20 outline-none text-sm"
        />
      </div>

      <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 bg-[#1F3354] hover:bg-[#162640] text-white font-semibold py-3 disabled:opacity-60">
        {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
        {loading ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden p-4">
      <div className="absolute inset-0">
        <img src="/login-bg.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#0f172a]/75" />
      </div>
      <div className="relative z-10 w-full max-w-md bg-white shadow-2xl overflow-hidden">
        <div className="bg-[#1F3354] px-8 py-7 text-center">
          <h1 className="text-xl font-bold text-white">Reset Password</h1>
          <p className="text-slate-300 text-sm mt-1">Create your new password</p>
        </div>
        <div className="px-8 py-7">
          <Suspense fallback={<div className="text-center py-8 text-sm text-slate-400">Loading...</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
