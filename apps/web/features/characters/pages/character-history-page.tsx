"use client";

import type { Character } from "@twilight-labs/domain";
import { Badge } from "@repo/ui/badge";
import { Card, CardHeader } from "@repo/ui/card";
import { EmptyState } from "@repo/ui/empty-state";
import { Metric } from "@repo/ui/metric";
import { PageHeader } from "@repo/ui/page-header";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  getCharacterHistory,
  loadCharacters,
  type CharacterSnapshot,
} from "../../../lib/character-storage";

const formatNumber = (value: number) =>
  value.toLocaleString("en-US", { maximumFractionDigits: 2 });

export default function CharacterHistoryPage() {
  const params = useParams<{ id: string }>();
  const [character, setCharacter] = useState<Character | null>(null);
  const [snapshots, setSnapshots] = useState<CharacterSnapshot[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const characters = loadCharacters();

    setCharacter(
      characters.find((candidate) => candidate.id === params.id) ?? null,
    );
    setSnapshots(getCharacterHistory(params.id));
    setLoaded(true);
  }, [params.id]);

  const progression = useMemo(() => {
    if (snapshots.length < 2) return null;

    const newest = snapshots[0];
    const oldest = snapshots[snapshots.length - 1];
    if (!newest || !oldest) return null;

    const difference = newest.character.cp - oldest.character.cp;

    return {
      difference,
      relative:
        oldest.character.cp === 0
          ? null
          : (difference / oldest.character.cp) * 100,
    };
  }, [snapshots]);

  if (!loaded) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <p className="text-zinc-500">Loading history…</p>
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
        eyebrow="Character progression"
        title={`${character.name} history`}
        description="Track meaningful profile changes each time an updated character is saved."
        actions={
          <Link
            href={`/characters/${character.id}`}
            className="rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-zinc-100"
          >
            Back to profile
          </Link>
        }
      />

      <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Snapshots" value={String(snapshots.length)} />
        <Metric label="Current CP" value={formatNumber(character.cp)} />
        <Metric
          label="Total CP gain"
          value={
            progression
              ? `${progression.difference >= 0 ? "+" : ""}${formatNumber(
                  progression.difference,
                )}`
              : "—"
          }
        />
        <Metric
          label="Relative gain"
          value={
            progression?.relative == null
              ? "—"
              : `${progression.relative >= 0 ? "+" : ""}${progression.relative.toFixed(
                  1,
                )}%`
          }
        />
      </section>

      <section className="mt-8">
        {snapshots.length === 0 ? (
          <EmptyState
            title="No history yet"
            description="Save this profile again after its values change to create a progression snapshot."
          />
        ) : (
          <Card className="overflow-hidden">
            <CardHeader>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                Timeline
              </p>
              <h2 className="mt-2 text-xl font-black">Saved snapshots</h2>
            </CardHeader>

            <div className="divide-y divide-zinc-200">
              {snapshots.map((snapshot, index) => {
                const previousSnapshot = snapshots[index + 1];
                const cpDifference = previousSnapshot
                  ? snapshot.character.cp - previousSnapshot.character.cp
                  : null;

                return (
                  <article
                    key={snapshot.snapshotId}
                    className="grid gap-5 p-5 md:grid-cols-[1fr_repeat(3,minmax(120px,180px))] md:items-center"
                  >
                    <div>
                      <p className="font-semibold text-zinc-950">
                        {new Date(snapshot.savedAt).toLocaleString("en-US")}
                      </p>
                      <p className="mt-1 font-mono text-xs text-zinc-400">
                        {snapshot.snapshotId}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                        Combat Power
                      </p>
                      <p className="mt-2 font-mono font-bold">
                        {formatNumber(snapshot.character.cp)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                        CP change
                      </p>
                      <p className="mt-2 font-mono font-bold">
                        {cpDifference === null
                          ? "Initial"
                          : `${cpDifference >= 0 ? "+" : ""}${formatNumber(
                              cpDifference,
                            )}`}
                      </p>
                    </div>

                    <div className="md:text-right">
                      <Badge variant={index === 0 ? "success" : "neutral"}>
                        {index === 0
                          ? "Current"
                          : `${snapshot.character.stats.length} stats`}
                      </Badge>
                    </div>
                  </article>
                );
              })}
            </div>
          </Card>
        )}
      </section>
    </main>
  );
}
