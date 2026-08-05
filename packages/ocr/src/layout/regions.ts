import {
  assignBoxesToRegions,
  createPixelGridCells,
  createNormalizedRect,
  type GridCell,
  type ImageDimensions,
  type PixelRect,
  type RegionAssignment,
} from "@twilight-labs/vision";

import type { OcrLine, OcrPoint } from "../types";

export interface OcrRegionAssignment {
  readonly regionId: string;
  readonly pixelBounds: PixelRect;
  readonly line: OcrLine;
  readonly overlapScore: number;
}

export interface OcrRegionCell {
  readonly regionId: string;
  readonly index: number;
  readonly pixelBounds: PixelRect;
  readonly lines: readonly OcrLine[];
  readonly confidence: number;
}

export interface OcrRegionReconstruction {
  readonly cells: readonly OcrRegionCell[];
  readonly assignments: readonly OcrRegionAssignment[];
}

const lineBounds = (
  polygon: readonly OcrPoint[],
): PixelRect | null => {
  if (polygon.length === 0) {
    return null;
  }

  const xs = polygon.map((point) => point.x);
  const ys = polygon.map((point) => point.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);

  return {
    x,
    y,
    width: Math.max(1, Math.max(...xs) - x),
    height: Math.max(1, Math.max(...ys) - y),
  };
};

const normalizeLine = (
  line: OcrLine,
  dimensions: ImageDimensions,
): PixelRect | null => {
  const bounds = lineBounds(line.polygon);

  if (
    !bounds ||
    bounds.x < 0 ||
    bounds.y < 0 ||
    bounds.x + bounds.width > dimensions.width ||
    bounds.y + bounds.height > dimensions.height
  ) {
    return null;
  }

  return bounds;
};

export function reconstructOcrRegions(
  lines: readonly OcrLine[],
  regions: readonly GridCell[],
  dimensions: ImageDimensions,
): OcrRegionReconstruction {
  const sourceByBoxId = new Map<string, OcrLine>();
  const pixelBoundsByBoxId = new Map<string, PixelRect>();
  const boxes = lines.flatMap((line, index) => {
    const pixelBounds = normalizeLine(line, dimensions);

    if (!pixelBounds) {
      return [];
    }

    const id = String(index);
    sourceByBoxId.set(id, line);
    pixelBoundsByBoxId.set(id, pixelBounds);

    return [
      {
        id,
        bounds: createNormalizedRect({
          x: pixelBounds.x / dimensions.width,
          y: pixelBounds.y / dimensions.height,
          width: pixelBounds.width / dimensions.width,
          height: pixelBounds.height / dimensions.height,
        }),
      },
    ];
  });
  const assignments = assignBoxesToRegions(boxes, regions);
  const regionAssignments = assignments.flatMap((assignment) => {
    const line = sourceByBoxId.get(assignment.boxId);
    const pixelBounds = pixelBoundsByBoxId.get(assignment.boxId);

    return line && pixelBounds
      ? [
          Object.freeze({
            regionId: assignment.regionId,
            pixelBounds,
            line,
            overlapScore: assignment.overlapScore,
          }),
        ]
      : [];
  });
  const assignmentsByRegion = new Map<string, OcrRegionAssignment[]>();

  for (const assignment of regionAssignments) {
    const current = assignmentsByRegion.get(assignment.regionId) ?? [];
    current.push(assignment);
    assignmentsByRegion.set(assignment.regionId, current);
  }

  const cells = createPixelGridCells(regions, dimensions).map(
    (region) => {
      const assigned = assignmentsByRegion.get(region.id) ?? [];
      const cellLines = Object.freeze(
        assigned.map((assignment) => assignment.line),
      );
      const confidence =
        cellLines.length === 0
          ? 0
          : cellLines.reduce(
              (sum, line) =>
                sum + Math.max(0, Math.min(1, line.confidence / 100)),
              0,
            ) / cellLines.length;

      return Object.freeze({
        regionId: region.id,
        index: region.index,
        pixelBounds: region.pixelBounds,
        lines: cellLines,
        confidence,
      });
    },
  );

  return Object.freeze({
    cells: Object.freeze(cells),
    assignments: Object.freeze(regionAssignments),
  });
}
