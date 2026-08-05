export interface ResearchTimelineEntry {
  readonly timestampMs: number;
  readonly evidenceId: string;
  readonly snapshotId?: string;
}

export interface ResearchTimeline {
  readonly entries: readonly ResearchTimelineEntry[];
}

export interface CreateResearchTimelineOptions {
  entries: readonly ResearchTimelineEntry[];
}

export function createResearchTimeline(
  options: CreateResearchTimelineOptions,
): ResearchTimeline {
  const timestampsByEvidence = new Set<string>();
  const entries = [...options.entries]
    .sort(
      (first, second) =>
        first.timestampMs - second.timestampMs,
    )
    .map((entry) => {
      const timestampKey = `${entry.evidenceId}:${entry.timestampMs}`;

      if (timestampsByEvidence.has(timestampKey)) {
        throw new Error(
          `Duplicate timestamp for evidence: ${entry.evidenceId}.`,
        );
      }

      timestampsByEvidence.add(timestampKey);

      return Object.freeze({ ...entry });
    });

  return Object.freeze({
    entries: Object.freeze(entries),
  });
}
