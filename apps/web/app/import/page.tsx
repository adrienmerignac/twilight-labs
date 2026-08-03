"use client";

import {
  createTwilightCharacter,
  type CreateTwilightCharacterInput,
} from "@twilight-labs/game-twilight";
import { useState } from "react";
import { saveCharacter } from "../../lib/character-storage";

type CharacterResult = ReturnType<typeof createTwilightCharacter>;

const DEFAULT_STATS = `HP 167M
ATK 13.36M
DEF 6.94M
ARMOR PIERCING 5.37M
CRIT 6.34M
CRIT RES 5.54M
ELEMENTAL DMG 1.57M
HP STEAL 82330
TRUE DMG 92265
CRIT RATE 49.47%
CRIT RES RATE 43.99%
PIERCING RATE 3.5%
COMBO RATE 49.47%
CRIT DMG 15.88%
DMG BONUS 42.25%
PLAYER DMG BOOST 66.8%
DMG REDUCT 77.3%`;

const formatValue = (
  value: number,
  unit: "flat" | "percent" = "flat",
) => {
  const formatted = value.toLocaleString("fr-FR", {
    maximumFractionDigits: 2,
  });

  return unit === "percent" ? `${formatted} %` : formatted;
};

export default function ImportPage() {
  const [form, setForm] = useState<CreateTwilightCharacterInput>({
    name: "Ysatsu",
    gameClass: "Assassin",
    cp: "1.85B",
    rawStats: DEFAULT_STATS,
  });

  const [character, setCharacter] =
    useState<CharacterResult | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const updateField = (
    field: keyof CreateTwilightCharacterInput,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleImport = () => {
    try {
      const nextCharacter = createTwilightCharacter(form);

      setCharacter(nextCharacter);
      setError(null);
      setSaved(false);
    } catch (caughtError) {
      setCharacter(null);

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Une erreur inconnue est survenue.",
      );
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-12">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
          Twilight Labs
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Importer un personnage
        </h1>

        <p className="mt-3 max-w-2xl text-neutral-600">
          Transforme les informations affichées dans Ragnarok: Twilight Global
          en un profil normalisé et exploitable.
        </p>
      </header>

      <section className="grid gap-8 xl:grid-cols-[420px_1fr]">
        <div className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <label className="flex flex-col gap-2">
              <span className="font-semibold">Nom</span>

              <input
                value={form.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
                className="rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-semibold">Classe</span>

              <input
                value={form.gameClass}
                onChange={(event) =>
                  updateField("gameClass", event.target.value)
                }
                className="rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-semibold">Combat Power</span>

              <input
                value={form.cp}
                onChange={(event) =>
                  updateField("cp", event.target.value)
                }
                placeholder="1.85B"
                className="rounded-xl border border-neutral-300 px-4 py-3 font-mono outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="font-semibold">Statistiques brutes</span>

            <textarea
              value={form.rawStats}
              onChange={(event) =>
                updateField("rawStats", event.target.value)
              }
              className="min-h-[520px] resize-y rounded-2xl border border-neutral-300 bg-white p-5 font-mono text-sm leading-7 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              spellCheck={false}
            />
          </label>

          <button
            type="button"
            onClick={handleImport}
            className="rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-neutral-800"
          >
            Créer le profil
          </button>

          {character && (
            <button
              type="button"
              onClick={() => {
                saveCharacter(character);
                setSaved(true);
              }}
              className="rounded-xl border border-neutral-300 px-6 py-3 font-semibold transition hover:bg-neutral-100"
            >
              Sauvegarder le profil
            </button>
          )}

          {saved && (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
              Profil sauvegardé localement.
            </p>
          )}

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
              {error}
            </p>
          )}
        </div>

        <div>
          {!character && (
            <div className="flex min-h-[640px] items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-neutral-500">
              Crée le profil pour afficher les données normalisées.
            </div>
          )}

          {character && (
            <div className="flex flex-col gap-6">
              <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">
                  Profil normalisé
                </p>

                <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold">
                      {character.name}
                    </h2>

                    <p className="mt-1 text-neutral-600">
                      {character.gameClass}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-neutral-500">
                      Combat Power
                    </p>

                    <strong className="font-mono text-2xl">
                      {character.cp.toLocaleString("fr-FR")}
                    </strong>
                  </div>
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                <header className="flex items-center justify-between border-b border-neutral-200 p-5">
                  <h2 className="font-semibold">
                    Statistiques reconnues
                  </h2>

                  <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-medium text-violet-700">
                    {character.stats.length}
                  </span>
                </header>

                <div className="grid sm:grid-cols-2">
                  {character.stats.map((stat, index) => (
                    <article
                      key={`${stat.id}-${index}`}
                      className="flex items-center justify-between gap-4 border-b border-neutral-200 p-4 odd:sm:border-r"
                    >
                      <div>
                        <p className="font-semibold">
                          {stat.label}
                        </p>

                        <p className="font-mono text-xs text-neutral-500">
                          {stat.id} · {stat.category}
                        </p>
                      </div>

                      <strong className="font-mono">
                        {formatValue(stat.value, stat.unit)}
                      </strong>
                    </article>
                  ))}
                </div>
              </section>

              <details className="rounded-2xl border border-neutral-200 bg-neutral-50">
                <summary className="cursor-pointer p-4 font-semibold">
                  JSON du personnage
                </summary>

                <pre className="overflow-x-auto border-t border-neutral-200 p-4 text-xs">
                  {JSON.stringify(character, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
