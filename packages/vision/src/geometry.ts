export interface NormalizedPoint {
  readonly x: number;
  readonly y: number;
}

export interface NormalizedRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface PixelRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface ImageDimensions {
  readonly width: number;
  readonly height: number;
}

const isNormalizedCoordinate = (value: number): boolean =>
  Number.isFinite(value) && value >= 0 && value <= 1;

export function createNormalizedPoint(
  point: NormalizedPoint,
): NormalizedPoint {
  if (
    !isNormalizedCoordinate(point.x) ||
    !isNormalizedCoordinate(point.y)
  ) {
    throw new Error(
      "Normalized points must remain within the 0..1 screen bounds.",
    );
  }

  return Object.freeze({ ...point });
}

export function isNormalizedRect(
  rect: NormalizedRect,
): boolean {
  return (
    isNormalizedCoordinate(rect.x) &&
    isNormalizedCoordinate(rect.y) &&
    Number.isFinite(rect.width) &&
    Number.isFinite(rect.height) &&
    rect.width > 0 &&
    rect.height > 0 &&
    rect.x + rect.width <= 1 &&
    rect.y + rect.height <= 1
  );
}

export function createNormalizedRect(
  rect: NormalizedRect,
): NormalizedRect {
  if (!isNormalizedRect(rect)) {
    throw new Error(
      "Normalized rectangles must remain within the 0..1 screen bounds.",
    );
  }

  return Object.freeze({ ...rect });
}

export function toPixelRect(
  rect: NormalizedRect,
  dimensions: ImageDimensions,
): PixelRect {
  const normalized = createNormalizedRect(rect);

  if (
    !Number.isFinite(dimensions.width) ||
    !Number.isFinite(dimensions.height) ||
    dimensions.width <= 0 ||
    dimensions.height <= 0
  ) {
    throw new Error(
      "Image dimensions must have positive width and height.",
    );
  }

  return Object.freeze({
    x: normalized.x * dimensions.width,
    y: normalized.y * dimensions.height,
    width: normalized.width * dimensions.width,
    height: normalized.height * dimensions.height,
  });
}
