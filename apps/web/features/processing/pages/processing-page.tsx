"use client";

import {
  EvidenceProcessingStatus,
  getScreenDefinition,
} from "@twilight-labs/evidence";
import { Badge } from "@repo/ui/badge";
import { Card, CardContent, CardHeader } from "@repo/ui/card";
import { EmptyState } from "@repo/ui/empty-state";
import { Metric } from "@repo/ui/metric";
import { PageHeader } from "@repo/ui/page-header";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  loadEvidence,
  type StoredEvidence,
} from "../../evidence/storage/evidence-storage";

const statusLabels: Record<string, string> = {
  [EvidenceProcessingStatus.Pending]: "Waiting",
  [EvidenceProcessingStatus.Processed]: "Processed",
  [EvidenceProcessingStatus.Failed]: "Failed",
};

export default function ProcessingPage() {
  const [evidence, setEvidence] = useState<StoredEvidence[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void loadEvidence().then((items) => {
      setEvidence(items);
      setLoaded(true);
    });
  }, []);

  const counts = useMemo(() => {
    const pending = evidence.filter(
      (item) =>
        item.processing?.status ===
        EvidenceProcessingStatus.Pending,
    ).length;
    const processed = evidence.filter(
      (item) =>
        item.processing?.status ===
        EvidenceProcessingStatus.Processed,
    ).length;
    const failed = evidence.filter(
      (item) =>
        item.processing?.status ===
        EvidenceProcessingStatus.Failed,
    ).length;
    const unknown = evidence.filter(
      (item) =>
        getScreenDefinition(item.metadata.screenType).id ===
        "unknown",
    ).length;

    return {
      pending,
      processed,
      failed,
      unknown,
    };
  }, [evidence]);

  if (!loaded) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <p className="text-zinc-500">Loading processing queue…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <PageHeader
        eyebrow="Knowledge extraction"
        title="Processing Queue"
        description="Review classified evidence, see what is waiting, and open the workbench for manual processing."
        actions={
          <Link
            href="/video"
            className="rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-zinc-100"
          >
            Import recording
          </Link>
        }
      />

      <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Waiting" value={String(counts.pending)} />
        <Metric
          label="Processed"
          value={String(counts.processed)}
        />
        <Metric label="Failed" value={String(counts.failed)} />
        <Metric
          label="Needs classification"
          value={String(counts.unknown)}
        />
      </section>

      <section className="mt-8">
        <Card className="overflow-hidden">
          <CardHeader>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
              Evidence pipeline
            </p>
            <h2 className="mt-2 text-xl font-black">
              Current queue
            </h2>
          </CardHeader>

          {evidence.length === 0 ? (
            <CardContent>
              <EmptyState
                title="Nothing to process"
                description="Import screenshots or send video keyframes to create processing jobs."
              />
            </CardContent>
          ) : (
            <div className="divide-y divide-zinc-200">
              {evidence.map((item) => {
                const screen = getScreenDefinition(
                  item.metadata.screenType,
                );
                const status =
                  item.processing?.status ??
                  EvidenceProcessingStatus.Pending;

                return (
                  <article
                    key={item.id}
                    className="grid gap-4 p-5 md:grid-cols-[128px_1fr_auto] md:items-center"
                  >
                    <div className="relative h-24 overflow-hidden rounded-xl bg-zinc-950">
                      <Image
                        src={item.previewDataUrl}
                        alt={item.title ?? item.source.filename}
                        fill
                        unoptimized
                        className="object-contain"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={
                            screen.id === "unknown"
                              ? "warning"
                              : "success"
                          }
                        >
                          {screen.label}
                        </Badge>

                        <Badge
                          variant={
                            status ===
                            EvidenceProcessingStatus.Failed
                              ? "danger"
                              : status ===
                                  EvidenceProcessingStatus.Processed
                                ? "success"
                                : "warning"
                          }
                        >
                          {statusLabels[status] ?? status}
                        </Badge>
                      </div>

                      <p className="mt-3 truncate font-bold">
                        {item.title ?? item.source.filename}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        {screen.description}
                      </p>

                      <p className="mt-2 text-xs text-zinc-400">
                        {new Date(item.createdAt).toLocaleString(
                          "en-US",
                        )}
                      </p>
                    </div>

                    <Link
                      href={`/evidence/${item.id}`}
                      className="inline-flex justify-center rounded-xl bg-zinc-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-zinc-800"
                    >
                      Open workbench
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </Card>
      </section>
    </main>
  );
}
