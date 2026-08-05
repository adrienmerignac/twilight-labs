import { describe, expect, it } from "vitest";

import { parseTwilightCards } from "./parse-cards";

describe("parseTwilightCards", () => {
  it("extracts card details from reconstructed OCR cells", () => {
    expect(
      parseTwilightCards(
        [
          {
            slot: 1,
            confidence: 0.92,
            lines: [
              { text: "Flame Card" },
              { text: "Lv. 5" },
              { text: "Epic" },
            ],
          },
          {
            slot: 2,
            confidence: 0.88,
            lines: [{ text: "Guardian Card" }],
          },
        ],
      ),
    ).toEqual([
      {
        slot: 1,
        name: "Flame Card",
        level: 5,
        rarity: "epic",
        confidence: 0.92,
      },
      {
        slot: 2,
        name: "Guardian Card",
        level: undefined,
        rarity: undefined,
        confidence: 0.88,
      },
    ]);
  });

  it("omits empty slots", () => {
    expect(
      parseTwilightCards(
        [
          {
            slot: 1,
            confidence: 0.92,
            lines: [{ text: "Empty" }],
          },
          {
            slot: 2,
            confidence: 0.92,
            lines: [{ text: "Guardian Card" }],
          },
        ],
      ),
    ).toEqual([
      {
        slot: 2,
        name: "Guardian Card",
        level: undefined,
        rarity: undefined,
        confidence: 0.92,
      },
    ]);
  });

  it("keeps a partial card when only its level is recognized", () => {
    expect(
      parseTwilightCards(
        [
          {
            slot: 3,
            confidence: 0.47,
            lines: [{ text: "Lv. 8" }],
          },
        ],
      ),
    ).toEqual([
      {
        slot: 3,
        name: "Unknown card",
        level: 8,
        rarity: undefined,
        confidence: 0.47,
      },
    ]);
  });

  it("returns immutable card snapshots", () => {
    const [card] = parseTwilightCards([
      {
        slot: 1,
        confidence: 0.92,
        lines: [{ text: "Flame Card" }],
      },
    ]);

    expect(card).toBeDefined();
    expect(Object.isFrozen(card)).toBe(true);
  });
});
