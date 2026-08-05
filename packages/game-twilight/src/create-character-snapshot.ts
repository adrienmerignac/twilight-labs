import type {
  CharacterSnapshot,
  Metadata,
  Stat,
} from "@twilight-labs/domain";
import { SourceType } from "@twilight-labs/domain";

export type ParsedStat = Stat;

export interface CreateCharacterSnapshotOptions {
  id: string;
  evidenceId: string;
  extractedAt: string;
  rawText: string;
  confidence: number;
  parsedStats: ParsedStat[];
}

const METADATA_PATTERNS = {
  class: /^class\s*[:=-]?\s*(.+)$/i,
  level: /^(?:level|lv\.?)\s*[:=-]?\s*(\d+)$/i,
  expLevel:
    /^(?:exp(?:erience)?\s*(?:level|lv\.?))\s*[:=-]?\s*(\d+)$/i,
} as const;

function extractOcrMetadata(rawText: string): Pick<
  Metadata,
  "class" | "level" | "expLevel"
> {
  const metadata: Pick<Metadata, "class" | "level" | "expLevel"> = {};

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

function mapParsedStats(parsedStats: ParsedStat[]): Stat[] {
  const statIds = new Set<string>();

  return parsedStats.map((stat) => {
    if (statIds.has(stat.id)) {
      throw new Error(`Duplicate statistic: ${stat.id}.`);
    }

    statIds.add(stat.id);

    return { ...stat };
  });
}

export function createCharacterSnapshot(
  options: CreateCharacterSnapshotOptions,
): CharacterSnapshot {
  return {
    id: options.id,
    evidenceId: options.evidenceId,
    extractedAt: options.extractedAt,
    stats: mapParsedStats(options.parsedStats),
    metadata: {
      source: SourceType.Ocr,
      confidence: options.confidence / 100,
      updatedAt: options.extractedAt,
      ...extractOcrMetadata(options.rawText),
    },
  };
}
