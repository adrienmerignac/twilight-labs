"use client";

import type { Character } from "@twilight-labs/domain";
import { Badge } from "@repo/ui/badge";
import { Card, CardContent, CardHeader } from "@repo/ui/card";
import { EmptyState } from "@repo/ui/empty-state";
import { Metric } from "@repo/ui/metric";
import { PageHeader } from "@repo/ui/page-header";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  getCharacterHistory,
  loadCharacters,
} from "../../../lib/character-storage";

export default function PlayerProfilePage() {
  const params = useParams<{ uid: string }>();
  const uid = decodeURIComponent(params.uid);

  const [character, setCharacter] = useState<Character | null>(null);
  const [snapshotCount, setSnapshotCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const matchedCharacter =
      loadCharacters().find(
        (candidate) => candidate.gameIdentity?.uid === uid,
      ) ?? null;

    setCharacter(matchedCharacter);
    setSnapshotCount(
      matchedCharacter
        ? getCharacterHistory(matchedCharacter.id).length
        : 0,
    );
    setLoaded(true);
  }, [uid]);

  if (!loaded) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <p className="text-zinc-500">Loading player…</p>
      </main>
    );
  }

  if (!character?.gameIdentity) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <EmptyState
          title="Player not found"
          description="No locally saved profile is linked to this UID."
          action={
            <Link
              href="/players"
              className="inline-flex rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Back to players
            </Link>
          }
        />
      </main>
    );
  }

  const identity = character.gameIdentity;

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <PageHeader
        eyebrow="UID-linked player"
        title={character.name}
        description="A stable local player identity connected to imported character data."
        actions={
          <>
            <Link
              href="/players"
              className="rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-zinc-100"
            >
              Back to players
            </Link>

            <Link
              href={`/characters/${character.id}`}
              className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Open character profile
            </Link>
          </>
        }
      />

      <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="UID" value={identity.uid} />
        <Metric
          label="Combat Power"
          value={character.cp.toLocaleString("en-US")}
        />
        <Metric
          label="Snapshots"
          value={String(snapshotCount)}
        />
        <Metric
          label="Statistics"
          value={String(character.stats.length)}
        />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
              Game identity
            </p>
            <h2 className="mt-2 text-xl font-black">
              Linked account metadata
            </h2>
          </CardHeader>

          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                Character
              </p>
              <p className="mt-2 font-semibold">{character.name}</p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                Class
              </p>
              <p className="mt-2 font-semibold">
                {character.gameClass}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                Region
              </p>
              <p className="mt-2">{identity.region ?? "Unknown"}</p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                Region confidence
              </p>
              <div className="mt-2">
                <Badge
                  variant={
                    identity.regionConfidence === "verified"
                      ? "success"
                      : identity.regionConfidence === "inferred"
                        ? "warning"
                        : "neutral"
                  }
                >
                  {identity.regionConfidence ?? "unknown"}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                Server
              </p>
              <p className="mt-2">{identity.server ?? "Unknown"}</p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                Server UTC offset
              </p>
              <p className="mt-2 font-mono">
                {identity.serverUtcOffset ?? "Unknown"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111116] text-white">
          <CardContent>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-400">
              Local directory
            </p>
            <p className="mt-4 leading-7 text-zinc-400">
              This route currently resolves profiles from browser storage.
              The UID structure is ready for a future shared database or
              official game integration.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
