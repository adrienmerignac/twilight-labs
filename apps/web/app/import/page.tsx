"use client";

import {
  parseTwilightStats,
  type TwilightStatId,
} from "@twilight-labs/game-twilight";
import { useState } from "react";

type ParsedStats = ReturnType<typeof parseTwilightStats>;

const DEFAULT_INPUT = `HP 167M
ATK 13.36M
DEF 6.94M
ARMOR PIERCING 5.37M
CRIT 6.34M
CRIT RATE 49.47%
CRIT DMG 15.88%
DMG BONUS 42.25%
PLAYER DMG BOOST 66.8%`;

const formatValue = (value: number, unit: "flat" | "percent") => {
  if (unit === "percent") {
    return `${value.toLocaleString("fr-FR", {
      maximumFractionDigits: 2,
    })} %`;
  }

  return value.toLocaleString("fr-FR", {
    maximumFractionDigits: 2,
  });
};

export default function ImportPage() {
  const [text, setText] = useState(DEFAULT_INPUT);
  const [stats, setStats] = useState<ParsedStats>([]);
  const [hasParsed, setHasParsed] = useState(false);

  const handleParse = () => {
    setStats(parseTwilightStats(text));
    setHasParsed(true);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-12">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
          Twilight Labs
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Importer un profil
        </h1>

        <p className="mt-3 max-w-2xl text-neutral-600">
          Colle les statistiques affichées dans Ragnarok: Twilight Global.
          Les valeurs reconnues seront normalisées automatiquement.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <label className="font-semibold" htmlFor="character-stats">
            Données brutes
          </label>

          <textarea
            id="character-stats"
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="min-h-[520px] resize-y rounded-2xl border border-neutral-300 bg-white p-5 font-mono text-sm leading-7 text-black outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            spellCheck={false}
          />

          <button
            type="button"
            onClick={handleParse}
            className="w-fit rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-neutral-800"
          >
            Analyser les statistiques
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Résultat</h2>

            {hasParsed && (
              <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-medium text-violet-700">
                {stats.length} statistique{stats.length > 1 ? "s" : ""} reconnue
                {stats.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {!hasParsed && (
            <div className="flex min-h-[520px] items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-neutral-500">
              Lance l’analyse pour afficher les données normalisées.
            </div>
          )}

          {hasParsed && stats.length === 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
              Aucune statistique connue n’a été reconnue.
            </div>
          )}

          {stats.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              <div className="divide-y divide-neutral-200">
                {stats.map((stat, index) => (
                  <article
                    key={`${stat.id}-${index}`}
                    className="flex items-center justify-between gap-4 p-4"
                  >
                    <div>
                      <p className="font-semibold">{stat.label}</p>
                      <p className="font-mono text-xs text-neutral-500">
                        {stat.id as TwilightStatId} · {stat.category}
                      </p>
                    </div>

                    <strong className="text-right font-mono text-lg">
                      {formatValue(stat.value, stat.unit ?? "flat")}
                    </strong>
                  </article>
                ))}
              </div>
            </div>
          )}

          {hasParsed && (
            <details className="rounded-2xl border border-neutral-200 bg-neutral-50">
              <summary className="cursor-pointer p-4 font-semibold">
                JSON normalisé
              </summary>

              <pre className="overflow-x-auto border-t border-neutral-200 p-4 text-xs">
                {JSON.stringify(stats, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </section>
    </main>
  );
}
