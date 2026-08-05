import type {
  CharacterSnapshot,
  Metadata,
  Stat,
} from "@twilight-labs/domain";

export interface CreateCharacterSnapshotOptions {
  evidenceId: string;
  metadata: Metadata;
  stats: Stat[];
}

export function createCharacterSnapshot(
  options: CreateCharacterSnapshotOptions,
): CharacterSnapshot {
  return {
    id: crypto.randomUUID(),
    evidenceId: options.evidenceId,
    metadata: options.metadata,
    stats: options.stats,
    extractedAt: new Date().toISOString(),
  };
}
