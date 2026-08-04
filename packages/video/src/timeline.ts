export interface CreateFrameTimestampsOptions {
  duration: number;
  framesPerSecond: number;
  maxFrames?: number;
}

export function createFrameTimestamps({
  duration,
  framesPerSecond,
  maxFrames = 600,
}: CreateFrameTimestampsOptions): number[] {
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error("Video duration must be greater than zero.");
  }

  if (!Number.isFinite(framesPerSecond) || framesPerSecond <= 0) {
    throw new Error("Frames per second must be greater than zero.");
  }

  if (!Number.isInteger(maxFrames) || maxFrames <= 0) {
    throw new Error("Maximum frame count must be a positive integer.");
  }

  const interval = 1 / framesPerSecond;
  const count = Math.min(
    Math.ceil(duration * framesPerSecond),
    maxFrames,
  );

  return Array.from({ length: count }, (_, index) =>
    Math.min(index * interval, Math.max(0, duration - 0.001)),
  );
}
