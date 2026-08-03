export const ResearchStatus = {
  Draft: "draft",
  Testing: "testing",
  Partial: "partial",
  Validated: "validated",
  Refuted: "refuted",
} as const;

export type ResearchStatus =
  (typeof ResearchStatus)[keyof typeof ResearchStatus];

export const EvidenceType = {
  ManualProfile: "manual-profile",
  Screenshot: "screenshot",
  Video: "video",
  CombatExperiment: "combat-experiment",
  GameDescription: "game-description",
} as const;

export type EvidenceType =
  (typeof EvidenceType)[keyof typeof EvidenceType];

export interface Evidence {
  id: string;
  type: EvidenceType;
  title: string;
  description: string;
  sourceReference?: string;
  observedAt?: string;
}

export interface Hypothesis {
  id: string;
  title: string;
  statement: string;
  confidence: number;
  status: ResearchStatus;
  evidenceIds: string[];
  limitations: string[];
}

export interface ResearchProject {
  id: string;
  title: string;
  summary: string;
  status: ResearchStatus;
  confidence: number;
  evidence: Evidence[];
  hypotheses: Hypothesis[];
  updatedAt: string;
}
