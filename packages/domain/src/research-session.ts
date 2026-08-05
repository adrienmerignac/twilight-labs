import type { CharacterSnapshot } from "./character-snapshot";
import type { ResearchTimeline } from "./research-timeline";

export interface IdentifiedEvidence {
  id: string;
}

export interface ResearchSession<
  Evidence extends IdentifiedEvidence = IdentifiedEvidence,
> {
  readonly id: string;
  readonly videoId: string;
  readonly createdAt: string;
  readonly evidences: readonly Evidence[];
  readonly snapshots: readonly CharacterSnapshot[];
  readonly timeline: ResearchTimeline;
}

export interface CreateResearchSessionOptions<
  Evidence extends IdentifiedEvidence,
> {
  id: string;
  videoId: string;
  createdAt: string;
  evidences: readonly Evidence[];
  snapshots: readonly CharacterSnapshot[];
  timeline: ResearchTimeline;
}

function copyUniqueById<Item extends { id: string }>(
  items: readonly Item[],
  itemName: string,
): readonly Item[] {
  const ids = new Set<string>();

  for (const item of items) {
    if (ids.has(item.id)) {
      throw new Error(`Duplicate ${itemName} id: ${item.id}.`);
    }

    ids.add(item.id);
  }

  return Object.freeze([...items]);
}

export function createResearchSession<
  Evidence extends IdentifiedEvidence,
>(
  options: CreateResearchSessionOptions<Evidence>,
): ResearchSession<Evidence> {
  return Object.freeze({
    id: options.id,
    videoId: options.videoId,
    createdAt: options.createdAt,
    evidences: copyUniqueById(options.evidences, "evidence"),
    snapshots: copyUniqueById(options.snapshots, "snapshot"),
    timeline: options.timeline,
  });
}
