import { describe, expect, it } from "vitest";

import { parseTwilightCards } from "./parse-cards";

describe("parseTwilightCards", () => {
  it("extracts card details from OCR output", () => {
    expect(
      parseTwilightCards(
        `
          Slot 1: Flame Card Lv. 5 Epic
          Slot 2: Guardian Card
        `,
        0.92,
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
        confidence: 0.92,
      },
    ]);
  });

  it("deduplicates repeated OCR lines by slot", () => {
    expect(
      parseTwilightCards(
        `
          Slot 1: Flame Card Lv. 5 Epic
          Slot 1: Flame Card Lv. 5 Epic
        `,
        0.92,
      ),
    ).toHaveLength(1);
  });

  it("omits empty slots", () => {
    expect(
      parseTwilightCards(
        `
          Slot 1: Empty
          Slot 2: Guardian Card
        `,
        0.92,
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

  it("ignores invalid OCR lines", () => {
    expect(
      parseTwilightCards(
        `
          Card collection
          Slot: Flame Card
          ??
        `,
        0.92,
      ),
    ).toEqual([]);
  });

  it("returns immutable card snapshots", () => {
    const [card] = parseTwilightCards(
      "Slot 1: Flame Card",
      0.92,
    );

    expect(card).toBeDefined();
    expect(Object.isFrozen(card)).toBe(true);
  });
});
