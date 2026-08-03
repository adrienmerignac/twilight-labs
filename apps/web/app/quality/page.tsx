"use client";

import {
  analyzeProfileQuality,
  type ProfileQualityReport,
  type QualityIssueSeverity,
} from "@twilight-labs/analysis";
import type { Character } from "@twilight-labs/domain";
import { Badge } from "@repo/ui/badge";
import { Card, CardContent, CardHeader } from "@repo/ui/card";
import { EmptyState } from "@repo/ui/empty-state";
import { Metric } from "@repo/ui/metric";
import { PageHeader } from "@repo/ui/page-header";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { loadCharacters } from "../../lib/character-storage";

type CharacterQuality = {
  character: Character;
  report: ProfileQualityReport;
};

const severityVariant: Record<
  QualityIssueSeverity,
  "neutral" | "warning" | "danger"
> = {
  info: "neutral",
  warning: "warning",
  critical: "danger",
};

const scoreVariant = (
  score: number,
): "success" | "warning" | "danger" => {
  if (score >= 80) return "success";
  if (score >= 55) return "warning";
  return "danger";
};

export default function QualityPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCharacters(loadCharacters());
    setLoaded(true);
  }, []);

  const reports = useMemo<CharacterQuality[]>(
    () =>
      characters
        .map((character) => ({
          character,
          report: analyzeProfileQuality(character),
        }))
        .sort((first, second) => first.report.score - second.report.score),
    [characters],
  );

  const averageScore =
    reports.length === 0
      ? 0
      : Math.round(
          reports.reduce(
            (total, entry) => total + entry.report.score,
            0,
          ) / reports.length,
        );

  const criticalIssueCount = reports.reduce(
    (total, entry) =>
      total +
      entry.report.issues.filter(
        (issue) => issue.severity === "critical",
      ).length,
    0,
  );

  if (!loaded) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <p className="text-zinc-500">Loading quality reports…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <PageHeader
        eyebrow="Data governance"
        title="Profile quality"
        description="Measure identity completeness, normalized data coverage, and provenance before using profiles in research."
        actions={
          <Link
            href="/import"
            className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Improve a profile
          </Link>
        }
      />

      <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Profiles" value={String(reports.length)} />
        <Metric
          label="Average quality"
          value={`${averageScore}%`}
        />
        <Metric
          label="Critical issues"
          value={String(criticalIssueCount)}
        />
        <Metric
          label="Research ready"
          value={String(
            reports.filter((entry) => entry.report.score >= 80).length,
          )}
        />
      </section>

      {reports.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No profiles to assess"
            description="Import and save a character before generating a quality report."
          />
        </div>
      ) : (
        <section className="mt-8 flex flex-col gap-6">
          {reports.map(({ character, report }) => (
            <Card key={character.id} className="overflow-hidden">
              <CardHeader className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                    {character.gameClass}
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight">
                    {character.name}
                  </h2>
                  <p className="mt-2 font-mono text-xs text-zinc-400">
                    {character.gameIdentity?.uid ??
                      "No game UID linked"}
                  </p>
                </div>

                <Badge variant={scoreVariant(report.score)}>
                  Quality {report.score}%
                </Badge>
              </CardHeader>

              <CardContent>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Metric
                    label="Identity"
                    value={`${report.identityScore}%`}
                  />
                  <Metric
                    label="Data coverage"
                    value={`${report.dataScore}%`}
                  />
                  <Metric
                    label="Provenance"
                    value={`${report.provenanceScore}%`}
                  />
                </div>

                {report.issues.length === 0 ? (
                  <div className="mt-6 rounded-2xl bg-emerald-50 p-5 text-sm font-semibold text-emerald-800">
                    No data-quality issues detected.
                  </div>
                ) : (
                  <div className="mt-6 grid gap-3 lg:grid-cols-2">
                    {report.issues.map((issue) => (
                      <article
                        key={issue.id}
                        className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <h3 className="font-bold">{issue.title}</h3>
                          <Badge
                            variant={severityVariant[issue.severity]}
                          >
                            {issue.severity}
                          </Badge>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-zinc-500">
                          {issue.description}
                        </p>
                      </article>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-4">
                  <Link
                    href={`/characters/${character.id}`}
                    className="text-sm font-bold text-violet-700 hover:text-violet-900"
                  >
                    Open profile →
                  </Link>
                  <Link
                    href="/identity"
                    className="text-sm font-bold text-zinc-600 hover:text-zinc-950"
                  >
                    Manage identity →
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
