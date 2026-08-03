import type { Character } from "@twilight-labs/domain";
import { describe, expect, it } from "vitest";

import { analyzeProfileQuality } from "./profile-quality";

const completeCharacter: Character = {
  id: "ysatsu",
  name: "Ysatsu",
  gameClass: "Assassin",
  cp: 1_850_000_000,
  gameIdentity: {
    gameId: "ragnarok-twilight-global",
    uid: "123456789",
    server: "S1",
    region: "Europe",
    regionConfidence: "verified",
    serverUtcOffset: "+01:00",
  },
  stats: Array.from({ length: 25 }, (_, index) => ({
    id: `stat-${index}`,
    label: `STAT ${index}`,
    category: "special",
    value: index + 1,
    unit: "flat",
  })),
  metadata: {
    source: "manual",
    confidence: 1,
    updatedAt: "2026-08-03T12:00:00.000Z",
  },
};

describe("analyzeProfileQuality", () => {
  it("returns a perfect score for a complete profile", () => {
    expect(analyzeProfileQuality(completeCharacter)).toMatchObject({
      score: 100,
      identityScore: 100,
      dataScore: 100,
      provenanceScore: 100,
      issues: [],
    });
  });

  it("reports missing UID and insufficient data", () => {
    const report = analyzeProfileQuality({
      ...completeCharacter,
      gameIdentity: undefined,
      stats: [],
      metadata: {
        source: "manual",
        confidence: 1,
      },
    });

    expect(report.score).toBeLessThan(60);
    expect(report.issues.map((issue) => issue.id)).toEqual(
      expect.arrayContaining([
        "missing-uid",
        "insufficient-stats",
        "missing-updated-at",
      ]),
    );
  });
});
