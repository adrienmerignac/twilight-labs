import { getOcrEngine } from "./engines/registry";
import { reconstructCharacterAttributes } from "./layout/character-attributes";
import { getOcrProfile } from "./profiles/registry";
import type {
  RunOcrProfileRequest,
  RunOcrProfileResult,
} from "./types";

export async function runOcrProfile(
  request: RunOcrProfileRequest,
): Promise<RunOcrProfileResult> {
  const profile = getOcrProfile(request.profileId);
  const preprocessed = await profile.preprocess(
    request.image,
  );
  const engine = getOcrEngine(profile.engineId);
  const result = await engine.recognize({
    image: preprocessed.image,
    language: profile.language,
    pageSegmentationMode:
      profile.pageSegmentationMode,
    profileId: profile.id,
    onProgress: request.onProgress,
  });

  const reconstructedText =
    profile.id === "character-attributes" &&
    result.lines &&
    result.lines.length > 0
      ? reconstructCharacterAttributes(result.lines)
      : "";

  return {
    ...result,
    text: reconstructedText || result.text,
    profileId: profile.id,
    previewBlob: preprocessed.previewBlob,
    regionCount: 1,
  };
}
