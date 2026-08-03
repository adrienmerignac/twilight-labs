"use client";

import type { Character } from "@twilight-labs/domain";
import { Badge } from "@repo/ui/badge";
import { Card, CardContent } from "@repo/ui/card";
import { EmptyState } from "@repo/ui/empty-state";
import { Metric } from "@repo/ui/metric";
import { PageHeader } from "@repo/ui/page-header";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { loadCharacters } from "../../lib/character-storage";

export default function PlayersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setCharacters(loadCharacters());
  }, []);

  const linkedCharacters = useMemo(
    () => characters.filter((character) => character.gameIdentity?.uid),
    [characters],
  );

  const filteredCharacters = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return linkedCharacters;
    }

    return linkedCharacters.filter((character) => {
      const identity = character.gameIdentity;

      return [
        character.name,
        character.gameClass,
        identity?.uid,
        identity?.server,
        identity?.region,
      ]
        .filter(Boolean)
        .some((value) =>
          value?.toLowerCase().includes(normalizedQuery),
        );
    });
  }, [linkedCharacters, query]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <PageHeader
        eyebrow="UID directory"
        title="Players"
        description="Find locally linked profiles by UID, character name, server, region, or class."
        actions={
          <Link
            href="/identity"
            className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Link a game UID
          </Link>
        }
      />

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        <Metric
          label="Saved profiles"
          value={String(characters.length)}
        />
        <Metric
          label="UID-linked profiles"
          value={String(linkedCharacters.length)}
        />
        <Metric
          label="Unlinked profiles"
          value={String(characters.length - linkedCharacters.length)}
        />
      </section>

      {linkedCharacters.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No UID-linked players"
            description="Link a saved character to its in-game UID before using the player directory."
            action={
              <Link
                href="/identity"
                className="inline-flex rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
              >
                Link a profile
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-8">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search UID, character, server, region, or class…"
              className="w-full rounded-2xl border border-zinc-300 bg-white px-5 py-4 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          {filteredCharacters.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="No matching players"
                description="Try another UID, character name, class, server, or region."
              />
            </div>
          ) : (
            <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredCharacters.map((character) => {
                const identity = character.gameIdentity;

                if (!identity) {
                  return null;
                }

                return (
                  <Card
                    key={identity.uid}
                    className="overflow-hidden transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <CardContent>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                            {character.gameClass}
                          </p>
                          <h2 className="mt-2 text-2xl font-black tracking-tight">
                            {character.name}
                          </h2>
                        </div>

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

                      <dl className="mt-6 space-y-4">
                        <div>
                          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                            UID
                          </dt>
                          <dd className="mt-2 break-all font-mono font-semibold">
                            {identity.uid}
                          </dd>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <dt className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                              Region
                            </dt>
                            <dd className="mt-2">
                              {identity.region ?? "Unknown"}
                            </dd>
                          </div>

                          <div>
                            <dt className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                              Server
                            </dt>
                            <dd className="mt-2">
                              {identity.server ?? "Unknown"}
                            </dd>
                          </div>
                        </div>

                        <div>
                          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                            Combat Power
                          </dt>
                          <dd className="mt-2 font-mono font-semibold">
                            {character.cp.toLocaleString("en-US")}
                          </dd>
                        </div>
                      </dl>

                      <div className="mt-6">
                        <Link
                          href={`/players/${encodeURIComponent(identity.uid)}`}
                          className="text-sm font-bold text-violet-700 transition hover:text-violet-900"
                        >
                          Open player profile →
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </section>
          )}
        </>
      )}
    </main>
  );
}
