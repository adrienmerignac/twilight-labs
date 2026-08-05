export interface CardSnapshot {
  readonly slot: number;
  readonly name: string;
  readonly level?: number;
  readonly rarity?: string;
  readonly confidence: number;
}

export interface CreateCardSnapshotOptions {
  slot: number;
  name: string;
  level?: number;
  rarity?: string;
  confidence: number;
}

export function createCardSnapshot(
  options: CreateCardSnapshotOptions,
): CardSnapshot {
  return Object.freeze({
    slot: options.slot,
    name: options.name,
    level: options.level,
    rarity: options.rarity,
    confidence: options.confidence,
  });
}
