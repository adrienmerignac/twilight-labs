import type { OcrLine } from "../types";

const STAT_LABELS = [
  "Armor Piercing",
  "Elemental Armor",
  "Elemental DMG",
  "Piercing Reduction",
  "Block Break Rate",
  "CRIT RES Rate",
  "Combo RES Rate",
  "Piercing Bonus",
  "Piercing RES",
  "Piercing Rate",
  "DMG Reflect",
  "True Armor",
  "True DMG",
  "Skill DMG",
  "HP Regen",
  "HP Steal",
  "Dodge Rate",
  "Hit Rate",
  "CRIT Rate",
  "Combo Rate",
  "Block Rate",
  "CRIT RES",
  "CRIT",
  "DEF",
  "ATK",
  "HP",
] as const;

const VALUE_PATTERN =
  /[-+]?(?:\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?)(?:[KMBT])?%?/i;

const normalize = (value: string) =>
  value
    .replace(/[|¦]/g, "I")
    .replace(/[：]/g, ":")
    .replace(/\s+/g, " ")
    .trim();

const center = (line: OcrLine) => {
  const points = line.polygon;

  if (points.length === 0) {
    return { x: 0, y: 0, height: 24 };
  }

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
    height: Math.max(1, maxY - minY),
  };
};

const labelScore = (text: string, label: string) => {
  const candidate = normalize(text).toLowerCase();
  const expected = label.toLowerCase();

  if (candidate === expected) {
    return 100;
  }

  if (candidate.includes(expected)) {
    return 90;
  }

  if (expected.includes(candidate) && candidate.length >= 3) {
    return 70;
  }

  const candidateWords = new Set(candidate.split(" "));
  const expectedWords = expected.split(" ");
  const matches = expectedWords.filter((word) =>
    candidateWords.has(word),
  ).length;

  return matches === 0
    ? 0
    : Math.round((matches / expectedWords.length) * 60);
};

const bestLabel = (text: string) => {
  let best: { label: string; score: number } | null = null;

  for (const label of STAT_LABELS) {
    const score = labelScore(text, label);

    if (!best || score > best.score) {
      best = { label, score };
    }
  }

  return best && best.score >= 55 ? best.label : null;
};

const extractValue = (text: string) => {
  const match = normalize(text).match(VALUE_PATTERN);
  return match?.[0]?.replace(",", ".") ?? null;
};

export function reconstructCharacterAttributes(
  lines: OcrLine[],
): string {
  const candidates = lines
    .map((line) => ({
      line,
      text: normalize(line.text),
      geometry: center(line),
    }))
    .filter((entry) => entry.text.length > 0);

  const output: string[] = [];
  const usedValues = new Set<number>();

  for (const [labelIndex, candidate] of candidates.entries()) {
    const label = bestLabel(candidate.text);

    if (!label) {
      continue;
    }

    const inlineValue = extractValue(
      candidate.text.replace(
        new RegExp(label, "i"),
        "",
      ),
    );

    if (inlineValue) {
      output.push(`${label} ${inlineValue}`);
      continue;
    }

    let nearest:
      | {
          index: number;
          value: string;
          distance: number;
        }
      | undefined;

    for (const [valueIndex, possibleValue] of candidates.entries()) {
      if (
        valueIndex === labelIndex ||
        usedValues.has(valueIndex)
      ) {
        continue;
      }

      const value = extractValue(possibleValue.text);

      if (!value) {
        continue;
      }

      const verticalDistance = Math.abs(
        possibleValue.geometry.y - candidate.geometry.y,
      );
      const rowTolerance = Math.max(
        candidate.geometry.height,
        possibleValue.geometry.height,
        18,
      ) * 0.9;

      if (verticalDistance > rowTolerance) {
        continue;
      }

      const horizontalDistance =
        possibleValue.geometry.x - candidate.geometry.x;

      if (horizontalDistance < -20) {
        continue;
      }

      const distance =
        verticalDistance * 3 +
        Math.max(0, horizontalDistance);

      if (!nearest || distance < nearest.distance) {
        nearest = {
          index: valueIndex,
          value,
          distance,
        };
      }
    }

    if (nearest) {
      usedValues.add(nearest.index);
      output.push(`${label} ${nearest.value}`);
    }
  }

  return Array.from(new Set(output)).join("\n");
}
