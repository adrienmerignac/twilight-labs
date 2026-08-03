"use client";

import type { Character } from "@twilight-labs/domain";
import { Badge } from "@repo/ui/badge";
import { Card, CardContent, CardHeader } from "@repo/ui/card";
import { EmptyState } from "@repo/ui/empty-state";
import { Metric } from "@repo/ui/metric";
import { PageHeader } from "@repo/ui/page-header";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  getCharacterHistory,
  loadCharacters,
  type CharacterSnapshot,
} from "../../lib/character-storage";

type CharacterProgress = {
  character: Character;
  snapshots: CharacterSnapshot[];
  cpDifference: number | null;
  relativeDifference: number | null;
  latestSavedAt: string | null;
};

const formatNumber = (value: number) =>
  value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });

const formatSignedNumber = (value: number | null) => {
  if (value === null) return "—";

  return `${value >= 0 ? "+" : ""}${formatNumber(value)}`;
};

const formatSignedPercentage = (value: number | null) => {
  if (value === null) return "—";

  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
};

export default function ProgressPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCharacters(loadCharacters());
    setLoaded(true);
  }, []);

  const progress = useMemo<CharacterProgress[]>(
    () =>
      characters
        .map((character) => {
          const snapshots = getCharacterHistory(character.id);
          const newest = snapshots[0];
          const oldest = snapshots[snapshots.length - 1];

          if (!newest || !oldest || snapshots.length < 2) {
            return {
              character,
              snapshots,
              cpDifference: null,
              relativeDifference: null,
              latestSavedAt: newest?.savedAt ?? null,
            };
          }

          const cpDifference =
            newest.character.cp - oldest.character.cp;

          return {
            character,
            snapshots,
            cpDifference,
            relativeDifference:
              oldest.character.cp === 0
                ? null
                : (cpDifference / oldest.character.cp) * 100,
            latestSavedAt: newest.savedAt,
          };
        })
        .sort((first, second) => {
          const firstValue = first.relativeDifference ?? -Infinity;
          const secondValue = second.relativeDifference ?? -Infinity;

          return secondValue - firstValue;
        }),
    [characters],
  );

  const trackedCharacters = progress.filter(
    (entry) => entry.snapshots.length > 0,
  );

  const totalSnapshots = progress.reduce(
    (total, entry) => total + entry.snapshots.length,
    0,
  );

  const totalCpGain = progress.reduce(
    (total, entry) => total + (entry.cpDifference ?? 0),
    0,
  );

  if (!loaded) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <p className="text-zinc-500">Loading progress…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <PageHeader
        eyebrow="Character analytics"
        title="Progress"
        description="Review saved profile history and identify which characters changed over time."
        actions={
          <Link
            href="/import"
            className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Import an update
          </Link>
        }
      />

      <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Characters"
          value={String(characters.length)}
        />

        <Metric
          label="Tracked characters"
          value={String(trackedCharacters.length)}
        />

        <Metric
          label="Snapshots"
          value={String(totalSnapshots)}
        />

        <Metric
          label="Combined CP gain"
          value={formatSignedNumber(totalCpGain)}
        />
      </section>

      {characters.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No characters available"
            description="Import and save a character before tracking its progression."
            action={
              <Link
                href="/import"
                className="inline-flex rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
              >
                Import a character
              </Link>
            }
          />
        </div>
      ) : (
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          {progress.map((entry) => (
            <Card key={entry.character.id} className="overflow-hidden">
              <CardHeader className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                    {entry.character.gameClass}
                  </p>

                  <h2 className="mt-2 text-2xl font-black tracking-tight">
                    {entry.character.name}
                  </h2>
                </div>

                <Badge
                  variant={
                    entry.snapshots.length >= 2
                      ? "success"
                      : entry.snapshots.length === 1
                        ? "warning"
                        : "neutral"
                  }
                >
                  {entry.snapshots.length} snapshot
                  {entry.snapshots.length === 1 ? "" : "s"}
                </Badge>
              </CardHeader>

              <CardContent>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Metric
                    label="Current CP"
                    value={formatNumber(entry.character.cp)}
                  />

                  <Metric
                    label="CP gain"
                    value={formatSignedNumber(entry.cpDifference)}
                  />

                  <Metric
                    label="Relative gain"
                    value={formatSignedPercentage(
                      entry.relativeDifference,
                    )}
                  />
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-sm text-zinc-500">
                    {entry.latestSavedAt
                      ? `Last snapshot ${new Date(
                          entry.latestSavedAt,
                        ).toLocaleString("en-US")}`
                      : "No snapshot recorded yet"}
                  </p>

                  <Link
                    href={`/characters/${entry.character.id}/history`}
                    className="text-sm font-bold text-violet-700 transition hover:text-violet-900"
                  >
                    View history →
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </main>
  );
}
