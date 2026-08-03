import type { ReactNode } from "react";

type BadgeVariant =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "research";

const variants: Record<BadgeVariant, string> = {
  neutral: "bg-zinc-100 text-zinc-700",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
  research: "bg-violet-100 text-violet-800",
};

export function Badge({
  children,
  variant = "neutral",
}: {
  children: ReactNode;
  variant?: BadgeVariant;
}) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-3 py-1.5",
        "text-xs font-bold",
        variants[variant],
      ].join(" ")}
    >
      {children}
    </span>
  );
}
