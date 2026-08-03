import type { Metadata } from "./metadata";
import type { Stat } from "./stat";

export const IdentityConfidence = {
  Unknown: "unknown",
  Inferred: "inferred",
  Verified: "verified",
} as const;

export type IdentityConfidence =
  (typeof IdentityConfidence)[keyof typeof IdentityConfidence];

export interface GameIdentity {
  gameId: "ragnarok-twilight-global";
  uid: string;
  server?: string;
  region?: string;
  regionConfidence?: IdentityConfidence;
  serverUtcOffset?: string;
}

export interface Character {
  id: string;
  gameIdentity?: GameIdentity;
  name: string;
  gameClass: string;
  cp: number;
  stats: Stat[];
  metadata: Metadata;
}
