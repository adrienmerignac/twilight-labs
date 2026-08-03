"use client";

import {
  IdentityConfidence,
  type Character,
  type GameIdentity,
} from "@twilight-labs/domain";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader } from "@repo/ui/card";
import { EmptyState } from "@repo/ui/empty-state";
import { Metric } from "@repo/ui/metric";
import { PageHeader } from "@repo/ui/page-header";
import { useEffect, useMemo, useState } from "react";

import {
  linkGameIdentity,
  loadCharacters,
  unlinkGameIdentity,
} from "../../lib/character-storage";

const EMPTY_IDENTITY: GameIdentity = {
  gameId: "ragnarok-twilight-global",
  uid: "",
  server: "",
  region: "",
  regionConfidence: IdentityConfidence.Unknown,
  serverUtcOffset: "",
};

export default function IdentityPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [identity, setIdentity] =
    useState<GameIdentity>(EMPTY_IDENTITY);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedCharacters = loadCharacters();

    setCharacters(storedCharacters);
    setSelectedId(storedCharacters[0]?.id ?? "");
  }, []);

  const selectedCharacter = useMemo(
    () =>
      characters.find(
        (character) => character.id === selectedId,
      ),
    [characters, selectedId],
  );

  useEffect(() => {
    setIdentity(
      selectedCharacter?.gameIdentity ?? EMPTY_IDENTITY,
    );
    setMessage(null);
    setError(null);
  }, [selectedCharacter]);

  const linkedCount = characters.filter(
    (character) => character.gameIdentity,
  ).length;

  const updateIdentity = (
    field:
      | "uid"
      | "server"
      | "region"
      | "regionConfidence"
      | "serverUtcOffset",
    value: string,
  ) => {
    setIdentity((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleLink = () => {
    if (!selectedCharacter) {
      return;
    }

    try {
      const nextCharacters = linkGameIdentity(
        selectedCharacter.id,
        identity,
      );

      setCharacters(nextCharacters);
      setMessage("Game UID linked successfully.");
      setError(null);
    } catch (caughtError) {
      setMessage(null);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to link this UID.",
      );
    }
  };

  const handleUnlink = () => {
    if (!selectedCharacter) {
      return;
    }

    const nextCharacters = unlinkGameIdentity(
      selectedCharacter.id,
    );

    setCharacters(nextCharacters);
    setIdentity(EMPTY_IDENTITY);
    setMessage("Game UID unlinked.");
    setError(null);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-5 py-10 lg:px-8 lg:py-14">
      <PageHeader
        eyebrow="Game account"
        title="Identity linking"
        description="Attach the stable in-game UID to a locally saved character profile."
      />

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        <Metric
          label="Characters"
          value={String(characters.length)}
        />
        <Metric
          label="Linked profiles"
          value={String(linkedCount)}
        />
        <Metric
          label="Unlinked profiles"
          value={String(characters.length - linkedCount)}
        />
      </section>

      {characters.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No characters available"
            description="Import and save a character before linking a game UID."
          />
        </div>
      ) : (
        <section className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Card>
            <CardHeader>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                Local profile
              </p>
              <h2 className="mt-2 text-xl font-black">
                Select a character
              </h2>
            </CardHeader>

            <CardContent>
              <select
                value={selectedId}
                onChange={(event) =>
                  setSelectedId(event.target.value)
                }
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              >
                {characters.map((character) => (
                  <option
                    key={character.id}
                    value={character.id}
                  >
                    {character.name} — {character.gameClass}
                  </option>
                ))}
              </select>

              {selectedCharacter && (
                <div className="mt-6 rounded-2xl bg-zinc-50 p-5">
                  <p className="font-bold">
                    {selectedCharacter.name}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {selectedCharacter.gameClass}
                  </p>
                  <p className="mt-4 font-mono text-sm">
                    {selectedCharacter.cp.toLocaleString(
                      "en-US",
                    )}{" "}
                    CP
                  </p>

                  <div className="mt-4">
                    <Badge
                      variant={
                        selectedCharacter.gameIdentity
                          ? "success"
                          : "warning"
                      }
                    >
                      {selectedCharacter.gameIdentity
                        ? "UID linked"
                        : "UID missing"}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                Ragnarok: Twilight Global
              </p>
              <h2 className="mt-2 text-xl font-black">
                Game identity
              </h2>
            </CardHeader>

            <CardContent>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className="text-sm font-semibold">
                    UID
                  </span>
                  <input
                    value={identity.uid}
                    onChange={(event) =>
                      updateIdentity(
                        "uid",
                        event.target.value,
                      )
                    }
                    placeholder="Enter the UID shown in game settings"
                    className="rounded-xl border border-zinc-300 px-4 py-3 font-mono outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold">
                    Region
                  </span>
                  <input
                    value={identity.region ?? ""}
                    onChange={(event) =>
                      updateIdentity(
                        "region",
                        event.target.value,
                      )
                    }
                    placeholder="EU, NA, LATAM…"
                    className="rounded-xl border border-zinc-300 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold">
                    Region confidence
                  </span>
                  <select
                    value={
                      identity.regionConfidence ??
                      IdentityConfidence.Unknown
                    }
                    onChange={(event) =>
                      updateIdentity(
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
                  <span className="text-sm font-semibold">
                    Server
                  </span>
                  <input
                    value={identity.server ?? ""}
                    onChange={(event) =>
                      updateIdentity(
                        "server",
                        event.target.value,
                      )
                    }
                    placeholder="Server name or number"
                    className="rounded-xl border border-zinc-300 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold">
                    Server UTC offset
                  </span>
                  <input
                    value={identity.serverUtcOffset ?? ""}
                    onChange={(event) =>
                      updateIdentity(
                        "serverUtcOffset",
                        event.target.value,
                      )
                    }
                    placeholder="+01:00"
                    pattern="[+-]\d{2}:\d{2}"
                    className="rounded-xl border border-zinc-300 px-4 py-3 font-mono"
                  />
                </label>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={handleLink}>
                  Link game UID
                </Button>

                {selectedCharacter?.gameIdentity && (
                  <Button
                    variant="secondary"
                    onClick={handleUnlink}
                  >
                    Unlink
                  </Button>
                )}
              </div>

              {message && (
                <div className="mt-6">
                  <Badge variant="success">
                    {message}
                  </Badge>
                </div>
              )}

              {error && (
                <div className="mt-6">
                  <Badge variant="danger">{error}</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      <Card className="mt-6 bg-[#111116] text-white">
        <CardContent>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-400">
            Why the UID matters
          </p>
          <p className="mt-4 max-w-4xl leading-7 text-zinc-400">
            The UID remains stable when a character name changes. It can
            prevent duplicates, connect future imports to the correct history,
            and become the basis for profile sharing or an official API
            integration if the game exposes one later.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
