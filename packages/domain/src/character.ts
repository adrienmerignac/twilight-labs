import type { Metadata } from "./metadata";
import type { Stat } from "./stat";

export interface GameIdentity {
  gameId: "ragnarok-twilight-global";
  uid: string;
  server?: string;
  region?: string;
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
