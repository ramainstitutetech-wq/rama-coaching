// Reusable skeleton components for loading states

function Bone({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-slate-200 ${className}`} />
  );
}

// ── Stat card skeleton (dashboard) ────────────────────────────────────────────
export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <Bone className="h-11 w-11 rounded-lg" />
        <Bone className="h-4 w-16" />
      </div>
      <Bone className="h-8 w-20 mt-4" />
      <Bone className="h-4 w-28" />
    </div>
  );
}

// ── Table row skeleton ────────────────────────────────────────────────────────
export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Bone className={`h-4 ${i === 0 ? "w-32" : i === cols - 1 ? "w-16" : "w-24"}`} />
        </td>
      ))}
    </tr>
  );
}

// ── Card skeleton (courses, mock-tests, etc.) ─────────────────────────────────
export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <Bone className="h-1.5 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Bone className="h-5 w-3/4" />
          <Bone className="h-5 w-14 rounded-full" />
        </div>
        <Bone className="h-3.5 w-1/3" />
        <Bone className="h-3 w-full" />
        <Bone className="h-3 w-4/5" />
        <div className="flex gap-2 pt-2">
          <Bone className="h-7 w-16 rounded-md" />
          <Bone className="h-7 w-16 rounded-md" />
          <Bone className="h-7 w-16 rounded-md" />
        </div>
      </div>
    </div>
  );
}

// ── Dashboard skeleton ────────────────────────────────────────────────────────
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Hero banner */}
      <Bone className="h-40 w-full rounded-xl" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <Bone className="h-11 w-11 rounded-lg" />
              <Bone className="h-4 w-12" />
            </div>
            <Bone className="h-8 w-16" />
            <Bone className="h-3.5 w-24" />
          </div>
        ))}
      </div>

      {/* Two-col section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <Bone className="h-5 w-36" />
            <Bone className="h-4 w-16" />
          </div>
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <Bone className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Bone className="h-3.5 w-32" />
                  <Bone className="h-3 w-48" />
                </div>
                <Bone className="h-5 w-14 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <Bone className="h-5 w-28" />
          </div>
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <Bone className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Bone className="h-3.5 w-24" />
                  <Bone className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Students / list page skeleton ─────────────────────────────────────────────
export function StudentListSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Bone className="h-6 w-28" />
          <Bone className="h-4 w-64" />
        </div>
        <Bone className="h-9 w-28 rounded-lg" />
      </div>
      {/* Filters */}
      <div className="flex gap-3">
        <Bone className="h-9 flex-1 rounded-lg" />
        <Bone className="h-9 w-32 rounded-lg" />
        <Bone className="h-9 w-32 rounded-lg" />
      </div>
      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-4 py-3 grid grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Bone key={i} className="h-3.5" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border-b border-slate-50 px-4 py-3.5 grid grid-cols-6 gap-4 items-center">
            <div className="flex items-center gap-2.5">
              <Bone className="h-8 w-8 rounded-full shrink-0" />
              <Bone className="h-3.5 flex-1" />
            </div>
            <Bone className="h-3.5 w-24" />
            <Bone className="h-3.5 w-20" />
            <Bone className="h-3.5 w-16" />
            <Bone className="h-5 w-14 rounded-full" />
            <div className="flex gap-1.5">
              <Bone className="h-7 w-7 rounded-md" />
              <Bone className="h-7 w-7 rounded-md" />
              <Bone className="h-7 w-7 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Cards grid skeleton (courses, mock-tests, testimonials, etc.) ──────────────
export function CardsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Bone className="h-6 w-28" />
          <Bone className="h-4 w-56" />
        </div>
        <Bone className="h-9 w-28 rounded-lg" />
      </div>
      {/* Filters */}
      <div className="flex gap-3">
        <Bone className="h-9 flex-1 rounded-lg" />
        <Bone className="h-9 w-32 rounded-lg" />
      </div>
      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <Bone className="h-1.5 w-full rounded-none" />
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <Bone className="h-4 w-3/5" />
                <Bone className="h-5 w-14 rounded-full" />
              </div>
              <Bone className="h-3 w-2/5" />
              <Bone className="h-3 w-full" />
              <Bone className="h-3 w-4/5" />
              <div className="flex gap-2 pt-1">
                <Bone className="h-7 w-14 rounded-md" />
                <Bone className="h-7 w-14 rounded-md" />
                <Bone className="h-7 w-14 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Certificates page skeleton ────────────────────────────────────────────────
export function CertificatesPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Bone className="h-6 w-32" />
          <Bone className="h-4 w-60" />
        </div>
        <Bone className="h-9 w-36 rounded-lg" />
      </div>
      <div className="flex gap-3">
        <Bone className="h-9 flex-1 rounded-lg" />
        <Bone className="h-9 w-32 rounded-lg" />
        <Bone className="h-9 w-32 rounded-lg" />
      </div>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-4 py-3 grid grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => <Bone key={i} className="h-3.5" />)}
        </div>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="border-b border-slate-50 px-4 py-3.5 grid grid-cols-7 gap-3 items-center">
            <Bone className="h-3.5 w-28" />
            <Bone className="h-3.5 w-24" />
            <Bone className="h-3.5 w-20" />
            <Bone className="h-3.5 w-20" />
            <Bone className="h-3.5 w-20" />
            <Bone className="h-5 w-14 rounded-full" />
            <div className="flex gap-1.5">
              <Bone className="h-7 w-7 rounded-md" />
              <Bone className="h-7 w-7 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
