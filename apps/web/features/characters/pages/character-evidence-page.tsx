"use client";

import type { Character } from "@twilight-labs/domain";
import {
  EvidenceProcessingStatus,
  type EvidenceProcessingStatus as EvidenceStatus,
} from "@twilight-labs/evidence";
import { Badge } from "@repo/ui/badge";
import { Card, CardContent, CardHeader } from "@repo/ui/card";
import { EmptyState } from "@repo/ui/empty-state";
import { Metric } from "@repo/ui/metric";
import { PageHeader } from "@repo/ui/page-header";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  loadEvidenceForCharacter,
  updateEvidenceStatus,
  type StoredEvidence,
} from "../../evidence/storage/evidence-storage";
import { loadCharacters } from "../../../lib/character-storage";

const statusVariant: Record<
  EvidenceStatus,
  "warning" | "success" | "danger"
> = {
  pending: "warning",
  processed: "success",
  failed: "danger",
};

export default function CharacterEvidencePage() {
  const params = useParams<{ id: string }>();
  const [character, setCharacter] = useState<Character | null>(null);
  const [evidence, setEvidence] = useState<StoredEvidence[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCharacter(
      loadCharacters().find((candidate) => candidate.id === params.id) ?? null,
    );
    setEvidence(loadEvidenceForCharacter(params.id));
    setLoaded(true);
  }, [params.id]);

  const statusCounts = useMemo(
    () => ({
      pending: evidence.filter(
        (item) => item.processing?.status === EvidenceProcessingStatus.Pending,
      ).length,
      processed: evidence.filter(
        (item) => item.processing?.status === EvidenceProcessingStatus.Processed,
      ).length,
      failed: evidence.filter(
        (item) => item.processing?.status === EvidenceProcessingStatus.Failed,
      ).length,
    }),
    [evidence],
  );

  const setStatus = (evidenceId: string, status: EvidenceStatus) => {
    updateEvidenceStatus(evidenceId, status);
    setEvidence(loadEvidenceForCharacter(params.id));
  };

  if (!loaded) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <p className="text-zinc-500">Loading evidence…</p>
      </main>
    );
  }

  if (!character) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <EmptyState
          title="Character not found"
          description="This profile does not exist in your local character database."
          action={
            <Link
              href="/characters"
              className="inline-flex rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Back to characters
            </Link>
          }
        />
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <PageHeader
        eyebrow="Evidence timeline"
        title={`${character.name} evidence`}
        description="Review source screenshots and their extraction status for this character."
        actions={
          <>
            <Link
              href={`/characters/${character.id}`}
              className="rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-zinc-100"
            >
              Back to profile
            </Link>
            <Link
              href="/evidence"
              className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Add evidence
            </Link>
          </>
        }
      />

      <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Evidence" value={String(evidence.length)} />
        <Metric label="Pending" value={String(statusCounts.pending)} />
        <Metric label="Processed" value={String(statusCounts.processed)} />
        <Metric label="Failed" value={String(statusCounts.failed)} />
      </section>

      {evidence.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No evidence attached"
            description="Add a screenshot and link it to this character to start a traceable timeline."
            action={
              <Link
                href="/evidence"
                className="inline-flex rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
              >
                Add evidence
              </Link>
            }
          />
        </div>
      ) : (
        <section className="mt-8 flex flex-col gap-6">
          {evidence.map((item) => {
            const status =
              item.processing?.status ?? EvidenceProcessingStatus.Pending;

            return (
              <Card key={item.id} className="overflow-hidden">
                <div className="grid lg:grid-cols-[360px_1fr]">
                  <div className="relative min-h-72 bg-zinc-950">
                    <Image
                      src={item.previewDataUrl}
                      alt={item.title ?? item.source.filename}
                      fill
                      unoptimized
                      className="object-contain"
                    />
                  </div>

                  <div>
                    <CardHeader className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                          {item.type}
                        </p>
                        <h2 className="mt-2 text-xl font-black">
                          {item.title ?? item.source.filename}
                        </h2>
                      </div>
                      <Badge variant={statusVariant[status]}>{status}</Badge>
                    </CardHeader>

                    <CardContent>
                      <dl className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                            Captured
                          </dt>
                          <dd className="mt-2 text-sm">
                            {new Date(item.createdAt).toLocaleString("en-US")}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                            File size
                          </dt>
                          <dd className="mt-2 font-mono text-sm">
                            {(item.source.size / 1024).toFixed(1)} KB
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                            MIME type
                          </dt>
                          <dd className="mt-2 font-mono text-sm">
                            {item.source.mimeType}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                            Processing updated
                          </dt>
                          <dd className="mt-2 text-sm">
                            {new Date(
                              item.processing?.updatedAt ?? item.createdAt,
                            ).toLocaleString("en-US")}
                          </dd>
                        </div>
                      </dl>

                      <div className="mt-6 flex flex-wrap gap-2">
                        {Object.values(EvidenceProcessingStatus).map(
                          (nextStatus) => (
                            <button
                              key={nextStatus}
                              type="button"
                              disabled={nextStatus === status}
                              onClick={() => setStatus(item.id, nextStatus)}
                              className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-semibold transition hover:bg-zinc-100 disabled:cursor-default disabled:bg-zinc-950 disabled:text-white"
                            >
                              Mark {nextStatus}
                            </button>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            );
          })}
        </section>
      )}
    </main>
  );
}
