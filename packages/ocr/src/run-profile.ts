import { getOcrEngine } from "./engines/registry";
import { reconstructCharacterAttributes } from "./layout/character-attributes";
import { getOcrProfile } from "./profiles/registry";
import type {
  RunOcrProfileRequest,
  RunOcrProfileResult,
} from "./types";

const throwIfAborted = (signal?: AbortSignal): void => {
  if (signal?.aborted) {
    throw signal.reason ?? new Error("OCR was canceled.");
  }
};

export async function runOcrProfile(
  request: RunOcrProfileRequest,
): Promise<RunOcrProfileResult> {
  const profile = getOcrProfile(request.profileId);
  throwIfAborted(request.signal);
  const preprocessed = await profile.preprocess(
    request.image,
  );
  throwIfAborted(request.signal);
  const engine = getOcrEngine(profile.engineId);
  const result = await engine.recognize({
    image: preprocessed.image,
    language: profile.language,
    pageSegmentationMode:
      profile.pageSegmentationMode,
    profileId: profile.id,
    signal: request.signal,
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
