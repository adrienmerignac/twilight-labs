export interface OcrCharacterMetadata {
  class?: string;
  level?: number;
  expLevel?: number;
}

const METADATA_PATTERNS = {
  class: /^class\s*[:=-]?\s*(.+)$/i,
  level: /^(?:level|lv\.?)\s*[:=-]?\s*(\d+)$/i,
  expLevel:
    /^(?:exp(?:erience)?\s*(?:level|lv\.?))\s*[:=-]?\s*(\d+)$/i,
} as const;

export function extractOcrCharacterMetadata(
  rawText: string,
): OcrCharacterMetadata {
  const metadata: OcrCharacterMetadata = {};

  for (const rawLine of rawText.split(/\r?\n/)) {
    const line = rawLine.trim();

    const classMatch = line.match(METADATA_PATTERNS.class);
    if (classMatch?.[1]) {
      metadata.class = classMatch[1].trim();
      continue;
    }

    const expLevelMatch = line.match(METADATA_PATTERNS.expLevel);
    if (expLevelMatch?.[1]) {
      metadata.expLevel = Number(expLevelMatch[1]);
      continue;
    }

    const levelMatch = line.match(METADATA_PATTERNS.level);
    if (levelMatch?.[1]) {
      metadata.level = Number(levelMatch[1]);
    }
  }

  return metadata;
}

export const normalizeOcrConfidence = (confidence: number) =>
  confidence / 100;
