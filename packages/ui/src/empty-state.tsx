import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-dashed border-zinc-300 bg-white/60 p-12 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-violet-100 text-xl text-violet-700">
        ◇
      </div>

      <h2 className="mt-5 text-xl font-bold text-zinc-950">
        {title}
      </h2>

      <p className="mx-auto mt-2 max-w-md leading-7 text-zinc-500">
        {description}
      </p>

      {action && <div className="mt-6">{action}</div>}
    </section>
  );
}
