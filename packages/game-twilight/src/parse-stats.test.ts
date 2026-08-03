import { describe, expect, it } from "vitest";

import { parseTwilightStats } from "./parse-stats";

describe("parseTwilightStats", () => {
  it("parses known Twilight stats", () => {
    expect(
      parseTwilightStats(`
        HP 167M
        ATK 13.36M
        CRIT RATE 49.47%
      `),
    ).toEqual([
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
      {
        id: "critRate",
        label: "CRIT RATE",
        category: "special",
        value: 49.47,
        unit: "percent",
      },
    ]);
  });

  it("ignores unknown or malformed lines", () => {
    expect(
      parseTwilightStats(`
        UNKNOWN 42
        ceci n'est pas une statistique
        TRUE DMG 92265
      `),
    ).toHaveLength(1);
  });

  it("distinguishes flat and percentage damage reduction", () => {
    expect(
      parseTwilightStats(`
        DMG REDUCTION 5.87M
        DMG REDUCTION 58.72%
      `).map(({ id }) => id),
    ).toEqual([
      "damageReductionFlat",
      "damageReductionRate",
    ]);
  });
});
