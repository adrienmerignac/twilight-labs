import type { Character } from "@twilight-labs/domain";
import { describe, expect, it } from "vitest";

import { analyzeCharacterScaling } from "./compare-scaling";

const createCharacter = (
  id: string,
  cp: number,
  attack: number,
): Character => ({
  id,
  name: id,
  gameClass: "Assassin",
  cp,
  stats: [
    {
      id: "attack",
      label: "ATK",
      category: "basic",
      value: attack,
      unit: "flat",
    },
  ],
  metadata: {
    source: "manual",
    confidence: 1,
  },
});

describe("analyzeCharacterScaling", () => {
  it("calculates stat growth relative to CP growth", () => {
    const result = analyzeCharacterScaling(
      createCharacter("reference", 100, 10),
      createCharacter("compared", 200, 30),
    );

    expect(result.cpRatio).toBe(2);
    expect(result.insights[0]).toMatchObject({
      statId: "attack",
      statRatio: 3,
      scalingIndex: 1.5,
      interpretation: "scales-faster-than-cp",
    });
  });

  it("rejects an invalid reference CP", () => {
    expect(() =>
      analyzeCharacterScaling(
        createCharacter("reference", 0, 10),
        createCharacter("compared", 200, 30),
      ),
    ).toThrow("Reference character CP must be greater than zero.");
  });
});
