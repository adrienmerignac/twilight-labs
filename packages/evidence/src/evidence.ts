import type { EvidenceProcessingStatus } from "./evidence-status";
import type { EvidenceType } from "./evidence-type";

export interface EvidenceSource {
  filename: string;
  mimeType: string;
  size: number;
}

export interface EvidenceProcessing {
  status: EvidenceProcessingStatus;
  updatedAt: string;
  error?: string;
}

export interface Evidence {
  id: string;
  characterId: string;
  type: EvidenceType;
  createdAt: string;
  source: EvidenceSource;
  metadata: Readonly<Record<string, unknown>>;
  processing?: EvidenceProcessing;
}
