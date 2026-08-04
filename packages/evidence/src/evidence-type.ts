export const EvidenceType = {
  Screenshot: "screenshot",
  VideoFrame: "video-frame",
  Manual: "manual",
  OcrOutput: "ocr-output",
  ApiPayload: "api-payload",
} as const;

export type EvidenceType =
  (typeof EvidenceType)[keyof typeof EvidenceType];
