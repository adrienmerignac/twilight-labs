export function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
        {label}
      </p>

      <p className="mt-2 font-mono text-xl font-bold text-zinc-950">
        {value}
      </p>

      {detail && (
        <p className="mt-1 text-xs text-zinc-500">
          {detail}
        </p>
      )}
    </div>
  );
}
