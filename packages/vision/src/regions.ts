import {
  createNormalizedRect,
  type NormalizedRect,
} from "./geometry";
import type { ScreenRegion } from "./grid";

export interface RegionBox {
  readonly id: string;
  readonly bounds: NormalizedRect;
}

export interface RegionAssignment {
  readonly regionId: string;
  readonly boxId: string;
  readonly overlapScore: number;
}

const intersectionArea = (
  first: NormalizedRect,
  second: NormalizedRect,
): number => {
  const width = Math.max(
    0,
    Math.min(first.x + first.width, second.x + second.width) -
      Math.max(first.x, second.x),
  );
  const height = Math.max(
    0,
    Math.min(first.y + first.height, second.y + second.height) -
      Math.max(first.y, second.y),
  );

  return width * height;
};

export function assignBoxesToRegions(
  boxes: readonly RegionBox[],
  regions: readonly ScreenRegion[],
  minimumOverlap = 0.25,
): readonly RegionAssignment[] {
  if (minimumOverlap <= 0 || minimumOverlap > 1) {
    throw new Error(
      "The minimum overlap must be greater than 0 and at most 1.",
    );
  }

  const validRegions = regions.map((region) => ({
    ...region,
    bounds: createNormalizedRect(region.bounds),
  }));
  const assignedBoxIds = new Set<string>();
  const assignments = boxes.flatMap((box) => {
    if (assignedBoxIds.has(box.id)) {
      return [];
    }

    assignedBoxIds.add(box.id);
    const bounds = createNormalizedRect(box.bounds);
    const boxArea = bounds.width * bounds.height;
    const candidate = validRegions.reduce<
      | {
          readonly regionId: string;
          readonly overlapScore: number;
        }
      | undefined
    >((best, region) => {
      const overlapScore =
        intersectionArea(bounds, region.bounds) / boxArea;

      return !best || overlapScore > best.overlapScore
        ? {
            regionId: region.id,
            overlapScore,
          }
        : best;
    }, undefined);

    return candidate && candidate.overlapScore >= minimumOverlap
      ? [
          Object.freeze({
            regionId: candidate.regionId,
            boxId: box.id,
            overlapScore: candidate.overlapScore,
          }),
        ]
      : [];
  });

  return Object.freeze(assignments);
}
