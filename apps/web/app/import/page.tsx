"use client";

import {
  IdentityConfidence,
  type Character,
} from "@twilight-labs/domain";
import {
  createTwilightCharacter,
  type CreateTwilightCharacterInput,
} from "@twilight-labs/game-twilight";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader } from "@repo/ui/card";
import { Metric } from "@repo/ui/metric";
import { PageHeader } from "@repo/ui/page-header";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  loadCharacters,
  saveCharacter,
} from "../../lib/character-storage";

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

const INITIAL_FORM: CreateTwilightCharacterInput = {
  name: "Ysatsu",
  gameClass: "Assassin",
  cp: "1.85B",
  rawStats: DEFAULT_STATS,
  uid: "",
  server: "",
  region: "",
  regionConfidence: IdentityConfidence.Unknown,
  serverUtcOffset: "",
};

const formatValue = (
  value: number,
  unit: "flat" | "percent" = "flat",
) => {
  const formatted = value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });

  return unit === "percent" ? `${formatted}%` : formatted;
};

const findExistingProfile = (
  character: CharacterResult,
): Character | undefined => {
  const characters = loadCharacters();

  if (character.gameIdentity?.uid) {
    return characters.find(
      (candidate) =>
        candidate.gameIdentity?.uid === character.gameIdentity?.uid,
    );
  }

  return characters.find(
    (candidate) => candidate.id === character.id,
  );
};

export default function ImportPage() {
  const [form, setForm] =
    useState<CreateTwilightCharacterInput>(INITIAL_FORM);
  const [character, setCharacter] =
    useState<CharacterResult | null>(null);
  const [existingProfile, setExistingProfile] =
    useState<Character | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognizedCount = character?.stats.length ?? 0;

  const identitySummary = useMemo(() => {
    if (!character?.gameIdentity) {
      return "No UID attached";
    }

    const parts = [
      character.gameIdentity.uid,
      character.gameIdentity.region,
      character.gameIdentity.server,
    ].filter(Boolean);

    return parts.join(" · ");
  }, [character]);

  const updateField = (
    field: keyof CreateTwilightCharacterInput,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleCreate = () => {
    try {
      const nextCharacter = createTwilightCharacter(form);

      setCharacter(nextCharacter);
      setExistingProfile(findExistingProfile(nextCharacter) ?? null);
      setSaved(false);
      setError(null);
    } catch (caughtError) {
      setCharacter(null);
      setExistingProfile(null);
      setSaved(false);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "An unknown error occurred.",
      );
    }
  };

  const handleSave = () => {
    if (!character) {
      return;
    }

    saveCharacter(character);
    setSaved(true);
    setExistingProfile(character);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <PageHeader
        eyebrow="Character ingestion"
        title="Import a character"
        description="Create or update a normalized profile. A matching UID automatically targets the existing character history."
        actions={
          <Link
            href="/identity"
            className="rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-zinc-100"
          >
            Manage identities
          </Link>
        }
      />

      <section className="mt-10 grid gap-8 xl:grid-cols-[440px_1fr]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                Profile
              </p>
              <h2 className="mt-2 text-xl font-black">
                Character information
              </h2>
            </CardHeader>

            <CardContent className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold">Name</span>
                <input
                  value={form.name}
                  onChange={(event) =>
                    updateField("name", event.target.value)
                  }
                  className="rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold">Class</span>
                <input
                  value={form.gameClass}
                  onChange={(event) =>
                    updateField("gameClass", event.target.value)
                  }
                  className="rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold">
                  Combat Power
                </span>
                <input
                  value={form.cp}
                  onChange={(event) =>
                    updateField("cp", event.target.value)
                  }
                  placeholder="1.85B"
                  className="rounded-xl border border-zinc-300 px-4 py-3 font-mono outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                Stable identity
              </p>
              <h2 className="mt-2 text-xl font-black">
                Optional game UID
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Adding the UID lets Twilight Labs update the same profile even
                when its name changes.
              </p>
            </CardHeader>

            <CardContent className="grid gap-5 sm:grid-cols-2">
              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="text-sm font-semibold">UID</span>
                <input
                  value={form.uid ?? ""}
                  onChange={(event) =>
                    updateField("uid", event.target.value)
                  }
                  placeholder="UID shown in game settings"
                  className="rounded-xl border border-zinc-300 px-4 py-3 font-mono outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold">Region</span>
                <input
                  value={form.region ?? ""}
                  onChange={(event) =>
                    updateField("region", event.target.value)
                  }
                  placeholder="Europe"
                  className="rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold">
                  Confidence
                </span>
                <select
                  value={
                    form.regionConfidence ??
                    IdentityConfidence.Unknown
                  }
                  onChange={(event) =>
                    updateField(
                      "regionConfidence",
                      event.target.value,
                    )
                  }
                  className="rounded-xl border border-zinc-300 bg-white px-4 py-3"
                >
                  <option value={IdentityConfidence.Unknown}>
                    Unknown
                  </option>
                  <option value={IdentityConfidence.Inferred}>
                    Inferred
                  </option>
                  <option value={IdentityConfidence.Verified}>
                    Verified
                  </option>
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold">Server</span>
                <input
                  value={form.server ?? ""}
                  onChange={(event) =>
                    updateField("server", event.target.value)
                  }
                  placeholder="Server name or number"
                  className="rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold">
                  Server UTC offset
                </span>
                <input
                  value={form.serverUtcOffset ?? ""}
                  onChange={(event) =>
                    updateField(
                      "serverUtcOffset",
                      event.target.value,
                    )
                  }
                  placeholder="+01:00"
                  className="rounded-xl border border-zinc-300 px-4 py-3 font-mono outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
              </label>
            </CardContent>
          </Card>

          <label className="flex flex-col gap-2">
            <span className="font-semibold">Raw statistics</span>
            <textarea
              value={form.rawStats}
              onChange={(event) =>
                updateField("rawStats", event.target.value)
              }
              className="min-h-[520px] resize-y rounded-3xl border border-zinc-300 bg-white p-5 font-mono text-sm leading-7 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              spellCheck={false}
            />
          </label>

          <Button onClick={handleCreate}>Create preview</Button>

          {error && (
            <Badge variant="danger">{error}</Badge>
          )}
        </div>

        <div>
          {!character ? (
            <div className="flex min-h-[720px] items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-white/60 p-8 text-center text-zinc-500">
              Create a preview to inspect the normalized profile.
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {existingProfile && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardContent>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-amber-950">
                          Existing profile detected
                        </p>
                        <p className="mt-2 text-sm leading-6 text-amber-800">
                          Saving will update {existingProfile.name} and create
                          a new history snapshot when values changed.
                        </p>
                      </div>
                      <Badge variant="warning">Update mode</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Metric
                  label="Character"
                  value={character.name}
                  detail={character.gameClass}
                />
                <Metric
                  label="Combat Power"
                  value={character.cp.toLocaleString("en-US")}
                />
                <Metric
                  label="Recognized stats"
                  value={String(recognizedCount)}
                />
                <Metric
                  label="Game identity"
                  value={character.gameIdentity ? "Linked" : "Missing"}
                  detail={identitySummary}
                />
              </section>

              <Card className="overflow-hidden">
                <CardHeader className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                      Normalized profile
                    </p>
                    <h2 className="mt-2 text-2xl font-black">
                      {character.name}
                    </h2>
                  </div>

                  <Button onClick={handleSave}>
                    {existingProfile ? "Save profile update" : "Save profile"}
                  </Button>
                </CardHeader>

                <div className="grid sm:grid-cols-2">
                  {character.stats.map((stat, index) => (
                    <article
                      key={`${stat.id}-${index}`}
                      className="flex items-center justify-between gap-4 border-b border-zinc-200 p-5 odd:sm:border-r"
                    >
                      <div>
                        <p className="font-semibold">
                          {stat.label}
                        </p>
                        <p className="mt-1 font-mono text-xs text-zinc-400">
                          {stat.id} · {stat.category}
                        </p>
                      </div>

                      <strong className="font-mono">
                        {formatValue(stat.value, stat.unit)}
                      </strong>
                    </article>
                  ))}
                </div>
              </Card>

              {saved && (
                <Badge variant="success">
                  Profile saved successfully.
                </Badge>
              )}

              <details className="rounded-3xl border border-zinc-200 bg-white">
                <summary className="cursor-pointer p-5 font-semibold">
                  Character JSON
                </summary>
                <pre className="overflow-x-auto border-t border-zinc-200 p-5 text-xs">
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
