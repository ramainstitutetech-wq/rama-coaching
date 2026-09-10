import type { ReactNode } from "react";
import type { BadgeVariant } from "@/lib/status";

const styles: Record<BadgeVariant, string> = {
  success: "bg-green-100 text-green-700 ring-green-600/20",
  warning: "bg-amber-100 text-amber-700 ring-amber-600/20",
  danger: "bg-red-100 text-red-700 ring-red-600/20",
  info: "bg-blue-100 text-blue-700 ring-blue-600/20",
  neutral: "bg-slate-100 text-slate-600 ring-slate-500/20",
  brand: "bg-[#EEF2F8] text-[#1F3354] ring-[#1F3354]/20",
};

export function Badge({
  variant = "neutral",
  children,
}: {
  variant?: BadgeVariant;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
