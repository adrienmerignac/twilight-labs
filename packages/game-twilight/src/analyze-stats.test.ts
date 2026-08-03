import { describe, expect, it } from "vitest";

import { analyzeTwilightStats } from "./analyze-stats";

describe("analyzeTwilightStats", () => {
  it("reports recognized and unknown lines", () => {
    const result = analyzeTwilightStats(`
      HP 167M
      ATK 13.36M
      UNKNOWN POWER 42%
      malformed line
    `);

    expect(result.recognized).toHaveLength(2);
    expect(result.unrecognized).toEqual([
      {
        line: "UNKNOWN POWER 42%",
        label: "UNKNOWN POWER",
        rawValue: "42%",
        reason: "unknown-label",
      },
      {
        line: "malformed line",
        reason: "malformed",
      },
    ]);
    expect(result.totalLines).toBe(4);
    expect(result.recognitionRate).toBe(50);
  });

  it("returns an empty analysis for empty input", () => {
    expect(analyzeTwilightStats("")).toEqual({
      recognized: [],
      unrecognized: [],
      totalLines: 0,
      recognitionRate: 0,
    });
  });
});
