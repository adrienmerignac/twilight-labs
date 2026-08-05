import {
  createCardSnapshot,
  type CardSnapshot,
} from "@twilight-labs/domain";

const CARD_LINE_PATTERN =
  /^(?:slot\s*)?(\d+)\s*[:.)-]\s*(.+)$/i;
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
  input: string,
  confidence: number,
): CardSnapshot[] {
  const slots = new Set<number>();

  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .flatMap((line) => {
      const match = line.match(CARD_LINE_PATTERN);
      const slot = Number(match?.[1]);
      const details = match?.[2]?.trim();

      if (
        !match ||
        !details ||
        EMPTY_SLOT_PATTERN.test(details) ||
        slots.has(slot)
      ) {
        return [];
      }

      const name = normalizeName(details);
      if (!name) {
        return [];
      }

      slots.add(slot);

      const level = details.match(LEVEL_PATTERN)?.[1];

      return [
        createCardSnapshot({
          slot,
          name,
          level: level ? Number(level) : undefined,
          rarity: findRarity(details),
          confidence,
        }),
      ];
    });
}
