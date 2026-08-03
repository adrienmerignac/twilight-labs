"use client";

import {
  analyzeProfileQuality,
  type ProfileQualityReport,
} from "@twilight-labs/analysis";
import type { Character } from "@twilight-labs/domain";
import { Badge } from "@repo/ui/badge";
import { Card, CardContent, CardHeader } from "@repo/ui/card";
import { EmptyState } from "@repo/ui/empty-state";
import { Metric } from "@repo/ui/metric";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  getCharacterHistory,
  loadCharacters,
} from "../lib/character-storage";

type CharacterSummary = {
  character: Character;
  quality: ProfileQualityReport;
  snapshotCount: number;
};

const formatNumber = (value: number) =>
  value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });

export default function DashboardPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCharacters(loadCharacters());
    setLoaded(true);
  }, []);

  const summaries = useMemo<CharacterSummary[]>(
    () =>
      characters
        .map((character) => ({
          character,
          quality: analyzeProfileQuality(character),
          snapshotCount: getCharacterHistory(character.id).length,
        }))
        .sort(
          (first, second) =>
            second.character.cp - first.character.cp,
        ),
    [characters],
  );

  const linkedCount = summaries.filter(
    ({ character }) => character.gameIdentity?.uid,
  ).length;

  const researchReadyCount = summaries.filter(
    ({ quality }) => quality.score >= 80,
  ).length;

  const totalSnapshots = summaries.reduce(
    (total, summary) => total + summary.snapshotCount,
    0,
  );

  const strongestCharacter = summaries[0]?.character;

  const latestUpdates = useMemo(
    () =>
      summaries
        .map((summary) => ({
          ...summary,
          updatedAt: summary.character.metadata.updatedAt,
        }))
        .filter(
          (
            summary,
          ): summary is CharacterSummary & { updatedAt: string } =>
            Boolean(summary.updatedAt),
        )
        .sort(
          (first, second) =>
            new Date(second.updatedAt).getTime() -
            new Date(first.updatedAt).getTime(),
        )
        .slice(0, 4),
    [summaries],
  );

  if (!loaded) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <p className="text-zinc-500">Loading dashboard…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <section className="overflow-hidden rounded-[32px] bg-[#111116] px-7 py-10 text-white shadow-xl shadow-zinc-950/10 md:px-12 md:py-14">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-400">
              Twilight Labs Alpha
            </p>

            <h1 className="mt-5 text-4xl font-black tracking-[-0.045em] md:text-6xl">
              Understand the game.
              <br />
              Do not guess.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-400 md:text-lg">
              A research platform for analyzing Ragnarok: Twilight Global
              mechanics through structured, traceable player data.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/import"
                className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200"
              >
                Import a profile
              </Link>

              <Link
                href="/compare"
                className="rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Compare characters
              </Link>
            </div>
          </div>

          {strongestCharacter && (
            <div className="min-w-[260px] rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                Highest saved CP
              </p>

              <p className="mt-4 text-2xl font-black">
                {strongestCharacter.name}
              </p>

              <p className="mt-1 text-sm text-zinc-400">
                {strongestCharacter.gameClass}
              </p>

              <p className="mt-5 font-mono text-3xl font-black text-violet-300">
                {formatNumber(strongestCharacter.cp)}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Saved profiles"
          value={String(summaries.length)}
        />

        <Metric
          label="UID-linked"
          value={String(linkedCount)}
        />

        <Metric
          label="Research ready"
          value={String(researchReadyCount)}
        />

        <Metric
          label="Snapshots"
          value={String(totalSnapshots)}
        />
      </section>

      {summaries.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No player data yet"
            description="Import your first character profile to activate the live dashboard."
            action={
              <Link
                href="/import"
                className="inline-flex rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
              >
                Start importing
              </Link>
            }
          />
        </div>
      ) : (
        <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                  Character database
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Saved profiles
                </h2>
              </div>

              <Link
                href="/characters"
                className="text-sm font-bold text-violet-700 hover:text-violet-900"
              >
                View all →
              </Link>
            </CardHeader>

            <div className="divide-y divide-zinc-200">
              {summaries.slice(0, 5).map((summary) => (
                <article
                  key={summary.character.id}
                  className="grid gap-4 p-5 md:grid-cols-[1fr_repeat(3,minmax(110px,150px))] md:items-center"
                >
                  <div>
                    <p className="font-bold text-zinc-950">
                      {summary.character.name}
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      {summary.character.gameClass}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
                      Combat Power
                    </p>

                    <p className="mt-2 font-mono font-semibold">
                      {formatNumber(summary.character.cp)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
                      Quality
                    </p>

                    <div className="mt-2">
                      <Badge
                        variant={
                          summary.quality.score >= 80
                            ? "success"
                            : summary.quality.score >= 55
                              ? "warning"
                              : "danger"
                        }
                      >
                        {summary.quality.score}%
                      </Badge>
                    </div>
                  </div>

                  <div className="md:text-right">
                    <Link
                      href={`/characters/${summary.character.id}`}
                      className="text-sm font-bold text-violet-700 hover:text-violet-900"
                    >
                      Open →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </Card>

          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                  Recent activity
                </p>

                <h2 className="mt-2 text-xl font-black">
                  Latest profile updates
                </h2>
              </CardHeader>

              <CardContent className="flex flex-col gap-3">
                {latestUpdates.length === 0 ? (
                  <p className="text-sm leading-6 text-zinc-500">
                    No timestamped profile updates are available yet.
                  </p>
                ) : (
                  latestUpdates.map((summary) => (
                    <div
                      key={summary.character.id}
                      className="rounded-2xl bg-zinc-50 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold">
                            {summary.character.name}
                          </p>

                          <p className="mt-1 text-xs text-zinc-500">
                            {new Date(
                              summary.updatedAt,
                            ).toLocaleString("en-US")}
                          </p>
                        </div>

                        <Badge variant="neutral">
                          {summary.snapshotCount} snapshots
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="bg-violet-600 text-white">
              <CardContent>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-200">
                  Next milestone
                </p>

                <h2 className="mt-4 text-2xl font-black">
                  Expand the evidence base
                </h2>

                <p className="mt-3 leading-7 text-violet-100">
                  More UID-linked profiles and repeated snapshots will make
                  scaling research significantly more reliable.
                </p>

                <Link
                  href="/quality"
                  className="mt-6 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-violet-700"
                >
                  Review data quality
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </main>
  );
}
