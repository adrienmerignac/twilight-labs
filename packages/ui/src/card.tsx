import type {
  HTMLAttributes,
  ReactNode,
} from "react";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export function Card({
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <section
      className={[
        "rounded-3xl border border-zinc-200 bg-white",
        "shadow-sm shadow-zinc-950/5",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <header className={`border-b border-zinc-200 p-6 ${className}`}>
      {children}
    </header>
  );
}

export function CardContent({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}
