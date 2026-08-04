import { createFrameTimestamps } from "./timeline";
import type {
  ExtractedVideoFrame,
  ExtractFramesOptions,
  VideoMetadata,
} from "./types";

const createFrameId = (timestamp: number, index: number) =>
  `frame-${index}-${Math.round(timestamp * 1000)}`;

const waitForEvent = (
  target: EventTarget,
  eventName: string,
  errorEventName = "error",
): Promise<void> =>
  new Promise((resolve, reject) => {
    const cleanup = () => {
      target.removeEventListener(eventName, handleSuccess);
      target.removeEventListener(errorEventName, handleError);
    };

    const handleSuccess = () => {
      cleanup();
      resolve();
    };

    const handleError = () => {
      cleanup();
      reject(new Error(`Video ${errorEventName} event received.`));
    };

    target.addEventListener(eventName, handleSuccess, { once: true });
    target.addEventListener(errorEventName, handleError, { once: true });
  });

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error("Unable to encode the extracted video frame."));
      },
      type,
      quality,
    );
  });

const calculateDimensions = (
  sourceWidth: number,
  sourceHeight: number,
  maxWidth: number | undefined,
) => {
  if (!maxWidth || sourceWidth <= maxWidth) {
    return {
      width: sourceWidth,
      height: sourceHeight,
    };
  }

  const scale = maxWidth / sourceWidth;

  return {
    width: Math.round(sourceWidth * scale),
    height: Math.round(sourceHeight * scale),
  };
};

export async function readVideoMetadata(
  file: Blob,
): Promise<VideoMetadata> {
  const video = document.createElement("video");
  const objectUrl = URL.createObjectURL(file);

  video.preload = "metadata";
  video.muted = true;
  video.playsInline = true;

  try {
    video.src = objectUrl;
    await waitForEvent(video, "loadedmetadata");

    return {
      duration: video.duration,
      width: video.videoWidth,
      height: video.videoHeight,
    };
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(objectUrl);
  }
}

export async function extractFrames(
  file: Blob,
  options: ExtractFramesOptions = {},
): Promise<ExtractedVideoFrame[]> {
  const {
    framesPerSecond = 1,
    imageType = "image/jpeg",
    imageQuality = 0.88,
    maxFrames = 600,
    maxWidth = 1280,
  } = options;

  const video = document.createElement("video");
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", {
    alpha: imageType !== "image/jpeg",
  });
  const objectUrl = URL.createObjectURL(file);

  if (!context) {
    URL.revokeObjectURL(objectUrl);
    throw new Error("Canvas 2D context is not available.");
  }

  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;

  try {
    video.src = objectUrl;
    await waitForEvent(video, "loadedmetadata");

    const timestamps = createFrameTimestamps({
      duration: video.duration,
      framesPerSecond,
      maxFrames,
    });
    const dimensions = calculateDimensions(
      video.videoWidth,
      video.videoHeight,
      maxWidth,
    );

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const frames: ExtractedVideoFrame[] = [];

    for (const [index, timestamp] of timestamps.entries()) {
      if (Math.abs(video.currentTime - timestamp) > 0.001) {
        const seekPromise = waitForEvent(video, "seeked");
        video.currentTime = timestamp;
        await seekPromise;
      }

      context.drawImage(
        video,
        0,
        0,
        dimensions.width,
        dimensions.height,
      );

      frames.push({
        id: createFrameId(timestamp, index),
        timestamp,
        width: dimensions.width,
        height: dimensions.height,
        blob: await canvasToBlob(
          canvas,
          imageType,
          imageQuality,
        ),
      });
    }

    return frames;
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(objectUrl);
  }
}
