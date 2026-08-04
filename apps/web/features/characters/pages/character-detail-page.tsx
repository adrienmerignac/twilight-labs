"use client";

import type { Character, Stat } from "@twilight-labs/domain";
import { Badge } from "@repo/ui/badge";
import { Card, CardContent, CardHeader } from "@repo/ui/card";
import { EmptyState } from "@repo/ui/empty-state";
import { Metric } from "@repo/ui/metric";
import { PageHeader } from "@repo/ui/page-header";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { loadCharacters } from "../../../lib/character-storage";

const formatValue = (
  value: number,
  unit: Stat["unit"] = "flat",
): string => {
  const formatted = value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });

  return unit === "percent" ? `${formatted}%` : formatted;
};

export default function CharacterDetailPage() {
  const params = useParams<{ id: string }>();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const characters = loadCharacters();

    setCharacter(
      characters.find((candidate) => candidate.id === params.id) ?? null,
    );

    setLoaded(true);
  }, [params.id]);

  const groupedStats = useMemo(() => {
    if (!character) {
      return [];
    }

    const groups = new Map<string, Stat[]>();

    for (const stat of character.stats) {
      const category = stat.category;
      const currentStats = groups.get(category) ?? [];

      currentStats.push(stat);
      groups.set(category, currentStats);
    }

    return Array.from(groups.entries()).sort(([first], [second]) =>
      first.localeCompare(second),
    );
  }, [character]);

  if (!loaded) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <p className="text-zinc-500">Loading profile…</p>
      </main>
    );
  }

  if (!character) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <EmptyState
          title="Character not found"
          description="This profile does not exist in your local character database."
          action={
            <Link
              href="/characters"
              className="inline-flex rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Back to characters
            </Link>
          }
        />
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <PageHeader
        eyebrow={character.gameClass}
        title={character.name}
        description="Normalized character profile generated from imported game data."
        actions={
          <>
            <Link
              href="/characters"
              className="rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-zinc-100"
            >
              Back
            </Link>

            <Link
              href={`/characters/${character.id}/history`}
              className="rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-zinc-100"
            >
              View history
            </Link>

            <Link
              href={`/characters/${character.id}/evidence`}
              className="rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-zinc-100"
            >
              View evidence
            </Link>

            <Link
              href="/compare"
              className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Compare profile
            </Link>
          </>
        }
      />

      <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Combat Power"
          value={character.cp.toLocaleString("en-US")}
        />

        <Metric
          label="Statistics"
          value={String(character.stats.length)}
        />

        <Metric
          label="Source"
          value={character.metadata.source}
        />

        <Metric
          label="Confidence"
          value={`${Math.round(character.metadata.confidence * 100)}%`}
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          {groupedStats.map(([category, stats]) => (
            <Card key={category} className="overflow-hidden">
              <CardHeader className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                    Statistic group
                  </p>

                  <h2 className="mt-2 text-xl font-black capitalize">
                    {category}
                  </h2>
                </div>

                <Badge variant="research">
                  {stats.length} stats
                </Badge>
              </CardHeader>

              <div className="grid sm:grid-cols-2">
                {stats.map((stat) => (
                  <article
                    key={stat.id}
                    className="flex items-center justify-between gap-4 border-b border-zinc-200 p-5 odd:sm:border-r"
                  >
                    <div>
                      <p className="font-semibold text-zinc-950">
                        {stat.label}
                      </p>

                      <p className="mt-1 font-mono text-xs text-zinc-400">
                        {stat.id}
                      </p>
                    </div>

                    <strong className="font-mono text-lg text-zinc-950">
                      {formatValue(stat.value, stat.unit)}
                    </strong>
                  </article>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <aside className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                Data provenance
              </p>

              <h2 className="mt-2 text-xl font-black">
                Profile metadata
              </h2>
            </CardHeader>

            <CardContent className="space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                  Character ID
                </p>

                <p className="mt-2 break-all font-mono text-sm">
                  {character.id}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                  Source
                </p>

                <p className="mt-2 capitalize">
                  {character.metadata.source}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                  Last updated
                </p>

                <p className="mt-2 text-sm">
                  {character.metadata.updatedAt
                    ? new Date(
                        character.metadata.updatedAt,
                      ).toLocaleString("en-US")
                    : "Unknown"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111116] text-white">
            <CardContent>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-400">
                Research notice
              </p>

              <p className="mt-4 leading-7 text-zinc-400">
                This page displays observed values only. It does not yet infer
                build quality or recommend upgrades.
              </p>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
}
