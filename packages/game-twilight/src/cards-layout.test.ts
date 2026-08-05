import { describe, expect, it } from "vitest";

import {
  createTwilightCardOcrCells,
  twilightCardsCells,
} from "./cards-layout";

describe("Twilight Cards layout", () => {
  it("defines eight deterministic card slots", () => {
    expect(twilightCardsCells).toHaveLength(8);
    expect(twilightCardsCells.map((cell) => cell.index + 1)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8,
    ]);
  });

  it("maps region indexes to card slots without mutating inputs", () => {
    const regions = [
      {
        index: 0,
        confidence: 0.9,
        lines: [{ text: "Flame Card" }],
      },
    ];
    const cells = createTwilightCardOcrCells(regions);

    expect(cells).toEqual([
      {
        slot: 1,
        confidence: 0.9,
        lines: [{ text: "Flame Card" }],
      },
    ]);
    expect(Object.isFrozen(cells)).toBe(true);
    expect(Object.isFrozen(cells[0])).toBe(true);
  });
});
