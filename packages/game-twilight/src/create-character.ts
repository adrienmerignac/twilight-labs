import {
  IdentityConfidence,
  SourceType,
  type Character,
  type GameIdentity,
} from "@twilight-labs/domain";
import { parseNumber } from "@twilight-labs/parser";

import { parseTwilightStats } from "./parse-stats";

export interface CreateTwilightCharacterInput {
  id?: string;
  name: string;
  gameClass: string;
  cp: string;
  rawStats: string;
  uid?: string;
  server?: string;
  region?: string;
  regionConfidence?: IdentityConfidence;
  serverUtcOffset?: string;
}

const createCharacterId = (name: string): string =>
  name
    .trim()
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const createGameIdentity = (
  input: CreateTwilightCharacterInput,
): GameIdentity | undefined => {
  const uid = input.uid?.trim();

  if (!uid) {
    return undefined;
  }

  return {
    gameId: "ragnarok-twilight-global",
    uid,
    server: input.server?.trim() || undefined,
    region: input.region?.trim() || undefined,
    regionConfidence:
      input.regionConfidence ?? IdentityConfidence.Unknown,
    serverUtcOffset: input.serverUtcOffset?.trim() || undefined,
  };
};

export function createTwilightCharacter(
  input: CreateTwilightCharacterInput,
): Character {
  const name = input.name.trim();
  const gameClass = input.gameClass.trim();

  if (!name) {
    throw new Error("Character name is required.");
  }

  if (!gameClass) {
    throw new Error("Character class is required.");
  }

  const combatPower = parseNumber(input.cp);

  if (combatPower.unit !== "flat") {
    throw new Error("Combat power must be a flat numeric value.");
  }

  return {
    id: input.id?.trim() || createCharacterId(name),
    gameIdentity: createGameIdentity(input),
    name,
    gameClass,
    cp: combatPower.value,
    stats: parseTwilightStats(input.rawStats),
    metadata: {
      source: SourceType.Manual,
      confidence: 1,
      updatedAt: new Date().toISOString(),
    },
  };
}
