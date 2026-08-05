import {
  createGridCells,
  createNormalizedRect,
} from "@twilight-labs/vision";
import { describe, expect, it } from "vitest";

import { reconstructOcrRegions } from "./regions";

const line = (
  text: string,
  x: number,
  y: number,
) => ({
  text,
  confidence: 90,
  polygon: [
    { x, y },
    { x: x + 80, y },
    { x: x + 80, y: y + 20 },
    { x, y: y + 20 },
  ],
});

describe("reconstructOcrRegions", () => {
  it("keeps only OCR lines that overlap target regions", () => {
    const regions = createGridCells({
      id: "cards",
      bounds: createNormalizedRect({
        x: 0.1,
        y: 0.2,
        width: 0.8,
        height: 0.6,
      }),
      rows: 2,
      columns: 4,
    });
    const reconstruction = reconstructOcrRegions(
      [
        line("Flame Card", 130, 180),
        line("Guardian Card", 520, 180),
        line("Ragnarok Twilight Global", 100, 30),
        line("Upgrade", 920, 700),
      ],
      regions,
      { width: 1000, height: 800 },
    );

    expect(reconstruction.cells).toHaveLength(8);
    expect(reconstruction.cells[0]?.lines).toEqual([
      expect.objectContaining({ text: "Flame Card" }),
    ]);
    expect(reconstruction.cells[2]?.lines).toEqual([
      expect.objectContaining({ text: "Guardian Card" }),
    ]);
    expect(reconstruction.assignments.map((assignment) =>
      assignment.line.text,
    )).toEqual(["Flame Card", "Guardian Card"]);
  });
});
