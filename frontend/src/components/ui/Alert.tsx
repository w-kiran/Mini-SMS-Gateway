import type { ReactNode } from "react";

type Variant = "error" | "success" | "info";

const variantStyles: Record<Variant, string> = {
  error: "border-rose-500/30 bg-rose-500/10 text-rose-200",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-200",
};

export function Alert({
  variant = "info",
  title,
  children,
}: {
  variant?: Variant;
  title?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`rounded-lg border px-3 py-2 text-sm ${variantStyles[variant]}`}>
      {title && <p className="font-medium">{title}</p>}
      {children}
    </div>
  );
}
