import type { Metadata } from "./metadata";
import type { Stat } from "./stat";

export interface CharacterSnapshot {
  id: string;

  characterId?: string;

  evidenceId: string;

  stats: Stat[];

  metadata: Metadata;

  extractedAt: string;
}
