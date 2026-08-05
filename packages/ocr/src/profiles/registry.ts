import { passthroughPreprocess } from "../preprocess/passthrough";
import type { OcrProfile } from "../types";

const defaultProfile: OcrProfile = {
  id: "default",
  label: "Default",
  engineId: "tesseract",
  language: "eng",
  pageSegmentationMode: "auto",
  preprocess: passthroughPreprocess,
};

const profiles: Record<string, OcrProfile> = {
  default: defaultProfile,
  "character-attributes": {
    id: "character-attributes",
    label: "Character Attributes",
    engineId: "http",
    language: "en",
    pageSegmentationMode: "auto",
    preprocess: passthroughPreprocess,
  },
  cards: {
    id: "cards",
    label: "Cards",
    engineId: "http",
    language: "en",
    pageSegmentationMode: "auto",
    preprocess: passthroughPreprocess,
  },
};

export function getOcrProfile(
  profileId: string,
): OcrProfile {
  return profiles[profileId] ?? defaultProfile;
}
