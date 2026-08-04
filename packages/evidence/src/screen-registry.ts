export const SCREEN_TYPES = [
  "unknown",
  "character",
  "character-attributes",
  "equipment",
  "cards",
  "core",
  "pet",
  "mount",
  "costume",
  "skills",
  "inventory",
] as const;

export type ScreenType = (typeof SCREEN_TYPES)[number];

export interface ScreenDefinition {
  id: ScreenType;
  label: string;
  description: string;
  pipelineId: string | null;
  ocrProfileId: string | null;
  priority: number;
}

export const SCREEN_REGISTRY: Record<ScreenType, ScreenDefinition> = {
  unknown: {
    id: "unknown",
    label: "Unknown",
    description: "The screen has not been classified yet.",
    pipelineId: null,
    ocrProfileId: null,
    priority: 0,
  },
  character: {
    id: "character",
    label: "Character",
    description: "Main character screen showing the avatar and equipped items.",
    pipelineId: "character",
    ocrProfileId: "character",
    priority: 100,
  },
  "character-attributes": {
    id: "character-attributes",
    label: "Character Attributes",
    description: "Character statistics and attribute values.",
    pipelineId: "character-attributes",
    ocrProfileId: "character-attributes",
    priority: 110,
  },
  equipment: {
    id: "equipment",
    label: "Equipment",
    description: "Equipment details and enhancement information.",
    pipelineId: "equipment",
    ocrProfileId: "equipment",
    priority: 90,
  },
  cards: {
    id: "cards",
    label: "Cards",
    description: "Card collection, slots, and card attributes.",
    pipelineId: "cards",
    ocrProfileId: "cards",
    priority: 80,
  },
  core: {
    id: "core",
    label: "Core",
    description: "Core system screen and its attributes.",
    pipelineId: "core",
    ocrProfileId: "core",
    priority: 80,
  },
  pet: {
    id: "pet",
    label: "Pet",
    description: "Pet screen, progression, and attributes.",
    pipelineId: "pet",
    ocrProfileId: "pet",
    priority: 70,
  },
  mount: {
    id: "mount",
    label: "Mount",
    description: "Mount screen, progression, and attributes.",
    pipelineId: "mount",
    ocrProfileId: "mount",
    priority: 70,
  },
  costume: {
    id: "costume",
    label: "Costume",
    description: "Costume collection and related bonuses.",
    pipelineId: "costume",
    ocrProfileId: "costume",
    priority: 60,
  },
  skills: {
    id: "skills",
    label: "Skills",
    description: "Skill list, levels, and descriptions.",
    pipelineId: "skills",
    ocrProfileId: "skills",
    priority: 60,
  },
  inventory: {
    id: "inventory",
    label: "Inventory",
    description: "Inventory contents and item quantities.",
    pipelineId: "inventory",
    ocrProfileId: "inventory",
    priority: 50,
  },
};

export const SCREEN_TYPE_LABELS: Record<ScreenType, string> =
  Object.fromEntries(
    SCREEN_TYPES.map((screenType) => [
      screenType,
      SCREEN_REGISTRY[screenType].label,
    ]),
  ) as Record<ScreenType, string>;

export function isScreenType(value: unknown): value is ScreenType {
  return (
    typeof value === "string" &&
    SCREEN_TYPES.includes(value as ScreenType)
  );
}

export function getScreenDefinition(
  value: unknown,
): ScreenDefinition {
  return isScreenType(value)
    ? SCREEN_REGISTRY[value]
    : SCREEN_REGISTRY.unknown;
}
