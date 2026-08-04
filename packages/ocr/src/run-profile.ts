import { getOcrEngine } from "./engines/registry";
import { getOcrProfile } from "./profiles/registry";
import type {
  OcrResult,
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

  const regions =
    preprocessed.regions ??
    (preprocessed.image
      ? [
          {
            id: "default",
            image: preprocessed.image,
            previewBlob: preprocessed.previewBlob,
          },
        ]
      : []);

  if (regions.length === 0) {
    throw new Error(
      `OCR profile "${profile.id}" produced no image regions.`,
    );
  }

  const results: OcrResult[] = [];

  for (const [index, region] of regions.entries()) {
    const result = await engine.recognize({
      image: region.image,
      language: profile.language,
      pageSegmentationMode:
        profile.pageSegmentationMode,
      onProgress: ({ status, progress }) => {
        const completedRegions = index / regions.length;
        const currentRegionProgress =
          progress / regions.length;

        request.onProgress?.({
          status: `${region.id}: ${status}`,
          progress:
            completedRegions + currentRegionProgress,
        });
      },
    });

    results.push(result);
  }

  const confidence =
    results.reduce(
      (sum, result) => sum + result.confidence,
      0,
    ) / results.length;

  return {
    engineId: profile.engineId,
    profileId: profile.id,
    text: results
      .map((result) => result.text)
      .filter(Boolean)
      .join("\n"),
    confidence,
    durationMs: results.reduce(
      (sum, result) => sum + result.durationMs,
      0,
    ),
    previewBlob:
      regions[0]?.previewBlob ??
      preprocessed.previewBlob,
    regionCount: regions.length,
  };
}
