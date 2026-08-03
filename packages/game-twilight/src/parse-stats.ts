import {
  StatCategory,
  type Stat,
} from "@twilight-labs/domain";
import { parseNumber } from "@twilight-labs/parser";

import { TwilightStatId } from "./stat-ids";
import { resolveTwilightStatId } from "./stat-labels";

const BASIC_STATS = new Set<string>([
  TwilightStatId.Hp,
  TwilightStatId.Attack,
  TwilightStatId.Defense,
  TwilightStatId.ArmorPiercing,
  TwilightStatId.Crit,
  TwilightStatId.CritResistance,
  TwilightStatId.ElementalDamage,
  TwilightStatId.ElementalArmor,
]);

const getCategory = (statId: string): StatCategory =>
  BASIC_STATS.has(statId)
    ? StatCategory.Basic
    : StatCategory.Special;

export function parseTwilightStats(input: string): Stat[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const match = line.match(
        /^(.+?)\s+([+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)[KMBT]?%?)$/i,
      );

      if (!match) {
        return [];
      }

      const label = match[1]?.trim();
      const rawValue = match[2];

      if (!label || !rawValue) {
        return [];
      }

      const parsed = parseNumber(rawValue);

      let statId = resolveTwilightStatId(label);

      // Le jeu utilise le même libellé pour une valeur plate et un pourcentage.
      if (
        label.toUpperCase() === "DMG REDUCTION" &&
        parsed.unit === "percent"
      ) {
        statId = TwilightStatId.DamageReductionRate;
      }

      if (!statId) {
        return [];
      }

      return [
        {
          id: statId,
          label,
          category: getCategory(statId),
          value: parsed.value,
          unit: parsed.unit,
        },
      ];
    });
}
