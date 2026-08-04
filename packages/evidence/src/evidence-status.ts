export const EvidenceProcessingStatus = {
  Pending: "pending",
  Processed: "processed",
  Failed: "failed",
} as const;

export type EvidenceProcessingStatus =
  (typeof EvidenceProcessingStatus)[keyof typeof EvidenceProcessingStatus];
