import { preprocessCharacterAttributeColumns } from "../preprocess/character-attributes-columns";
import { passthroughPreprocess } from "../preprocess/passthrough";
import type { OcrProfile } from "../types";

const profiles: Record<string, OcrProfile> = {
  default: {
    id: "default",
    label: "Default",
    engineId: "tesseract",
    language: "eng",
    pageSegmentationMode: "auto",
    preprocess: passthroughPreprocess,
  },
  "character-attributes": {
    id: "character-attributes",
    label: "Character Attributes",
    engineId: "tesseract",
    language: "eng",
    pageSegmentationMode: "sparse-text",
    preprocess: preprocessCharacterAttributeColumns,
  },
};

export function getOcrProfile(
  profileId: string,
): OcrProfile {
  const profile = profiles[profileId];
  const defaultProfile = profiles.default;

  if (profile) {
    return profile;
  }

  if (!defaultProfile) {
    throw new Error("Default OCR profile is missing.");
  }

  return defaultProfile;
}
