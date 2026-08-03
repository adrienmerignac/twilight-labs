import type { Character } from "@twilight-labs/domain";

const STORAGE_KEY = "twilight-labs.characters";

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

    return Array.isArray(parsed) ? (parsed as Character[]) : [];
  } catch {
    return [];
  }
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

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(nextCharacters),
  );

  return nextCharacters;
}

export function deleteCharacter(characterId: string): Character[] {
  const nextCharacters = loadCharacters().filter(
    (character) => character.id !== characterId,
  );

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(nextCharacters),
  );

  return nextCharacters;
}
