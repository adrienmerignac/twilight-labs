import { calculateFrameDifference } from "./frame-similarity";
import type { ExtractedVideoFrame, SelectedKeyFrame } from "./types";

export interface SelectKeyFramesOptions {
  differenceThreshold?: number;
  alwaysKeepLast?: boolean;
  onProgress?: (processed: number, total: number) => void;
}

export async function selectKeyFrames(
  frames: ExtractedVideoFrame[],
  options: SelectKeyFramesOptions = {},
): Promise<SelectedKeyFrame[]> {
  const {
    differenceThreshold = 4,
    alwaysKeepLast = true,
    onProgress,
  } = options;

  if (differenceThreshold < 0 || differenceThreshold > 100) {
    throw new Error(
      "Difference threshold must be between zero and one hundred.",
    );
  }

  const firstFrame = frames.at(0);

  if (!firstFrame) {
    return [];
  }

  const selected: SelectedKeyFrame[] = [
    {
      ...firstFrame,
      differenceFromPrevious: null,
    },
  ];

  let previousSelectedFrame = firstFrame;

  for (let index = 1; index < frames.length; index += 1) {
    const currentFrame = frames.at(index);

    if (!currentFrame) {
      continue;
    }

    const difference = await calculateFrameDifference(
      previousSelectedFrame.blob,
      currentFrame.blob,
    );

    if (difference >= differenceThreshold) {
      selected.push({
        ...currentFrame,
        differenceFromPrevious: difference,
      });

      previousSelectedFrame = currentFrame;
    }

    onProgress?.(index, frames.length - 1);
  }

  const lastFrame = frames.at(-1);
  const selectedLastFrame = selected.at(-1);

  if (alwaysKeepLast && lastFrame && selectedLastFrame?.id !== lastFrame.id) {
    selected.push({
      ...lastFrame,
      differenceFromPrevious: await calculateFrameDifference(
        previousSelectedFrame.blob,
        lastFrame.blob,
      ),
    });
  }

  return selected;
}
