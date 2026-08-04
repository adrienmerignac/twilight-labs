"use client";

import type { Character, Stat } from "@twilight-labs/domain";
import { Badge } from "@repo/ui/badge";
import { Card, CardContent, CardHeader } from "@repo/ui/card";
import { EmptyState } from "@repo/ui/empty-state";
import { Metric } from "@repo/ui/metric";
import { PageHeader } from "@repo/ui/page-header";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { loadCharacters } from "../../../lib/character-storage";

type ComparisonRow = {
  id: string;
  label: string;
  unit: Stat["unit"];
  leftValue?: number;
  rightValue?: number;
  difference?: number;
  relativeDifference?: number;
  ratio?: number;
};

const formatValue = (
  value: number | undefined,
  unit: Stat["unit"] = "flat",
): string => {
  if (value === undefined) {
    return "—";
  }

  const formatted = value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });

  return unit === "percent" ? `${formatted}%` : formatted;
};

const formatSignedValue = (
  value: number | undefined,
  unit: Stat["unit"] = "flat",
): string => {
  if (value === undefined) {
    return "—";
  }

  const sign = value > 0 ? "+" : "";

  return `${sign}${formatValue(value, unit)}`;
};

const formatSignedPercentage = (
  value: number | undefined,
): string => {
  if (value === undefined) {
    return "—";
  }

  const sign = value > 0 ? "+" : "";

  return `${sign}${value.toLocaleString("en-US", {
    maximumFractionDigits: 1,
  })}%`;
};

const getDifferenceClassName = (
  difference: number | undefined,
): string => {
  if (difference === undefined) {
    return "text-zinc-400";
  }

  if (difference > 0) {
    return "text-emerald-600";
  }

  if (difference < 0) {
    return "text-red-600";
  }

  return "text-zinc-500";
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

        const comparable =
          leftValue !== undefined && rightValue !== undefined;

        return {
          id,
          label: leftStat?.label ?? rightStat?.label ?? id,
          unit: leftStat?.unit ?? rightStat?.unit,
          leftValue,
          rightValue,
          difference: comparable
            ? rightValue - leftValue
            : undefined,
          relativeDifference:
            comparable && leftValue !== 0
              ? ((rightValue - leftValue) / Math.abs(leftValue)) * 100
              : undefined,
          ratio:
            comparable && leftValue !== 0
              ? rightValue / leftValue
              : undefined,
        };
      })
      .sort((first, second) =>
        first.label.localeCompare(second.label),
      );
  }, [leftCharacter, rightCharacter]);

  const biggestDifferences = useMemo(
    () =>
      rows
        .filter(
          (row) =>
            row.relativeDifference !== undefined &&
            Number.isFinite(row.relativeDifference),
        )
        .sort(
          (first, second) =>
            Math.abs(second.relativeDifference ?? 0) -
            Math.abs(first.relativeDifference ?? 0),
        )
        .slice(0, 5),
    [rows],
  );

  const cpDifference =
    leftCharacter && rightCharacter
      ? rightCharacter.cp - leftCharacter.cp
      : undefined;

  const cpRatio =
    leftCharacter &&
    rightCharacter &&
    leftCharacter.cp !== 0
      ? rightCharacter.cp / leftCharacter.cp
      : undefined;

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <PageHeader
        eyebrow="Character analysis"
        title="Compare characters"
        description="Measure absolute and relative differences between two saved profiles."
        actions={
          <>
            <Link
              href="/characters"
              className="rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-zinc-100"
            >
              Characters
            </Link>

            <Link
              href="/import"
              className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Import
            </Link>
          </>
        }
      />

      {characters.length < 2 ? (
        <div className="mt-10">
          <EmptyState
            title="Two profiles are required"
            description="Import and save at least two characters before comparing them."
            action={
              <Link
                href="/import"
                className="inline-flex rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
              >
                Import another character
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <Card className="mt-10">
            <CardContent className="grid gap-5 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-zinc-700">
                  Reference profile
                </span>

                <select
                  value={leftId}
                  onChange={(event) => setLeftId(event.target.value)}
                  className="rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                >
                  {characters.map((character) => (
                    <option key={character.id} value={character.id}>
                      {character.name} — {character.gameClass}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-zinc-700">
                  Compared profile
                </span>

                <select
                  value={rightId}
                  onChange={(event) => setRightId(event.target.value)}
                  className="rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                >
                  {characters.map((character) => (
                    <option key={character.id} value={character.id}>
                      {character.name} — {character.gameClass}
                    </option>
                  ))}
                </select>
              </label>
            </CardContent>
          </Card>

          {leftCharacter && rightCharacter && (
            <>
              <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Metric
                  label={`${leftCharacter.name} CP`}
                  value={leftCharacter.cp.toLocaleString("en-US")}
                  detail={leftCharacter.gameClass}
                />

                <Metric
                  label={`${rightCharacter.name} CP`}
                  value={rightCharacter.cp.toLocaleString("en-US")}
                  detail={rightCharacter.gameClass}
                />

                <Metric
                  label="CP difference"
                  value={formatSignedValue(cpDifference)}
                  detail="Compared minus reference"
                />

                <Metric
                  label="CP ratio"
                  value={cpRatio === undefined ? "—" : `${cpRatio.toFixed(2)}×`}
                  detail="Compared / reference"
                />
              </section>

              <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
                <Card className="overflow-hidden">
                  <CardHeader>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                      Full comparison
                    </p>

                    <h2 className="mt-2 text-xl font-black">
                      Normalized statistics
                    </h2>
                  </CardHeader>

                  <div className="overflow-x-auto">
                    <div className="min-w-[820px]">
                      <div className="grid grid-cols-[1.4fr_repeat(5,minmax(110px,1fr))] gap-4 border-b border-zinc-200 bg-zinc-50 px-5 py-4 text-xs font-bold uppercase tracking-[0.1em] text-zinc-500">
                        <span>Statistic</span>
                        <span className="text-right">
                          {leftCharacter.name}
                        </span>
                        <span className="text-right">
                          {rightCharacter.name}
                        </span>
                        <span className="text-right">
                          Difference
                        </span>
                        <span className="text-right">
                          Relative
                        </span>
                        <span className="text-right">
                          Ratio
                        </span>
                      </div>

                      <div className="divide-y divide-zinc-200">
                        {rows.map((row) => (
                          <article
                            key={row.id}
                            className="grid grid-cols-[1.4fr_repeat(5,minmax(110px,1fr))] items-center gap-4 px-5 py-4 transition hover:bg-zinc-50"
                          >
                            <div>
                              <p className="font-semibold text-zinc-950">
                                {row.label}
                              </p>

                              <p className="mt-1 font-mono text-xs text-zinc-400">
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
                              className={`text-right font-mono font-semibold ${getDifferenceClassName(
                                row.difference,
                              )}`}
                            >
                              {formatSignedValue(
                                row.difference,
                                row.unit,
                              )}
                            </span>

                            <span
                              className={`text-right font-mono font-semibold ${getDifferenceClassName(
                                row.relativeDifference,
                              )}`}
                            >
                              {formatSignedPercentage(
                                row.relativeDifference,
                              )}
                            </span>

                            <span className="text-right font-mono">
                              {row.ratio === undefined
                                ? "—"
                                : `${row.ratio.toFixed(2)}×`}
                            </span>
                          </article>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                <aside className="flex flex-col gap-6">
                  <Card>
                    <CardHeader>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                        Largest gaps
                      </p>

                      <h2 className="mt-2 text-xl font-black">
                        Top differences
                      </h2>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-3">
                      {biggestDifferences.length === 0 ? (
                        <p className="text-sm leading-6 text-zinc-500">
                          No directly comparable statistics were found.
                        </p>
                      ) : (
                        biggestDifferences.map((row, index) => (
                          <div
                            key={row.id}
                            className="flex items-center justify-between gap-4 rounded-2xl bg-zinc-50 p-4"
                          >
                            <div className="flex items-center gap-3">
                              <span className="grid size-8 place-items-center rounded-xl bg-violet-100 text-xs font-black text-violet-700">
                                {index + 1}
                              </span>

                              <div>
                                <p className="text-sm font-semibold">
                                  {row.label}
                                </p>

                                <p className="font-mono text-xs text-zinc-400">
                                  {row.id}
                                </p>
                              </div>
                            </div>

                            <Badge
                              variant={
                                (row.relativeDifference ?? 0) >= 0
                                  ? "success"
                                  : "danger"
                              }
                            >
                              {formatSignedPercentage(
                                row.relativeDifference,
                              )}
                            </Badge>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-[#111116] text-white">
                    <CardContent>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-400">
                        Interpretation notice
                      </p>

                      <p className="mt-4 leading-7 text-zinc-400">
                        Large differences do not automatically indicate better
                        optimization. This view only compares observed values.
                      </p>
                    </CardContent>
                  </Card>
                </aside>
              </section>
            </>
          )}
        </>
      )}
    </main>
  );
}
