"use client";

import {
  extractFrames,
  readVideoMetadata,
  selectKeyFrames,
  type ExtractedVideoFrame,
  type SelectedKeyFrame,
  type VideoMetadata,
} from "@twilight-labs/video";
import { useCallback, useEffect, useMemo, useState } from "react";

export type DisplayFrame = ExtractedVideoFrame & {
  previewUrl: string;
};

export type DisplayKeyFrame = SelectedKeyFrame & {
  previewUrl: string;
};

const revokeFrames = (
  frames: Array<{ previewUrl: string }>,
) => {
  for (const frame of frames) {
    URL.revokeObjectURL(frame.previewUrl);
  }
};

export function useVideoPipeline() {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] =
    useState<VideoMetadata | null>(null);
  const [framesPerSecond, setFramesPerSecond] = useState(2);
  const [frames, setFrames] = useState<DisplayFrame[]>([]);
  const [keyFrames, setKeyFrames] =
    useState<DisplayKeyFrame[]>([]);
  const [selectedFrameIds, setSelectedFrameIds] = useState<
    Set<string>
  >(new Set());
  const [differenceThreshold, setDifferenceThreshold] =
    useState(4);
  const [extracting, setExtracting] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detectionProgress, setDetectionProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const videoPreviewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(
    () => () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
    },
    [videoPreviewUrl],
  );

  useEffect(
    () => () => {
      revokeFrames(frames);
    },
    [frames],
  );

  useEffect(
    () => () => {
      revokeFrames(keyFrames);
    },
    [keyFrames],
  );

  const clearFrames = useCallback(() => {
    setFrames((current) => {
      revokeFrames(current);
      return [];
    });

    setKeyFrames((current) => {
      revokeFrames(current);
      return [];
    });

    setSelectedFrameIds(new Set());
    setDetectionProgress(0);
  }, []);

  const selectVideo = useCallback(
    async (selectedFile: File | undefined) => {
      if (!selectedFile) {
        return;
      }

      if (!selectedFile.type.startsWith("video/")) {
        setError("Select a browser-compatible video file.");
        return;
      }

      clearFrames();
      setFile(selectedFile);
      setMetadata(null);
      setError(null);

      try {
        setMetadata(await readVideoMetadata(selectedFile));
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to read video metadata.",
        );
      }
    },
    [clearFrames],
  );

  const extract = useCallback(async () => {
    if (!file) {
      return;
    }

    setExtracting(true);
    setError(null);
    clearFrames();

    try {
      const extractedFrames = await extractFrames(file, {
        framesPerSecond,
        maxFrames: 300,
        maxWidth: 1280,
      });

      setFrames(
        extractedFrames.map((frame) => ({
          ...frame,
          previewUrl: URL.createObjectURL(frame.blob),
        })),
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to extract video frames.",
      );
    } finally {
      setExtracting(false);
    }
  }, [clearFrames, file, framesPerSecond]);

  const detect = useCallback(async () => {
    if (frames.length === 0) {
      return;
    }

    setDetecting(true);
    setDetectionProgress(0);
    setError(null);

    setKeyFrames((current) => {
      revokeFrames(current);
      return [];
    });

    try {
      const selected = await selectKeyFrames(frames, {
        differenceThreshold,
        onProgress: (processed, total) => {
          setDetectionProgress(
            total === 0
              ? 100
              : Math.round((processed / total) * 100),
          );
        },
      });

      setKeyFrames(
        selected.map((frame) => ({
          ...frame,
          previewUrl: URL.createObjectURL(frame.blob),
        })),
      );
      setSelectedFrameIds(
        new Set(selected.map((frame) => frame.id)),
      );
      setDetectionProgress(100);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to detect key frames.",
      );
    } finally {
      setDetecting(false);
    }
  }, [differenceThreshold, frames]);

  const toggleFrame = useCallback((frameId: string) => {
    setSelectedFrameIds((current) => {
      const next = new Set(current);

      if (next.has(frameId)) {
        next.delete(frameId);
      } else {
        next.add(frameId);
      }

      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedFrameIds(
      new Set(keyFrames.map((frame) => frame.id)),
    );
  }, [keyFrames]);

  const clearSelection = useCallback(() => {
    setSelectedFrameIds(new Set());
  }, []);

  return {
    file,
    metadata,
    framesPerSecond,
    setFramesPerSecond,
    frames,
    keyFrames,
    selectedFrameIds,
    differenceThreshold,
    setDifferenceThreshold,
    extracting,
    detecting,
    detectionProgress,
    error,
    setError,
    videoPreviewUrl,
    selectVideo,
    extract,
    detect,
    toggleFrame,
    selectAll,
    clearSelection,
  };
}
