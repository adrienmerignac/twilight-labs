import type { SourceType } from "./enums";

export interface Metadata {
  source: SourceType;
  confidence: number;
  updatedAt?: string;
  class?: string;
  level?: number;
  expLevel?: number;
}
