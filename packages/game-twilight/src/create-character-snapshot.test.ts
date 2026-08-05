import { describe, expect, it } from "vitest";

import { parseTwilightStats } from "./parse-stats";
import {
  createCharacterSnapshot,
} from "./create-character-snapshot";

describe("createCharacterSnapshot", () => {
  it("maps parsed OCR statistics into an identity-free snapshot", () => {
    const snapshot = createCharacterSnapshot({
      id: "snapshot-1",
      evidenceId: "evidence-1",
      extractedAt: "2026-08-05T06:00:00.000Z",
      confidence: 0.925,
      metadata: {
        class: "Assassin",
        level: 65,
        expLevel: 12,
      },
      parsedStats: parseTwilightStats(`
        HP 167M
        ATK 13.36M
      `),
    });

    expect(snapshot).toEqual({
      id: "snapshot-1",
      evidenceId: "evidence-1",
      extractedAt: "2026-08-05T06:00:00.000Z",
      metadata: {
        source: "ocr",
        confidence: 0.925,
        updatedAt: "2026-08-05T06:00:00.000Z",
        class: "Assassin",
        level: 65,
        expLevel: 12,
      },
      stats: [
        {
          id: "hp",
          label: "HP",
          category: "basic",
          value: 167_000_000,
          unit: "flat",
        },
        {
          id: "attack",
          label: "ATK",
          category: "basic",
          value: 13_360_000,
          unit: "flat",
        },
      ],
    });
    expect(snapshot).not.toHaveProperty("name");
    expect(snapshot).not.toHaveProperty("server");
    expect(snapshot).not.toHaveProperty("uid");
    expect(snapshot).not.toHaveProperty("cp");
  });

  it("omits OCR metadata that is unavailable", () => {
    const snapshot = createCharacterSnapshot({
      id: "snapshot-2",
      evidenceId: "evidence-2",
      extractedAt: "2026-08-05T06:00:00.000Z",
      confidence: 0,
      metadata: {},
      parsedStats: parseTwilightStats("HP 167M"),
    });

    expect(snapshot.metadata).toEqual({
      source: "ocr",
      confidence: 0,
      updatedAt: "2026-08-05T06:00:00.000Z",
    });
  });

  it("rejects duplicate statistics", () => {
    expect(() =>
      createCharacterSnapshot({
        id: "snapshot-3",
        evidenceId: "evidence-3",
        extractedAt: "2026-08-05T06:00:00.000Z",
        confidence: 0,
        metadata: {},
        parsedStats: [
          ...parseTwilightStats("HP 167M"),
          ...parseTwilightStats("HP 167M"),
        ],
      }),
    ).toThrow("Duplicate statistic: hp.");
  });
});
