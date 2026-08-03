import { describe, expect, it } from "vitest";

import { createTwilightCharacter } from "./create-character";

describe("createTwilightCharacter", () => {
  it("creates a normalized character profile", () => {
    const character = createTwilightCharacter({
      name: "Ysatsu",
      gameClass: "Assassin",
      cp: "1.85B",
      rawStats: `
        HP 167M
        ATK 13.36M
        CRIT RATE 49.47%
      `,
    });

    expect(character).toMatchObject({
      id: "ysatsu",
      name: "Ysatsu",
      gameClass: "Assassin",
      cp: 1_850_000_000,
      metadata: {
        source: "manual",
        confidence: 1,
      },
    });

    expect(character.stats).toHaveLength(3);
  });

  it("rejects missing identity information", () => {
    expect(() =>
      createTwilightCharacter({
        name: "",
        gameClass: "Assassin",
        cp: "1B",
        rawStats: "",
      }),
    ).toThrow("Character name is required.");
  });
});
