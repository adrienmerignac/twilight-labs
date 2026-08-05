import { describe, expect, it } from "vitest";

import {
  assignBoxesToRegions,
  createGridCells,
  createNormalizedPoint,
  createNormalizedRect,
  createPixelGridCells,
  toPixelRect,
} from ".";

describe("Vision geometry", () => {
  it("validates immutable normalized primitives", () => {
    const point = createNormalizedPoint({ x: 0.1, y: 0.2 });
    const rect = createNormalizedRect({
      x: 0.1,
      y: 0.2,
      width: 0.3,
      height: 0.4,
    });

    expect(Object.isFrozen(point)).toBe(true);
    expect(Object.isFrozen(rect)).toBe(true);
    expect(() =>
      createNormalizedRect({
        x: 0.8,
        y: 0.2,
        width: 0.3,
        height: 0.4,
      }),
    ).toThrow("0..1");
  });

  it("generates deterministic immutable grid cells", () => {
    const cells = createGridCells({
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

    expect(cells.map((cell) => cell.id)).toEqual([
      "cards-1",
      "cards-2",
      "cards-3",
      "cards-4",
      "cards-5",
      "cards-6",
      "cards-7",
      "cards-8",
    ]);
    expect(cells[4]).toMatchObject({
      index: 4,
      row: 1,
      column: 0,
      bounds: {
        x: 0.1,
        y: 0.5,
        width: 0.2,
        height: 0.3,
      },
    });
    expect(Object.isFrozen(cells)).toBe(true);
    expect(Object.isFrozen(cells[0])).toBe(true);
  });

  it("projects cells to pixels at multiple resolutions", () => {
    const rect = createNormalizedRect({
      x: 0.25,
      y: 0.5,
      width: 0.5,
      height: 0.25,
    });

    expect(toPixelRect(rect, { width: 1000, height: 800 })).toEqual({
      x: 250,
      y: 400,
      width: 500,
      height: 200,
    });
    expect(toPixelRect(rect, { width: 400, height: 200 })).toEqual({
      x: 100,
      y: 100,
      width: 200,
      height: 50,
    });
    expect(
      createPixelGridCells(
        createGridCells({
          id: "single",
          bounds: createNormalizedRect({
            x: 0,
            y: 0,
            width: 1,
            height: 1,
          }),
          rows: 1,
          columns: 1,
        }),
        { width: 200, height: 100 },
      )[0],
    ).toMatchObject({
      pixelBounds: { x: 0, y: 0, width: 200, height: 100 },
    });
  });

  it("assigns each box to one region and ignores out-of-grid boxes", () => {
    const regions = createGridCells({
      id: "cards",
      bounds: createNormalizedRect({
        x: 0,
        y: 0,
        width: 1,
        height: 0.5,
      }),
      rows: 1,
      columns: 2,
    });
    const assignments = assignBoxesToRegions(
      [
        {
          id: "first",
          bounds: createNormalizedRect({
            x: 0.1,
            y: 0.1,
            width: 0.1,
            height: 0.1,
          }),
        },
        {
          id: "second",
          bounds: createNormalizedRect({
            x: 0.7,
            y: 0.1,
            width: 0.1,
            height: 0.1,
          }),
        },
        {
          id: "header",
          bounds: createNormalizedRect({
            x: 0.1,
            y: 0.8,
            width: 0.1,
            height: 0.1,
          }),
        },
        {
          id: "first",
          bounds: createNormalizedRect({
            x: 0.1,
            y: 0.1,
            width: 0.1,
            height: 0.1,
          }),
        },
      ],
      regions,
    );

    expect(assignments).toHaveLength(2);
    expect(assignments[0]).toMatchObject({
      regionId: "cards-1",
      boxId: "first",
    });
    expect(assignments[0]?.overlapScore).toBeCloseTo(1);
    expect(assignments[1]).toMatchObject({
      regionId: "cards-2",
      boxId: "second",
    });
    expect(assignments[1]?.overlapScore).toBeCloseTo(1);
    expect(Object.isFrozen(assignments)).toBe(true);
    expect(Object.isFrozen(assignments[0])).toBe(true);
  });
});
