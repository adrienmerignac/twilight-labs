import type { Metadata } from "./metadata";
import type { Stat } from "./stat";

export interface Character {
  id: string;
  name: string;
  gameClass: string;
  cp: number;
  stats: Stat[];
  metadata: Metadata;
}
