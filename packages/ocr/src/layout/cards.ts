import type { OcrLine, OcrPoint } from "../types";

export interface OcrCardCellBounds {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface OcrCardCell {
  readonly slot: number;
  readonly bounds: OcrCardCellBounds;
  readonly lines: readonly OcrLine[];
  readonly confidence: number;
}

export interface OcrCardBoxAssignment {
  readonly text: string;
  readonly polygon: readonly OcrPoint[];
  readonly slot: number | null;
}

export interface OcrCardReconstruction {
  readonly cells: readonly OcrCardCell[];
  readonly ocrBoxes: readonly OcrCardBoxAssignment[];
}

interface LineGeometry {
  readonly line: OcrLine;
  readonly bounds: OcrCardCellBounds;
  readonly centerX: number;
  readonly centerY: number;
}

interface Row {
  readonly centerY: number;
  readonly lines: readonly LineGeometry[];
}

const NON_CARD_TEXT =
  /^(?:cards?|card collection|equipped cards|back|sort|filter|owned|all|rarity)$/i;

const median = (values: readonly number[]): number => {
  const sorted = [...values].sort((first, second) => first - second);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length === 0) {
    return 0;
  }

  return sorted.length % 2 === 0
    ? (sorted[middle - 1]! + sorted[middle]!) / 2
    : sorted[middle]!;
};

const boundsFromPolygon = (
  polygon: readonly OcrPoint[],
): OcrCardCellBounds | null => {
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

const unionBounds = (
  geometries: readonly LineGeometry[],
): OcrCardCellBounds => {
  const minX = Math.min(
    ...geometries.map((geometry) => geometry.bounds.x),
  );
  const minY = Math.min(
    ...geometries.map((geometry) => geometry.bounds.y),
  );
  const maxX = Math.max(
    ...geometries.map(
      (geometry) => geometry.bounds.x + geometry.bounds.width,
    ),
  );
  const maxY = Math.max(
    ...geometries.map(
      (geometry) => geometry.bounds.y + geometry.bounds.height,
    ),
  );

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

const isCardCandidate = (line: OcrLine): boolean =>
  line.text.trim().length > 0 &&
  !NON_CARD_TEXT.test(line.text.trim()) &&
  line.polygon.length > 0;

const groupRows = (
  lines: readonly LineGeometry[],
  rowTolerance: number,
): readonly Row[] => {
  const rows: { centerY: number; lines: LineGeometry[] }[] = [];

  for (const line of [...lines].sort(
    (first, second) => first.centerY - second.centerY,
  )) {
    const row = rows.find(
      (candidate) =>
        Math.abs(candidate.centerY - line.centerY) <= rowTolerance,
    );

    if (row) {
      row.lines.push(line);
      row.centerY =
        row.lines.reduce(
          (sum, candidate) => sum + candidate.centerY,
          0,
        ) / row.lines.length;
    } else {
      rows.push({ centerY: line.centerY, lines: [line] });
    }
  }

  return rows;
};

const groupColumns = (
  lines: readonly LineGeometry[],
  columnTolerance: number,
): readonly (readonly LineGeometry[])[] => {
  const columns: LineGeometry[][] = [];

  for (const line of [...lines].sort(
    (first, second) => first.centerX - second.centerX,
  )) {
    const column = columns.find((candidate) => {
      const center = median(
        candidate.map((item) => item.centerX),
      );

      return Math.abs(center - line.centerX) <= columnTolerance;
    });

    if (column) {
      column.push(line);
    } else {
      columns.push([line]);
    }
  }

  return columns;
};

const inferColumnCenters = (
  cells: readonly (readonly LineGeometry[])[],
  columnTolerance: number,
): readonly number[] => {
  const centers = groupColumns(
    cells.flat(),
    columnTolerance,
  )
    .map((column) =>
      median(column.map((line) => line.centerX)),
    )
    .sort((first, second) => first - second);
  const gaps = centers
    .slice(1)
    .map((center, index) => center - centers[index]!);
  const regularGap = median(gaps);

  if (regularGap === 0) {
    return centers;
  }

  const inferred: number[] = [centers[0]!];

  for (const center of centers.slice(1)) {
    const previous = inferred[inferred.length - 1]!;
    const missingColumns = Math.max(
      0,
      Math.round((center - previous) / regularGap) - 1,
    );

    for (let index = 1; index <= missingColumns; index += 1) {
      inferred.push(previous + regularGap * index);
    }

    inferred.push(center);
  }

  return inferred;
};

export function reconstructCardGrid(
  lines: readonly OcrLine[],
): OcrCardReconstruction {
  const geometry = lines
    .filter(isCardCandidate)
    .flatMap((line) => {
      const bounds = boundsFromPolygon(line.polygon);

      return bounds
        ? [
            {
              line,
              bounds,
              centerX: bounds.x + bounds.width / 2,
              centerY: bounds.y + bounds.height / 2,
            },
          ]
        : [];
    });
  const lineHeight = median(
    geometry.map((item) => item.bounds.height),
  );
  const rowTolerance = Math.max(36, lineHeight * 3);
  const columnTolerance = Math.max(48, lineHeight * 3);
  const rows = groupRows(geometry, rowTolerance);
  const rowCells = rows.map((row) =>
    groupColumns(row.lines, columnTolerance),
  );
  const columns = inferColumnCenters(
    rowCells.flat(),
    columnTolerance,
  );
  const cells = rowCells.flatMap((row, rowIndex) =>
    row.map((cellLines) => {
      const centerX = median(
        cellLines.map((line) => line.centerX),
      );
      const columnIndex = columns.reduce(
        (closest, center, index) =>
          Math.abs(center - centerX) <
          Math.abs(columns[closest]! - centerX)
            ? index
            : closest,
        0,
      );
      const confidence =
        cellLines.reduce(
          (sum, line) => sum + line.line.confidence,
          0,
        ) /
        cellLines.length /
        100;

      return Object.freeze({
        slot: rowIndex * columns.length + columnIndex + 1,
        bounds: Object.freeze(unionBounds(cellLines)),
        lines: Object.freeze(
          cellLines.map((line) => line.line),
        ),
        confidence: Math.max(0, Math.min(1, confidence)),
      });
    }),
  );
  const slotByLine = new Map<OcrLine, number>(
    cells.flatMap((cell) =>
      cell.lines.map((line) => [line, cell.slot] as const),
    ),
  );

  return Object.freeze({
    cells: Object.freeze(
      [...cells].sort((first, second) => first.slot - second.slot),
    ),
    ocrBoxes: Object.freeze(
      lines.map((line) =>
        Object.freeze({
          text: line.text,
          polygon: Object.freeze([...line.polygon]),
          slot: slotByLine.get(line) ?? null,
        }),
      ),
    ),
  });
}
