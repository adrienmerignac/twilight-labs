import { describe, expect, it } from "vitest";

import { reconstructCardGrid } from "./cards";

const line = (
  text: string,
  x: number,
  y: number,
  confidence = 90,
) => ({
  text,
  confidence,
  polygon: [
    { x, y },
    { x: x + 100, y },
    { x: x + 100, y: y + 24 },
    { x, y: y + 24 },
  ],
});

describe("reconstructCardGrid", () => {
  it("assigns realistic OCR boxes to row-major grid slots", () => {
    const reconstruction = reconstructCardGrid([
      line("Flame Card", 100, 100, 95),
      line("Lv. 5", 100, 136, 88),
      line("Guardian Card", 500, 100, 91),
      line("Frost Card", 300, 280, 84),
      line("Cards", 20, 20),
    ]);

    expect(reconstruction.cells).toEqual([
      expect.objectContaining({
        slot: 1,
        confidence: 0.915,
        lines: [
          expect.objectContaining({ text: "Flame Card" }),
          expect.objectContaining({ text: "Lv. 5" }),
        ],
      }),
      expect.objectContaining({
        slot: 3,
        lines: [
          expect.objectContaining({ text: "Guardian Card" }),
        ],
      }),
      expect.objectContaining({
        slot: 5,
        lines: [
          expect.objectContaining({ text: "Frost Card" }),
        ],
      }),
    ]);
    expect(reconstruction.ocrBoxes).toEqual([
      expect.objectContaining({ text: "Flame Card", slot: 1 }),
      expect.objectContaining({ text: "Lv. 5", slot: 1 }),
      expect.objectContaining({ text: "Guardian Card", slot: 3 }),
      expect.objectContaining({ text: "Frost Card", slot: 5 }),
      expect.objectContaining({ text: "Cards", slot: null }),
    ]);
  });

  it("does not create cards for empty grid positions", () => {
    const reconstruction = reconstructCardGrid([
      line("Flame Card", 100, 100),
      line("Guardian Card", 500, 100),
      line("Frost Card", 300, 280),
    ]);

    expect(reconstruction.cells.map((cell) => cell.slot)).toEqual([
      1, 3, 5,
    ]);
  });

  it("returns immutable diagnostics", () => {
    const reconstruction = reconstructCardGrid([
      line("Flame Card", 100, 100),
    ]);

    expect(Object.isFrozen(reconstruction)).toBe(true);
    expect(Object.isFrozen(reconstruction.cells)).toBe(true);
    expect(Object.isFrozen(reconstruction.cells[0])).toBe(true);
  });
});
