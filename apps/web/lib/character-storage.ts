import type { Character } from "@twilight-labs/domain";

const STORAGE_KEY = "twilight-labs.characters";

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
    candidate.metadata !== null
  );
}

export function loadCharacters(): Character[] {
  if (typeof window === "undefined") {
    return [];
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(rawValue);

    return Array.isArray(parsed) ? parsed.filter(isCharacter) : [];
  } catch {
    return [];
  }
}

export function saveCharacters(characters: Character[]): Character[] {
  if (typeof window === "undefined") {
    return characters;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));

  return characters;
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

  return saveCharacters(nextCharacters);
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
}

export function exportCharacters(): string {
  return JSON.stringify(loadCharacters(), null, 2);
}

export function importCharacters(rawValue: string): Character[] {
  const parsed: unknown = JSON.parse(rawValue);

  if (!Array.isArray(parsed)) {
    throw new Error("The imported file must contain a JSON array.");
  }

  if (!parsed.every(isCharacter)) {
    throw new Error("The imported file contains invalid character data.");
  }

  return saveCharacters(parsed);
}
