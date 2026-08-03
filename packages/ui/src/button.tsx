import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-zinc-950 text-white hover:bg-zinc-800 disabled:bg-zinc-400",
  secondary:
    "border border-zinc-300 bg-white text-zinc-950 hover:bg-zinc-100",
  ghost:
    "bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950",
  danger:
    "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
};

export function Button({
  children,
  className = "",
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        "inline-flex items-center justify-center rounded-xl px-5 py-3",
        "text-sm font-semibold transition",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200",
        "disabled:cursor-not-allowed",
        variants[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
