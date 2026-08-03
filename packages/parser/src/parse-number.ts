export type ParsedNumber = {
  value: number;
  unit: "flat" | "percent";
};

const MULTIPLIERS: Readonly<Record<string, number>> = {
  K: 1_000,
  M: 1_000_000,
  B: 1_000_000_000,
  T: 1_000_000_000_000
};

export function parseNumber(input: string): ParsedNumber {
  const normalized = input.trim().replace(/\s+/g, "").replace(",", ".");

  if (!normalized) {
    throw new Error("Cannot parse an empty value.");
  }

  const match = normalized.match(
    /^([+-]?(?:\d+(?:\.\d+)?|\.\d+))([KMBT])?(%)?$/i
  );

  if (!match) {
    throw new Error(`Unsupported numeric value: "${input}"`);
  }

  const [, rawValue, rawSuffix, percentMarker] = match;
  const numericValue = Number(rawValue);

  if (!Number.isFinite(numericValue)) {
    throw new Error(`Invalid numeric value: "${input}"`);
  }

  const suffix = rawSuffix?.toUpperCase();
  const multiplier = suffix ? MULTIPLIERS[suffix] : 1;

  if (multiplier === undefined) {
    throw new Error(`Unsupported numeric suffix: "${rawSuffix}"`);
  }

  return {
    value: numericValue * multiplier,
    unit: percentMarker ? "percent" : "flat"
  };
}
