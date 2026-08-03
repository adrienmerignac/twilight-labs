import {
  SourceType,
  type Character,
} from "@twilight-labs/domain";

import { parseTwilightStats } from "./parse-stats";

export interface CreateTwilightCharacterInput {
  id?: string;
  name: string;
  gameClass: string;
  cp: string;
  rawStats: string;
}

const createCharacterId = (name: string): string =>
  name
    .trim()
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const parseCombatPower = (input: string): number => {
  const normalized = input
    .trim()
    .replace(/\s+/g, "")
    .replace(",", ".");

  const match = normalized.match(
    /^(\d+(?:\.\d+)?)([KMBT])?$/i,
  );

  if (!match) {
    throw new Error(`Invalid combat power: "${input}"`);
  }

  const value = Number(match[1]);
  const suffix = match[2]?.toUpperCase();

  const multipliers: Readonly<Record<string, number>> = {
    K: 1_000,
    M: 1_000_000,
    B: 1_000_000_000,
    T: 1_000_000_000_000,
  };

  return value * (suffix ? multipliers[suffix] ?? 1 : 1);
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

  return {
    id: input.id?.trim() || createCharacterId(name),
    name,
    gameClass,
    cp: parseCombatPower(input.cp),
    stats: parseTwilightStats(input.rawStats),
    metadata: {
      source: SourceType.Manual,
      confidence: 1,
      updatedAt: new Date().toISOString(),
    },
  };
}
