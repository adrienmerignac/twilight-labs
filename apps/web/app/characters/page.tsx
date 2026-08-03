"use client";

import type { Character } from "@twilight-labs/domain";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  deleteCharacter,
  loadCharacters,
} from "../../lib/character-storage";

const formatNumber = (value: number) =>
  value.toLocaleString("fr-FR", {
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
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-12">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
            Twilight Labs
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Characters
          </h1>

          <p className="mt-3 text-neutral-600">
            Profiles stored locally in your browser.
          </p>
        </div>

        <Link
          href="/import"
          className="rounded-xl bg-black px-5 py-3 font-semibold text-white"
        >
          Import a character
        </Link>
      </header>

      {characters.length === 0 ? (
        <section className="mt-10 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-12 text-center">
          <h2 className="text-xl font-semibold">
            No saved characters
          </h2>

          <p className="mt-2 text-neutral-600">
            Import your first profile to get started.
          </p>
        </section>
      ) : (
        <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {characters.map((character) => (
            <article
              key={character.id}
              className="rounded-2xl border border-neutral-200 bg-white p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">
                    {character.name}
                  </h2>

                  <p className="mt-1 text-neutral-600">
                    {character.gameClass}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(character.id)}
                  className="text-sm font-medium text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>

              <dl className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-neutral-500">
                    Combat Power
                  </dt>

                  <dd className="mt-1 font-mono font-semibold">
                    {formatNumber(character.cp)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-neutral-500">
                    Statistics
                  </dt>

                  <dd className="mt-1 font-mono font-semibold">
                    {character.stats.length}
                  </dd>
                </div>
              </dl>

              <p className="mt-6 text-xs text-neutral-500">
                Source: {character.metadata.source}
              </p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
