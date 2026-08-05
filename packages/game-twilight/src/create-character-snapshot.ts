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
  confidence: number;
  metadata: Pick<Metadata, "class" | "level" | "expLevel">;
  parsedStats: ParsedStat[];
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
      confidence: options.confidence,
      updatedAt: options.extractedAt,
      ...options.metadata,
    },
  };
}
