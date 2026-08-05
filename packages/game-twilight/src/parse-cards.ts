import {
  createCardSnapshot,
  type CardSnapshot,
} from "@twilight-labs/domain";

export interface TwilightCardOcrCell {
  readonly slot: number;
  readonly confidence: number;
  readonly lines: readonly {
    readonly text: string;
  }[];
}

const LEVEL_PATTERN = /(?:lv\.?|level)\s*(\d+)/i;
const RARITIES = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
  "mythic",
] as const;
const EMPTY_SLOT_PATTERN =
  /^(?:empty|none|no card|-)$/i;

const normalizeName = (value: string) =>
  value
    .replace(LEVEL_PATTERN, "")
    .replace(
      new RegExp(`\\b(${RARITIES.join("|")})\\b`, "i"),
      "",
    )
    .replace(/[|,:-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const findRarity = (value: string) =>
  RARITIES.find((rarity) =>
    new RegExp(`\\b${rarity}\\b`, "i").test(value),
  );

export function parseTwilightCards(
  cells: readonly TwilightCardOcrCell[],
): CardSnapshot[] {
  return cells.flatMap((cell) => {
    const details = cell.lines
      .map((line) => line.text.trim())
      .filter(Boolean)
      .join(" ");

    if (!details || EMPTY_SLOT_PATTERN.test(details)) {
      return [];
    }

    const level = details.match(LEVEL_PATTERN)?.[1];
    const name = normalizeName(details) || "Unknown card";

    return [
      createCardSnapshot({
        slot: cell.slot,
        name,
        level: level ? Number(level) : undefined,
        rarity: findRarity(details),
        confidence: cell.confidence,
      }),
    ];
  });
}
