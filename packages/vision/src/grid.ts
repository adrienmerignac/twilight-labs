import {
  createNormalizedRect,
  toPixelRect,
  type ImageDimensions,
  type NormalizedRect,
  type PixelRect,
} from "./geometry";

export interface ScreenRegion {
  readonly id: string;
  readonly bounds: NormalizedRect;
}

export interface GridDefinition extends ScreenRegion {
  readonly rows: number;
  readonly columns: number;
}

export interface GridCell extends ScreenRegion {
  readonly index: number;
  readonly row: number;
  readonly column: number;
}

export interface PixelGridCell extends GridCell {
  readonly pixelBounds: PixelRect;
}

export function createGridCells(
  definition: GridDefinition,
): readonly GridCell[] {
  const bounds = createNormalizedRect(definition.bounds);

  if (
    !Number.isInteger(definition.rows) ||
    !Number.isInteger(definition.columns) ||
    definition.rows <= 0 ||
    definition.columns <= 0
  ) {
    throw new Error("Grid dimensions must be positive integers.");
  }

  const cellWidth = bounds.width / definition.columns;
  const cellHeight = bounds.height / definition.rows;
  const cells: GridCell[] = [];

  for (let row = 0; row < definition.rows; row += 1) {
    for (let column = 0; column < definition.columns; column += 1) {
      const index = row * definition.columns + column;

      cells.push(
        Object.freeze({
          id: `${definition.id}-${index + 1}`,
          index,
          row,
          column,
          bounds: createNormalizedRect({
            x: bounds.x + column * cellWidth,
            y: bounds.y + row * cellHeight,
            width: cellWidth,
            height: cellHeight,
          }),
        }),
      );
    }
  }

  return Object.freeze(cells);
}

export function createPixelGridCells(
  cells: readonly GridCell[],
  dimensions: ImageDimensions,
): readonly PixelGridCell[] {
  return Object.freeze(
    cells.map((cell) =>
      Object.freeze({
        ...cell,
        pixelBounds: toPixelRect(cell.bounds, dimensions),
      }),
    ),
  );
}
