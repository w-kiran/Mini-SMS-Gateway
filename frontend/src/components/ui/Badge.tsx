import type { ReactNode } from "react";
import type { MessageStatus } from "@/lib/types";

const statusStyles: Record<MessageStatus, string> = {
  pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  sent: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  failed: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export function StatusBadge({ status }: { status: MessageStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300 ${className}`}
    >
      {children}
    </span>
  );
}
