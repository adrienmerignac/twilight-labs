export interface ExtractFramesOptions {
  framesPerSecond?: number;
  imageType?: "image/jpeg" | "image/png" | "image/webp";
  imageQuality?: number;
  maxFrames?: number;
  maxWidth?: number;
}

export interface ExtractedVideoFrame {
  id: string;
  timestamp: number;
  width: number;
  height: number;
  blob: Blob;
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
}
