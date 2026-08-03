import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-6">
      <div>
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">
            {eyebrow}
          </p>
        )}

        <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-zinc-950">
          {title}
        </h1>

        {description && (
          <p className="mt-3 max-w-2xl leading-7 text-zinc-500">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-3">
          {actions}
        </div>
      )}
    </header>
  );
}
