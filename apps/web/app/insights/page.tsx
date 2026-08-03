"use client";

import {
  analyzeCharacterScaling,
  type ScalingInsight,
} from "@twilight-labs/analysis";
import type { Character, Stat } from "@twilight-labs/domain";
import { Badge } from "@repo/ui/badge";
import { Card, CardContent, CardHeader } from "@repo/ui/card";
import { EmptyState } from "@repo/ui/empty-state";
import { Metric } from "@repo/ui/metric";
import { PageHeader } from "@repo/ui/page-header";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { loadCharacters } from "../../lib/character-storage";

const interpretationLabels: Record<
  ScalingInsight["interpretation"],
  string
> = {
  "scales-faster-than-cp": "Faster than CP",
  "tracks-cp": "Tracks CP",
  "scales-slower-than-cp": "Slower than CP",
};

const interpretationVariants: Record<
  ScalingInsight["interpretation"],
  "success" | "neutral" | "warning"
> = {
  "scales-faster-than-cp": "success",
  "tracks-cp": "neutral",
  "scales-slower-than-cp": "warning",
};

const formatValue = (
  value: number,
  unit: Stat["unit"],
): string => {
  const formatted = value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });

  return unit === "percent" ? `${formatted}%` : formatted;
};

export default function InsightsPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [referenceId, setReferenceId] = useState("");
  const [comparedId, setComparedId] = useState("");

  useEffect(() => {
    const storedCharacters = loadCharacters();

    setCharacters(storedCharacters);
    setReferenceId(storedCharacters[0]?.id ?? "");
    setComparedId(storedCharacters[1]?.id ?? "");
  }, []);

  const reference = characters.find(
    (character) => character.id === referenceId,
  );

  const compared = characters.find(
    (character) => character.id === comparedId,
  );

  const analysis = useMemo(() => {
    if (!reference || !compared || reference.id === compared.id) {
      return null;
    }

    return analyzeCharacterScaling(reference, compared);
  }, [reference, compared]);

  const fasterCount =
    analysis?.insights.filter(
      (insight) =>
        insight.interpretation === "scales-faster-than-cp",
    ).length ?? 0;

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <PageHeader
        eyebrow="Research-safe analysis"
        title="Scaling insights"
        description="Compare statistic growth against combat-power growth without claiming that higher values are automatically better."
        actions={
          <Link
            href="/compare"
            className="rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-zinc-100"
          >
            Open raw comparison
          </Link>
        }
      />

      {characters.length < 2 ? (
        <div className="mt-10">
          <EmptyState
            title="Two profiles are required"
            description="Save at least two characters before analyzing scaling."
            action={
              <Link
                href="/import"
                className="inline-flex rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
              >
                Import another character
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <Card className="mt-10">
            <CardContent className="grid gap-5 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-zinc-700">
                  Reference profile
                </span>
                <select
                  value={referenceId}
                  onChange={(event) =>
                    setReferenceId(event.target.value)
                  }
                  className="rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                >
                  {characters.map((character) => (
                    <option key={character.id} value={character.id}>
                      {character.name} — {character.gameClass}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-zinc-700">
                  Compared profile
                </span>
                <select
                  value={comparedId}
                  onChange={(event) =>
                    setComparedId(event.target.value)
                  }
                  className="rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                >
                  {characters.map((character) => (
                    <option key={character.id} value={character.id}>
                      {character.name} — {character.gameClass}
                    </option>
                  ))}
                </select>
              </label>
            </CardContent>
          </Card>

          {referenceId === comparedId && (
            <div className="mt-6">
              <Badge variant="warning">
                Select two different profiles.
              </Badge>
            </div>
          )}

          {analysis && reference && compared && (
            <>
              <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Metric
                  label="Reference CP"
                  value={reference.cp.toLocaleString("en-US")}
                  detail={reference.name}
                />
                <Metric
                  label="Compared CP"
                  value={compared.cp.toLocaleString("en-US")}
                  detail={compared.name}
                />
                <Metric
                  label="CP ratio"
                  value={`${analysis.cpRatio.toFixed(2)}×`}
                  detail="Compared / reference"
                />
                <Metric
                  label="Faster-scaling stats"
                  value={String(fasterCount)}
                  detail="Relative to CP growth"
                />
              </section>

              <Card className="mt-6 overflow-hidden">
                <CardHeader>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                    Scaling index
                  </p>
                  <h2 className="mt-2 text-xl font-black">
                    Normalized stat growth
                  </h2>
                  <p className="mt-3 max-w-3xl leading-7 text-zinc-500">
                    An index of 1.00 means the statistic grew at the same rate
                    as combat power. This is descriptive evidence, not an
                    optimization recommendation.
                  </p>
                </CardHeader>

                <div className="divide-y divide-zinc-200">
                  {analysis.insights.map((insight) => (
                    <article
                      key={insight.statId}
                      className="grid gap-4 p-5 lg:grid-cols-[1.3fr_repeat(4,minmax(130px,1fr))] lg:items-center"
                    >
                      <div>
                        <p className="font-semibold text-zinc-950">
                          {insight.label}
                        </p>
                        <p className="mt-1 font-mono text-xs text-zinc-400">
                          {insight.statId}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
                          Reference
                        </p>
                        <p className="mt-2 font-mono">
                          {formatValue(
                            insight.referenceValue,
                            insight.unit,
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
                          Compared
                        </p>
                        <p className="mt-2 font-mono">
                          {formatValue(
                            insight.comparedValue,
                            insight.unit,
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
                          Stat ratio
                        </p>
                        <p className="mt-2 font-mono">
                          {insight.statRatio.toFixed(2)}×
                        </p>
                      </div>

                      <div className="lg:text-right">
                        <p className="mb-2 font-mono text-lg font-bold">
                          {insight.scalingIndex.toFixed(2)}
                        </p>
                        <Badge
                          variant={
                            interpretationVariants[
                              insight.interpretation
                            ]
                          }
                        >
                          {
                            interpretationLabels[
                              insight.interpretation
                            ]
                          }
                        </Badge>
                      </div>
                    </article>
                  ))}
                </div>
              </Card>

              <Card className="mt-6 bg-[#111116] text-white">
                <CardContent>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-400">
                    Interpretation boundary
                  </p>
                  <p className="mt-4 max-w-4xl leading-7 text-zinc-400">
                    A faster-scaling statistic may result from class,
                    progression systems, equipment, spending, or hidden
                    mechanics. It does not prove damage efficiency or upgrade
                    priority.
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </main>
  );
}
