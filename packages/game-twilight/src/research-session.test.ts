import {
  createResearchSession,
  createResearchTimeline,
  type CharacterSnapshot,
} from "@twilight-labs/domain";
import { describe, expect, it } from "vitest";

const snapshot: CharacterSnapshot = {
  id: "snapshot-1",
  evidenceId: "evidence-1",
  extractedAt: "2026-08-05T06:00:00.000Z",
  metadata: {
    source: "ocr",
    confidence: 0.9,
  },
  stats: [],
};

describe("createResearchSession", () => {
  it("creates an immutable session with evidences and snapshots", () => {
    const evidences = [{ id: "evidence-1", filename: "video.png" }];
    const snapshots = [snapshot];
    const timeline = createResearchTimeline({ entries: [] });

    const session = createResearchSession({
      id: "session-1",
      videoId: "video-1",
      createdAt: "2026-08-05T06:00:00.000Z",
      evidences,
      snapshots,
      timeline,
    });

    expect(session).toEqual({
      id: "session-1",
      videoId: "video-1",
      createdAt: "2026-08-05T06:00:00.000Z",
      evidences,
      snapshots,
      timeline,
    });
    expect(Object.isFrozen(session)).toBe(true);
    expect(Object.isFrozen(session.evidences)).toBe(true);
    expect(Object.isFrozen(session.snapshots)).toBe(true);
  });

  it("rejects duplicate snapshot ids", () => {
    expect(() =>
      createResearchSession({
        id: "session-1",
        videoId: "video-1",
        createdAt: "2026-08-05T06:00:00.000Z",
        evidences: [],
        snapshots: [snapshot, { ...snapshot }],
        timeline: createResearchTimeline({ entries: [] }),
      }),
    ).toThrow("Duplicate snapshot id: snapshot-1.");
  });

  it("rejects duplicate evidence ids", () => {
    expect(() =>
      createResearchSession({
        id: "session-1",
        videoId: "video-1",
        createdAt: "2026-08-05T06:00:00.000Z",
        evidences: [{ id: "evidence-1" }, { id: "evidence-1" }],
        snapshots: [],
        timeline: createResearchTimeline({ entries: [] }),
      }),
    ).toThrow("Duplicate evidence id: evidence-1.");
  });

  it("creates an empty session", () => {
    expect(
      createResearchSession({
        id: "session-1",
        videoId: "video-1",
        createdAt: "2026-08-05T06:00:00.000Z",
        evidences: [],
        snapshots: [],
        timeline: createResearchTimeline({ entries: [] }),
      }),
    ).toMatchObject({
      evidences: [],
      snapshots: [],
      timeline: {
        entries: [],
      },
    });
  });
});
