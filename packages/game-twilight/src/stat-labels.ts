import { TwilightStatId } from "./stat-ids";

const normalizeLabel = (label: string): string =>
  label.trim().replace(/\s+/g, " ").toUpperCase();

const statLabelMap: Readonly<Record<string, string>> = {
  HP: TwilightStatId.Hp,
  ATK: TwilightStatId.Attack,
  DEF: TwilightStatId.Defense,
  "ARMOR PIERCING": TwilightStatId.ArmorPiercing,
  CRIT: TwilightStatId.Crit,
  "CRIT RES": TwilightStatId.CritResistance,
  "ELEMENTAL DMG": TwilightStatId.ElementalDamage,
  "ELEMENTAL ARMOR": TwilightStatId.ElementalArmor,
  "HP STEAL": TwilightStatId.HpSteal,
  "DMG REFLECT": TwilightStatId.DamageReflect,
  "TRUE DMG": TwilightStatId.TrueDamage,
  "TRUE ARMOR": TwilightStatId.TrueArmor,
  "DODGE RATE": TwilightStatId.DodgeRate,
  "HIT RATE": TwilightStatId.HitRate,
  "CRIT RATE": TwilightStatId.CritRate,
  "CRIT RES RATE": TwilightStatId.CritResistanceRate,
  "PIERCING RATE": TwilightStatId.PiercingRate,
  "PIERCING RES": TwilightStatId.PiercingResistance,
  "COMBO RATE": TwilightStatId.ComboRate,
  "COMBO RES RATE": TwilightStatId.ComboResistanceRate,
  "PIERCING BONUS": TwilightStatId.PiercingBonus,
  "PIERCING REDUCTION": TwilightStatId.PiercingReduction,
  "BLOCK RATE": TwilightStatId.BlockRate,
  "BLOCK BREAK RATE": TwilightStatId.BlockBreakRate,
  "CRIT DMG": TwilightStatId.CritDamage,
  "DMG REDUCTION": TwilightStatId.DamageReductionFlat,
  "COMBO DMG RATIO": TwilightStatId.ComboDamageRatio,
  "COMBO DMG REDUCTION": TwilightStatId.ComboDamageReduction,
  "BLOCK DMG IMMUNITY": TwilightStatId.BlockDamageImmunity,
  "BLOCK PENETRATE": TwilightStatId.BlockPenetrate,
  "DMG BONUS": TwilightStatId.DamageBonus,
  "PLAYER DMG BOOST": TwilightStatId.PlayerDamageBoost,
  "DMG REDUCT": TwilightStatId.PlayerDamageReduction,
  "HP REGEN": TwilightStatId.HpRegen,
  "SKILL DMG": TwilightStatId.SkillDamage
};

export const resolveTwilightStatId = (label: string): string | undefined =>
  statLabelMap[normalizeLabel(label)];
