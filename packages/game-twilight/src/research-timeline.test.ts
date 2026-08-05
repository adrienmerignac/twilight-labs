import {
  createResearchTimeline,
  type ResearchTimelineEntry,
} from "@twilight-labs/domain";
import { describe, expect, it } from "vitest";

const entry = (
  timestampMs: number,
  evidenceId = "evidence-1",
): ResearchTimelineEntry => ({
  timestampMs,
  evidenceId,
});

describe("createResearchTimeline", () => {
  it("creates an empty immutable timeline", () => {
    const timeline = createResearchTimeline({ entries: [] });

    expect(timeline).toEqual({ entries: [] });
    expect(Object.isFrozen(timeline)).toBe(true);
    expect(Object.isFrozen(timeline.entries)).toBe(true);
  });

  it("preserves ordered entries", () => {
    const entries = [
      entry(1_000),
      { ...entry(2_000), snapshotId: "snapshot-1" },
    ];

    expect(createResearchTimeline({ entries }).entries).toEqual(
      entries,
    );
  });

  it("sorts unordered entries by timestamp", () => {
    const timeline = createResearchTimeline({
      entries: [entry(2_000), entry(1_000), entry(3_000)],
    });

    expect(timeline.entries.map((entry) => entry.timestampMs)).toEqual([
      1_000,
      2_000,
      3_000,
    ]);
  });

  it("rejects duplicate timestamps for the same evidence", () => {
    expect(() =>
      createResearchTimeline({
        entries: [entry(1_000), entry(1_000)],
      }),
    ).toThrow("Duplicate timestamp for evidence: evidence-1.");
  });

  it("freezes copied entries", () => {
    const timeline = createResearchTimeline({
      entries: [entry(1_000)],
    });

    expect(Object.isFrozen(timeline.entries[0])).toBe(true);
  });
});
