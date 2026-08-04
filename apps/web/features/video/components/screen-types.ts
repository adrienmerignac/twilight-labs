export const SCREEN_TYPES = [
  "unknown",
  "character-attributes",
  "equipment",
  "cards",
  "pet",
  "mount",
  "costume",
  "skills",
  "inventory",
] as const;

export type ScreenType = (typeof SCREEN_TYPES)[number];

export const SCREEN_TYPE_LABELS: Record<ScreenType, string> = {
  unknown: "Unknown",
  "character-attributes": "Character Attributes",
  equipment: "Equipment",
  cards: "Cards",
  pet: "Pet",
  mount: "Mount",
  costume: "Costume",
  skills: "Skills",
  inventory: "Inventory",
};
