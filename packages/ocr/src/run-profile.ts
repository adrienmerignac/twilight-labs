import { getOcrEngine } from "./engines/registry";
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

  return {
    ...result,
    profileId: profile.id,
    previewBlob: preprocessed.previewBlob,
    regionCount: 1,
  };
}
