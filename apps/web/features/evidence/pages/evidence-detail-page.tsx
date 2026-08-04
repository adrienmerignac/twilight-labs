"use client";

import { analyzeTwilightStats } from "@twilight-labs/game-twilight";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader } from "@repo/ui/card";
import { EmptyState } from "@repo/ui/empty-state";
import { Metric } from "@repo/ui/metric";
import { PageHeader } from "@repo/ui/page-header";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  getEvidence,
  updateEvidenceTranscription,
  type StoredEvidence,
} from "../storage/evidence-storage";

const reasonLabels = {
  malformed: "Malformed line",
  "unknown-label": "Unknown label",
  "invalid-value": "Invalid value",
} as const;

export default function EvidenceDetailPage() {
  const params = useParams<{ id: string }>();
  const [evidence, setEvidence] = useState<StoredEvidence | null>(null);
  const [rawText, setRawText] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedEvidence = getEvidence(params.id) ?? null;

    setEvidence(storedEvidence);
    setRawText(storedEvidence?.transcription?.rawText ?? "");
    setLoaded(true);
  }, [params.id]);

  const analysis = useMemo(
    () => analyzeTwilightStats(rawText),
    [rawText],
  );

  const handleSave = () => {
    if (!evidence || analysis.totalLines === 0) {
      return;
    }

    const updatedAt = new Date().toISOString();

    updateEvidenceTranscription(evidence.id, {
      rawText,
      updatedAt,
      recognizedCount: analysis.recognized.length,
      unrecognizedCount: analysis.unrecognized.length,
      recognitionRate: analysis.recognitionRate,
    });

    setEvidence(getEvidence(evidence.id) ?? evidence);
    setSaved(true);
  };

  if (!loaded) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <p className="text-zinc-500">Loading evidence…</p>
      </main>
    );
  }

  if (!evidence) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <EmptyState
          title="Evidence not found"
          description="This evidence item does not exist in local storage."
          action={
            <Link
              href="/evidence"
              className="inline-flex rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Back to evidence
            </Link>
          }
        />
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <PageHeader
        eyebrow="Evidence transcription"
        title={evidence.title ?? evidence.source.filename}
        description="Transcribe the visible statistics, inspect the parser result, and preserve the interpretation with the original screenshot."
        actions={
          <Link
            href="/evidence"
            className="rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-zinc-100"
          >
            Back to evidence
          </Link>
        }
      />

      <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Input lines" value={String(analysis.totalLines)} />
        <Metric
          label="Recognized"
          value={String(analysis.recognized.length)}
        />
        <Metric
          label="Unrecognized"
          value={String(analysis.unrecognized.length)}
        />
        <Metric
          label="Recognition rate"
          value={`${analysis.recognitionRate.toFixed(1)}%`}
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden">
            <div className="relative h-[560px] bg-zinc-950">
              <Image
                src={evidence.previewDataUrl}
                alt={evidence.title ?? evidence.source.filename}
                fill
                unoptimized
                className="object-contain"
              />
            </div>

            <CardContent>
              <p className="font-semibold">{evidence.source.filename}</p>
              <p className="mt-1 text-sm text-zinc-500">
                {(evidence.source.size / 1024).toFixed(1)} KB ·{" "}
                {new Date(evidence.createdAt).toLocaleString("en-US")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                Manual transcription
              </p>
              <h2 className="mt-2 text-xl font-black">
                Visible statistic lines
              </h2>
            </CardHeader>

            <CardContent>
              <textarea
                value={rawText}
                onChange={(event) => {
                  setRawText(event.target.value);
                  setSaved(false);
                }}
                placeholder={`HP 167M\nATK 13.36M\nCRIT RATE 49.47%`}
                spellCheck={false}
                className="min-h-[420px] w-full resize-y rounded-2xl border border-zinc-300 bg-zinc-50 p-5 font-mono text-sm leading-7 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />

              <Button
                className="mt-5 w-full"
                onClick={handleSave}
                disabled={analysis.totalLines === 0}
              >
                Save transcription and mark processed
              </Button>

              {saved && (
                <div className="mt-4">
                  <Badge variant="success">
                    Transcription saved.
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden">
            <CardHeader className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                  Parser output
                </p>
                <h2 className="mt-2 text-xl font-black">
                  Recognized statistics
                </h2>
              </div>

              <Badge variant="success">
                {analysis.recognized.length}
              </Badge>
            </CardHeader>

            {analysis.recognized.length === 0 ? (
              <CardContent>
                <EmptyState
                  title="No recognized statistics"
                  description="Transcribe known Twilight statistic labels to inspect the normalized result."
                />
              </CardContent>
            ) : (
              <div className="divide-y divide-zinc-200">
                {analysis.recognized.map((stat, index) => (
                  <article
                    key={`${stat.id}-${index}`}
                    className="flex items-center justify-between gap-4 p-5"
                  >
                    <div>
                      <p className="font-semibold">{stat.label}</p>
                      <p className="mt-1 font-mono text-xs text-zinc-400">
                        {stat.id} · {stat.category}
                      </p>
                    </div>

                    <strong className="font-mono">
                      {stat.value.toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                      })}
                      {stat.unit === "percent" ? "%" : ""}
                    </strong>
                  </article>
                ))}
              </div>
            )}
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
                  Mapping backlog
                </p>
                <h2 className="mt-2 text-xl font-black">
                  Unrecognized lines
                </h2>
              </div>

              <Badge
                variant={
                  analysis.unrecognized.length === 0
                    ? "success"
                    : "warning"
                }
              >
                {analysis.unrecognized.length}
              </Badge>
            </CardHeader>

            {analysis.unrecognized.length === 0 ? (
              <CardContent>
                <p className="leading-7 text-zinc-500">
                  Every non-empty transcription line was recognized.
                </p>
              </CardContent>
            ) : (
              <div className="divide-y divide-zinc-200">
                {analysis.unrecognized.map((entry, index) => (
                  <article
                    key={`${entry.line}-${index}`}
                    className="p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <code className="break-all text-sm font-semibold">
                        {entry.line}
                      </code>

                      <Badge variant="warning">
                        {reasonLabels[entry.reason]}
                      </Badge>
                    </div>

                    {entry.label && (
                      <p className="mt-2 text-sm text-zinc-500">
                        Candidate label:{" "}
                        <code className="font-semibold">
                          {entry.label}
                        </code>
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </Card>
        </div>
      </section>
    </main>
  );
}
