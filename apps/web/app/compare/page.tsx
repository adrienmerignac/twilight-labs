"use client";

import type { Character, Stat } from "@twilight-labs/domain";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { loadCharacters } from "../../lib/character-storage";

type ComparisonRow = {
  id: string;
  label: string;
  unit: Stat["unit"];
  leftValue?: number;
  rightValue?: number;
  difference?: number;
  ratio?: number;
};

const formatValue = (
  value: number | undefined,
  unit: Stat["unit"],
): string => {
  if (value === undefined) {
    return "—";
  }

  const formatted = value.toLocaleString("fr-FR", {
    maximumFractionDigits: 2,
  });

  return unit === "percent" ? `${formatted} %` : formatted;
};

const formatDifference = (
  difference: number | undefined,
  unit: Stat["unit"],
): string => {
  if (difference === undefined) {
    return "—";
  }

  const sign = difference > 0 ? "+" : "";

  return `${sign}${formatValue(difference, unit)}`;
};

export default function ComparePage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [leftId, setLeftId] = useState("");
  const [rightId, setRightId] = useState("");

  useEffect(() => {
    const storedCharacters = loadCharacters();

    setCharacters(storedCharacters);
    setLeftId(storedCharacters[0]?.id ?? "");
    setRightId(storedCharacters[1]?.id ?? "");
  }, []);

  const leftCharacter = characters.find(
    (character) => character.id === leftId,
  );

  const rightCharacter = characters.find(
    (character) => character.id === rightId,
  );

  const rows = useMemo<ComparisonRow[]>(() => {
    if (!leftCharacter || !rightCharacter) {
      return [];
    }

    const leftStats = new Map(
      leftCharacter.stats.map((stat) => [stat.id, stat] as const),
    );

    const rightStats = new Map(
      rightCharacter.stats.map((stat) => [stat.id, stat] as const),
    );

    const statIds = Array.from(
      new Set([...leftStats.keys(), ...rightStats.keys()]),
    );

    return statIds
      .map((id) => {
        const leftStat = leftStats.get(id);
        const rightStat = rightStats.get(id);

        const leftValue = leftStat?.value;
        const rightValue = rightStat?.value;

        return {
          id,
          label: leftStat?.label ?? rightStat?.label ?? id,
          unit: leftStat?.unit ?? rightStat?.unit,
          leftValue,
          rightValue,
          difference:
            leftValue !== undefined && rightValue !== undefined
              ? rightValue - leftValue
              : undefined,
          ratio:
            leftValue !== undefined &&
            rightValue !== undefined &&
            leftValue !== 0
              ? rightValue / leftValue
              : undefined,
        };
      })
      .sort((first, second) =>
        first.label.localeCompare(second.label),
      );
  }, [leftCharacter, rightCharacter]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-12">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
            Twilight Labs
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Comparer des personnages
          </h1>

          <p className="mt-3 text-neutral-600">
            Compare les valeurs absolues et les écarts entre deux profils.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/characters"
            className="rounded-xl border border-neutral-300 px-5 py-3 font-semibold"
          >
            Personnages
          </Link>

          <Link
            href="/import"
            className="rounded-xl bg-black px-5 py-3 font-semibold text-white"
          >
            Importer
          </Link>
        </div>
      </header>

      {characters.length < 2 ? (
        <section className="mt-10 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-12 text-center">
          <h2 className="text-xl font-semibold">
            Deux profils sont nécessaires
          </h2>

          <p className="mt-2 text-neutral-600">
            Importe et sauvegarde au moins deux personnages pour les comparer.
          </p>
        </section>
      ) : (
        <>
          <section className="mt-10 grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="font-semibold">Profil de référence</span>

              <select
                value={leftId}
                onChange={(event) => setLeftId(event.target.value)}
                className="rounded-xl border border-neutral-300 bg-white px-4 py-3"
              >
                {characters.map((character) => (
                  <option key={character.id} value={character.id}>
                    {character.name} — {character.gameClass}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-semibold">Profil comparé</span>

              <select
                value={rightId}
                onChange={(event) => setRightId(event.target.value)}
                className="rounded-xl border border-neutral-300 bg-white px-4 py-3"
              >
                {characters.map((character) => (
                  <option key={character.id} value={character.id}>
                    {character.name} — {character.gameClass}
                  </option>
                ))}
              </select>
            </label>
          </section>

          {leftCharacter && rightCharacter && (
            <section className="mt-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              <header className="grid grid-cols-[1.4fr_repeat(4,minmax(110px,1fr))] gap-4 border-b border-neutral-200 bg-neutral-50 px-5 py-4 text-sm font-semibold">
                <span>Statistique</span>
                <span className="text-right">
                  {leftCharacter.name}
                </span>
                <span className="text-right">
                  {rightCharacter.name}
                </span>
                <span className="text-right">Écart</span>
                <span className="text-right">Ratio</span>
              </header>

              <div className="divide-y divide-neutral-200">
                {rows.map((row) => (
                  <article
                    key={row.id}
                    className="grid grid-cols-[1.4fr_repeat(4,minmax(110px,1fr))] items-center gap-4 px-5 py-4"
                  >
                    <div>
                      <p className="font-semibold">{row.label}</p>
                      <p className="font-mono text-xs text-neutral-500">
                        {row.id}
                      </p>
                    </div>

                    <span className="text-right font-mono">
                      {formatValue(row.leftValue, row.unit)}
                    </span>

                    <span className="text-right font-mono">
                      {formatValue(row.rightValue, row.unit)}
                    </span>

                    <span
                      className={`text-right font-mono ${
                        row.difference === undefined
                          ? "text-neutral-400"
                          : row.difference > 0
                            ? "text-emerald-600"
                            : row.difference < 0
                              ? "text-red-600"
                              : "text-neutral-600"
                      }`}
                    >
                      {formatDifference(row.difference, row.unit)}
                    </span>

                    <span className="text-right font-mono">
                      {row.ratio === undefined
                        ? "—"
                        : `${row.ratio.toFixed(2)}×`}
                    </span>
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
