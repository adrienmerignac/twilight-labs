export const SourceType = {
  Manual: "manual",
  Ocr: "ocr",
  Video: "video",
} as const;

export type SourceType = (typeof SourceType)[keyof typeof SourceType];

export const StatCategory = {
  Basic: "basic",
  Combat: "combat",
  Defensive: "defensive",
  Element: "element",
  Special: "special",
} as const;

export type StatCategory =
  (typeof StatCategory)[keyof typeof StatCategory];
