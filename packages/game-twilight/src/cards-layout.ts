import {
  createGridCells,
  createNormalizedRect,
  type GridDefinition,
} from "@twilight-labs/vision";

export const twilightCardsGrid: GridDefinition = Object.freeze({
  id: "twilight-cards",
  bounds: createNormalizedRect({
    x: 0.1,
    y: 0.2,
    width: 0.8,
    height: 0.6,
  }),
  rows: 2,
  columns: 4,
});

export const twilightCardsCells = createGridCells(
  twilightCardsGrid,
);

export interface TwilightCardOcrRegion {
  readonly index: number;
  readonly lines: readonly {
    readonly text: string;
  }[];
  readonly confidence: number;
}

export function createTwilightCardOcrCells(
  regions: readonly TwilightCardOcrRegion[],
): readonly {
  readonly slot: number;
  readonly lines: TwilightCardOcrRegion["lines"];
  readonly confidence: number;
}[] {
  return Object.freeze(
    regions.map((region) =>
      Object.freeze({
        slot: region.index + 1,
        lines: region.lines,
        confidence: region.confidence,
      }),
    ),
  );
}
