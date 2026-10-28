import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variantStyles: Record<Variant, string> = {
  primary: "bg-indigo-500 text-white hover:bg-indigo-400 disabled:hover:bg-indigo-500",
  secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700 disabled:hover:bg-slate-800",
  ghost: "bg-transparent text-slate-300 hover:bg-slate-800 disabled:hover:bg-transparent",
  danger: "bg-rose-500 text-white hover:bg-rose-400 disabled:hover:bg-rose-500",
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${variantStyles[variant]} ${className}`}
      {...props}
    />
  );
}
