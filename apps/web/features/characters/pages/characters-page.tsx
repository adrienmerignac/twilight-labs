"use client";

import type { Character } from "@twilight-labs/domain";
import { Button } from "@repo/ui/button";
import { Card, CardContent } from "@repo/ui/card";
import { EmptyState } from "@repo/ui/empty-state";
import { Metric } from "@repo/ui/metric";
import { PageHeader } from "@repo/ui/page-header";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  deleteCharacter,
  loadCharacters,
} from "../../../lib/character-storage";

const formatNumber = (value: number) =>
  value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    setCharacters(loadCharacters());
  }, []);

  const handleDelete = (characterId: string) => {
    setCharacters(deleteCharacter(characterId));
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <PageHeader
        eyebrow="Character database"
        title="Characters"
        description="Browse locally saved profiles and inspect their normalized statistics."
        actions={
          <Link
            href="/import"
            className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Import a character
          </Link>
        }
      />

      {characters.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="No saved characters"
            description="Import your first profile to start building your character database."
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
        <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {characters.map((character) => (
            <Card
              key={character.id}
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

                  <Button
                    variant="ghost"
                    className="px-3 py-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleDelete(character.id)}
                  >
                    Delete
                  </Button>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Metric
                    label="Combat Power"
                    value={formatNumber(character.cp)}
                  />

                  <Metric
                    label="Statistics"
                    value={String(character.stats.length)}
                  />
                </div>

                <div className="mt-6 flex items-center justify-between gap-4">
                  <p className="text-xs text-zinc-400">
                    Source: {character.metadata.source}
                  </p>

                  <Link
                    href={`/characters/${character.id}`}
                    className="text-sm font-bold text-violet-700 transition hover:text-violet-900"
                  >
                    View profile →
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
