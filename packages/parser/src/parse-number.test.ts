import { describe, expect, it } from "vitest";
import { parseNumber } from "./parse-number";

describe("parseNumber", () => {
  it.each([
    ["13.36M", 13_360_000, "flat"],
    ["167M", 167_000_000, "flat"],
    ["1.85B", 1_850_000_000, "flat"],
    ["82.33K", 82_330, "flat"],
    ["49.47%", 49.47, "percent"],
    ["0%", 0, "percent"],
    ["92265", 92_265, "flat"],
    [" 13.36 M ", 13_360_000, "flat"],
    ["15,88%", 15.88, "percent"],
    ["-2.5%", -2.5, "percent"]
  ] as const)(
    "parses %s",
    (input, expectedValue, expectedUnit) => {
      expect(parseNumber(input)).toEqual({
        value: expectedValue,
        unit: expectedUnit
      });
    }
  );

  it.each(["", "abc", "12MM", "12%%", "1.2.3M"])(
    "rejects unsupported value %s",
    (input) => {
      expect(() => parseNumber(input)).toThrow();
    }
  );
});
