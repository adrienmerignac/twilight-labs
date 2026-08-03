"use client";

import { analyzeTwilightStats } from "@twilight-labs/game-twilight";
import { Badge } from "@repo/ui/badge";
import { Card, CardContent, CardHeader } from "@repo/ui/card";
import { EmptyState } from "@repo/ui/empty-state";
import { Metric } from "@repo/ui/metric";
import { PageHeader } from "@repo/ui/page-header";
import { useMemo, useState } from "react";

const DEFAULT_INPUT = `HP 167M
ATK 13.36M
CRIT RATE 49.47%
UNKNOWN POWER 42%
Malformed example`;

const reasonLabels = {
  malformed: "Malformed line",
  "unknown-label": "Unknown label",
  "invalid-value": "Invalid value",
} as const;

export default function DiagnosticsPage() {
  const [rawInput, setRawInput] = useState(DEFAULT_INPUT);

  const analysis = useMemo(
    () => analyzeTwilightStats(rawInput),
    [rawInput],
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <PageHeader
        eyebrow="Parser research"
        title="Import diagnostics"
        description="Inspect recognized and unrecognized statistic lines before adding them to the Twilight mapping."
      />

      <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Input lines"
          value={String(analysis.totalLines)}
        />

        <Metric
          label="Recognized"
          value={String(analysis.recognized.length)}
        />

        <Metric
          label="Unrecognized"
          value={String(analysis.unrecognized.length)}
        />

        <Metric
          label="Recognition rate"
          value={`${analysis.recognitionRate.toFixed(1)}%`}
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
              Raw input
            </p>

            <h2 className="mt-2 text-xl font-black">
              Statistic lines
            </h2>
          </CardHeader>

          <CardContent>
            <textarea
              value={rawInput}
              onChange={(event) => setRawInput(event.target.value)}
              spellCheck={false}
              className="min-h-[580px] w-full resize-y rounded-2xl border border-zinc-300 bg-zinc-50 p-5 font-mono text-sm leading-7 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                  Parser output
                </p>

                <h2 className="mt-2 text-xl font-black">
                  Recognized statistics
                </h2>
              </div>

              <Badge variant="success">
                {analysis.recognized.length}
              </Badge>
            </CardHeader>

            {analysis.recognized.length === 0 ? (
              <CardContent>
                <EmptyState
                  title="No recognized statistics"
                  description="Paste known Twilight statistic labels to inspect the normalized output."
                />
              </CardContent>
            ) : (
              <div className="divide-y divide-zinc-200">
                {analysis.recognized.map((stat, index) => (
                  <article
                    key={`${stat.id}-${index}`}
                    className="flex items-center justify-between gap-4 p-5"
                  >
                    <div>
                      <p className="font-semibold text-zinc-950">
                        {stat.label}
                      </p>

                      <p className="mt-1 font-mono text-xs text-zinc-400">
                        {stat.id} · {stat.category}
                      </p>
                    </div>

                    <strong className="font-mono text-lg">
                      {stat.value.toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                      })}
                      {stat.unit === "percent" ? "%" : ""}
                    </strong>
                  </article>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
                  Mapping backlog
                </p>

                <h2 className="mt-2 text-xl font-black">
                  Unrecognized lines
                </h2>
              </div>

              <Badge
                variant={
                  analysis.unrecognized.length === 0
                    ? "success"
                    : "warning"
                }
              >
                {analysis.unrecognized.length}
              </Badge>
            </CardHeader>

            {analysis.unrecognized.length === 0 ? (
              <CardContent>
                <p className="leading-7 text-zinc-500">
                  Every non-empty input line was recognized.
                </p>
              </CardContent>
            ) : (
              <div className="divide-y divide-zinc-200">
                {analysis.unrecognized.map((entry, index) => (
                  <article
                    key={`${entry.line}-${index}`}
                    className="p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <code className="break-all text-sm font-semibold text-zinc-950">
                        {entry.line}
                      </code>

                      <Badge variant="warning">
                        {reasonLabels[entry.reason]}
                      </Badge>
                    </div>

                    {entry.label && (
                      <p className="mt-2 text-sm text-zinc-500">
                        Candidate label:{" "}
                        <code className="font-semibold">
                          {entry.label}
                        </code>
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </Card>
        </div>
      </section>
    </main>
  );
}
