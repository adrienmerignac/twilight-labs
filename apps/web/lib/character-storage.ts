import type { Character } from "@twilight-labs/domain";

const STORAGE_KEY = "twilight-labs.characters";
const HISTORY_STORAGE_KEY = "twilight-labs.character-history";

export type CharacterSnapshot = {
  snapshotId: string;
  character: Character;
  savedAt: string;
};

function isCharacter(value: unknown): value is Character {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<Character>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.gameClass === "string" &&
    typeof candidate.cp === "number" &&
    Array.isArray(candidate.stats) &&
    typeof candidate.metadata === "object" &&
    candidate.metadata !== null
  );
}

function isCharacterSnapshot(value: unknown): value is CharacterSnapshot {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<CharacterSnapshot>;

  return (
    typeof candidate.snapshotId === "string" &&
    typeof candidate.savedAt === "string" &&
    isCharacter(candidate.character)
  );
}

function readJsonArray(storageKey: string): unknown[] {
  if (typeof window === "undefined") return [];

  const rawValue = window.localStorage.getItem(storageKey);
  if (!rawValue) return [];

  try {
    const parsed: unknown = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
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
  if (typeof window === "undefined") return;

  const history = loadCharacterHistory();
  const previousSnapshot = getCharacterHistory(character.id)[0];

  const previousFingerprint = previousSnapshot
    ? JSON.stringify({
        cp: previousSnapshot.character.cp,
        stats: previousSnapshot.character.stats,
      })
    : null;

  const currentFingerprint = JSON.stringify({
    cp: character.cp,
    stats: character.stats,
  });

  if (previousFingerprint === currentFingerprint) return;

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
  const existingIndex = characters.findIndex(
    (existingCharacter) => existingCharacter.id === character.id,
  );

  const nextCharacters =
    existingIndex === -1
      ? [...characters, character]
      : characters.map((existingCharacter, index) =>
          index === existingIndex ? character : existingCharacter,
        );

  saveCharacterSnapshot(character);

  return saveCharacters(nextCharacters);
}

export function deleteCharacter(characterId: string): Character[] {
  return saveCharacters(
    loadCharacters().filter((character) => character.id !== characterId),
  );
}

export function clearCharacters(): void {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(HISTORY_STORAGE_KEY);
}

export function exportCharacters(): string {
  return JSON.stringify(
    {
      version: 1,
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
