import type {
  Character,
  GameIdentity,
} from "@twilight-labs/domain";

const STORAGE_KEY = "twilight-labs.characters";
const HISTORY_STORAGE_KEY = "twilight-labs.character-history";

export type CharacterSnapshot = {
  snapshotId: string;
  character: Character;
  savedAt: string;
};

function isGameIdentity(value: unknown): value is GameIdentity {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<GameIdentity>;

  return (
    candidate.gameId === "ragnarok-twilight-global" &&
    typeof candidate.uid === "string" &&
    candidate.uid.length > 0 &&
    (candidate.server === undefined ||
      typeof candidate.server === "string") &&
    (candidate.region === undefined ||
      typeof candidate.region === "string") &&
    (candidate.regionConfidence === undefined ||
      ["unknown", "inferred", "verified"].includes(
        candidate.regionConfidence,
      )) &&
    (candidate.serverUtcOffset === undefined ||
      typeof candidate.serverUtcOffset === "string")
  );
}

function isCharacter(value: unknown): value is Character {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<Character>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.gameClass === "string" &&
    typeof candidate.cp === "number" &&
    Array.isArray(candidate.stats) &&
    typeof candidate.metadata === "object" &&
    candidate.metadata !== null &&
    (candidate.gameIdentity === undefined ||
      isGameIdentity(candidate.gameIdentity))
  );
}

function isCharacterSnapshot(value: unknown): value is CharacterSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<CharacterSnapshot>;

  return (
    typeof candidate.snapshotId === "string" &&
    typeof candidate.savedAt === "string" &&
    isCharacter(candidate.character)
  );
}

function readJsonArray(storageKey: string): unknown[] {
  if (typeof window === "undefined") {
    return [];
  }

  const rawValue = window.localStorage.getItem(storageKey);

  if (!rawValue) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(rawValue);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const normalizeIdentityPart = (value: string | undefined) =>
  value?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "unknown";

export function createGameIdentityId(
  identity: GameIdentity,
): string {
  return [
    "rtg",
    normalizeIdentityPart(identity.region),
    normalizeIdentityPart(identity.server),
    normalizeIdentityPart(identity.uid),
  ].join(":");
}

export function loadCharacters(): Character[] {
  return readJsonArray(STORAGE_KEY).filter(isCharacter);
}

export function saveCharacters(characters: Character[]): Character[] {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
  }

  return characters;
}

export function loadCharacterHistory(): CharacterSnapshot[] {
  return readJsonArray(HISTORY_STORAGE_KEY).filter(isCharacterSnapshot);
}

export function getCharacterHistory(characterId: string): CharacterSnapshot[] {
  return loadCharacterHistory()
    .filter((snapshot) => snapshot.character.id === characterId)
    .sort(
      (first, second) =>
        new Date(second.savedAt).getTime() -
        new Date(first.savedAt).getTime(),
    );
}

function saveCharacterSnapshot(character: Character): void {
  if (typeof window === "undefined") {
    return;
  }

  const history = loadCharacterHistory();
  const previousSnapshot = getCharacterHistory(character.id)[0];

  const previousFingerprint = previousSnapshot
    ? JSON.stringify({
        cp: previousSnapshot.character.cp,
        stats: previousSnapshot.character.stats,
        gameIdentity: previousSnapshot.character.gameIdentity,
      })
    : null;

  const currentFingerprint = JSON.stringify({
    cp: character.cp,
    stats: character.stats,
    gameIdentity: character.gameIdentity,
  });

  if (previousFingerprint === currentFingerprint) {
    return;
  }

  const savedAt = new Date().toISOString();

  window.localStorage.setItem(
    HISTORY_STORAGE_KEY,
    JSON.stringify([
      ...history,
      {
        snapshotId: `${character.id}-${savedAt}`,
        character,
        savedAt,
      },
    ]),
  );
}

export function saveCharacter(character: Character): Character[] {
  const characters = loadCharacters();

  const existingIndex = characters.findIndex((existingCharacter) => {
    if (
      character.gameIdentity &&
      existingCharacter.gameIdentity?.uid === character.gameIdentity.uid
    ) {
      return true;
    }

    return existingCharacter.id === character.id;
  });

  const nextCharacters =
    existingIndex === -1
      ? [...characters, character]
      : characters.map((existingCharacter, index) =>
          index === existingIndex ? character : existingCharacter,
        );

  saveCharacterSnapshot(character);

  return saveCharacters(nextCharacters);
}

export function linkGameIdentity(
  characterId: string,
  identity: GameIdentity,
): Character[] {
  const uid = identity.uid.trim();

  if (!uid) {
    throw new Error("UID is required.");
  }

  const normalizedIdentity: GameIdentity = {
    gameId: "ragnarok-twilight-global",
    uid,
    server: identity.server?.trim() || undefined,
    region: identity.region?.trim() || undefined,
    regionConfidence: identity.regionConfidence ?? "unknown",
    serverUtcOffset: identity.serverUtcOffset?.trim() || undefined,
  };

  const characters = loadCharacters();

  const duplicate = characters.find(
    (character) =>
      character.id !== characterId &&
      character.gameIdentity?.uid === normalizedIdentity.uid,
  );

  if (duplicate) {
    throw new Error(
      `UID ${normalizedIdentity.uid} is already linked to ${duplicate.name}.`,
    );
  }

  const character = characters.find(
    (candidate) => candidate.id === characterId,
  );

  if (!character) {
    throw new Error("Character not found.");
  }

  const updatedCharacter: Character = {
    ...character,
    gameIdentity: normalizedIdentity,
  };

  saveCharacterSnapshot(updatedCharacter);

  return saveCharacters(
    characters.map((candidate) =>
      candidate.id === characterId ? updatedCharacter : candidate,
    ),
  );
}

export function unlinkGameIdentity(characterId: string): Character[] {
  const characters = loadCharacters();
  const character = characters.find(
    (candidate) => candidate.id === characterId,
  );

  if (!character) {
    throw new Error("Character not found.");
  }

  const { gameIdentity: _gameIdentity, ...characterWithoutIdentity } =
    character;

  const updatedCharacter: Character = characterWithoutIdentity;

  saveCharacterSnapshot(updatedCharacter);

  return saveCharacters(
    characters.map((candidate) =>
      candidate.id === characterId ? updatedCharacter : candidate,
    ),
  );
}

export function deleteCharacter(characterId: string): Character[] {
  return saveCharacters(
    loadCharacters().filter((character) => character.id !== characterId),
  );
}

export function clearCharacters(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(HISTORY_STORAGE_KEY);
}

export function exportCharacters(): string {
  return JSON.stringify(
    {
      version: 2,
      exportedAt: new Date().toISOString(),
      characters: loadCharacters(),
      history: loadCharacterHistory(),
    },
    null,
    2,
  );
}

export function importCharacters(rawValue: string): Character[] {
  const parsed: unknown = JSON.parse(rawValue);

  if (Array.isArray(parsed)) {
    if (!parsed.every(isCharacter)) {
      throw new Error("The imported file contains invalid character data.");
    }

    return saveCharacters(parsed);
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("The imported file has an unsupported structure.");
  }

  const candidate = parsed as {
    characters?: unknown;
    history?: unknown;
  };

  if (
    !Array.isArray(candidate.characters) ||
    !candidate.characters.every(isCharacter)
  ) {
    throw new Error("The imported file contains invalid character data.");
  }

  if (
    candidate.history !== undefined &&
    (!Array.isArray(candidate.history) ||
      !candidate.history.every(isCharacterSnapshot))
  ) {
    throw new Error("The imported file contains invalid history data.");
  }

  saveCharacters(candidate.characters);

  if (typeof window !== "undefined" && Array.isArray(candidate.history)) {
    window.localStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify(candidate.history),
    );
  }

  return candidate.characters;
}
