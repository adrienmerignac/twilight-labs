"use client";

import {
  extractFrames,
  readVideoMetadata,
  selectKeyFrames,
  type ExtractedVideoFrame,
  type SelectedKeyFrame,
  type VideoMetadata,
} from "@twilight-labs/video";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader } from "@repo/ui/card";
import { EmptyState } from "@repo/ui/empty-state";
import { Metric } from "@repo/ui/metric";
import { PageHeader } from "@repo/ui/page-header";
import Image from "next/image";
import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";

type DisplayFrame = ExtractedVideoFrame & {
  previewUrl: string;
};

type DisplayKeyFrame = SelectedKeyFrame & {
  previewUrl: string;
};

const formatTimestamp = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds - minutes * 60;

  return `${minutes}:${remainingSeconds
    .toFixed(1)
    .padStart(4, "0")}`;
};

const revokeFrames = (
  frames: Array<{ previewUrl: string }>,
) => {
  for (const frame of frames) {
    URL.revokeObjectURL(frame.previewUrl);
  }
};

export default function VideoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] =
    useState<VideoMetadata | null>(null);
  const [framesPerSecond, setFramesPerSecond] = useState(2);
  const [frames, setFrames] = useState<DisplayFrame[]>([]);
  const [keyFrames, setKeyFrames] =
    useState<DisplayKeyFrame[]>([]);
  const [differenceThreshold, setDifferenceThreshold] =
    useState(4);
  const [processing, setProcessing] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [progress, setProgress] = useState(0);
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

  const clearFrames = () => {
    setFrames((current) => {
      revokeFrames(current);
      return [];
    });

    setKeyFrames((current) => {
      revokeFrames(current);
      return [];
    });

    setProgress(0);
  };

  const selectVideo = async (
    selectedFile: File | undefined,
  ) => {
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
  };

  const handleInput = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    void selectVideo(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleExtract = async () => {
    if (!file) {
      return;
    }

    setProcessing(true);
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
      setProcessing(false);
    }
  };

  const handleDetect = async () => {
    if (frames.length === 0) {
      return;
    }

    setDetecting(true);
    setProgress(0);
    setError(null);

    setKeyFrames((current) => {
      revokeFrames(current);
      return [];
    });

    try {
      const selected = await selectKeyFrames(frames, {
        differenceThreshold,
        onProgress: (processed, total) => {
          setProgress(
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
      setProgress(100);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to detect key frames.",
      );
    } finally {
      setDetecting(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <PageHeader
        eyebrow="Video pipeline"
        title="Recording lab"
        description="Extract a timeline, compare frames visually, and keep only meaningful screen changes."
      />

      <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric
          label="Duration"
          value={
            metadata ? `${metadata.duration.toFixed(1)}s` : "—"
          }
        />
        <Metric
          label="Resolution"
          value={
            metadata
              ? `${metadata.width}×${metadata.height}`
              : "—"
          }
        />
        <Metric
          label="Sampling"
          value={`${framesPerSecond} FPS`}
        />
        <Metric label="Frames" value={String(frames.length)} />
        <Metric
          label="Key frames"
          value={String(keyFrames.length)}
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[400px_1fr]">
        <Card>
          <CardHeader>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
              Recording
            </p>
            <h2 className="mt-2 text-xl font-black">
              Import and analyze
            </h2>
          </CardHeader>

          <CardContent className="space-y-5">
            <label className="flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-6 text-center transition hover:border-violet-400">
              <span className="text-4xl">＋</span>
              <span className="mt-4 font-black">
                Select a recording
              </span>
              <span className="mt-2 text-sm text-zinc-500">
                MP4, MOV, WebM, or another browser-supported format
              </span>
              <input
                type="file"
                accept="video/*"
                onChange={handleInput}
                className="sr-only"
              />
            </label>

            {file && videoPreviewUrl && (
              <div>
                <video
                  src={videoPreviewUrl}
                  controls
                  preload="metadata"
                  className="w-full rounded-2xl bg-black"
                />
                <p className="mt-3 truncate text-sm font-semibold">
                  {file.name}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            )}

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold">
                Frames per second
              </span>
              <select
                value={framesPerSecond}
                onChange={(event) =>
                  setFramesPerSecond(Number(event.target.value))
                }
                className="rounded-xl border border-zinc-300 bg-white px-4 py-3"
              >
                <option value={0.5}>0.5 FPS</option>
                <option value={1}>1 FPS</option>
                <option value={2}>2 FPS</option>
              </select>
            </label>

            <Button
              className="w-full"
              onClick={handleExtract}
              disabled={!file || processing}
            >
              {processing ? "Extracting frames…" : "Extract frames"}
            </Button>

            {frames.length > 0 && (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold">
                    Visual difference threshold
                  </span>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={differenceThreshold}
                    onChange={(event) =>
                      setDifferenceThreshold(
                        Number(event.target.value),
                      )
                    }
                  />
                  <span className="text-xs text-zinc-500">
                    {differenceThreshold.toFixed(1)}% · lower keeps more frames
                  </span>
                </label>

                <Button
                  className="mt-4 w-full"
                  onClick={handleDetect}
                  disabled={detecting}
                >
                  {detecting
                    ? `Detecting… ${progress}%`
                    : "Detect key frames"}
                </Button>
              </div>
            )}

            {error && <Badge variant="danger">{error}</Badge>}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                Extracted timeline
              </p>
              <h2 className="mt-2 text-xl font-black">
                Frame gallery
              </h2>
            </div>

            {frames.length > 0 && (
              <Badge variant="research">
                {frames.length} frames
              </Badge>
            )}
          </CardHeader>

          {frames.length === 0 ? (
            <CardContent>
              <EmptyState
                title="No frames extracted"
                description="Select a recording and extract its timeline."
              />
            </CardContent>
          ) : (
            <div className="grid max-h-[900px] gap-5 overflow-y-auto p-5 md:grid-cols-2 xl:grid-cols-3">
              {frames.map((frame) => (
                <article
                  key={frame.id}
                  className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"
                >
                  <div className="relative h-48 bg-zinc-950">
                    <Image
                      src={frame.previewUrl}
                      alt={`Video frame at ${frame.timestamp} seconds`}
                      fill
                      unoptimized
                      className="object-contain"
                    />
                  </div>

                  <div className="p-4">
                    <p className="font-mono font-bold">
                      {formatTimestamp(frame.timestamp)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {frame.width}×{frame.height}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>
      </section>

      <section className="mt-8">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                Key frame detection
              </p>
              <h2 className="mt-2 text-xl font-black">
                Selected screen changes
              </h2>
            </div>

            {keyFrames.length > 0 && (
              <Badge variant="success">
                {keyFrames.length} kept ·{" "}
                {frames.length - keyFrames.length} removed
              </Badge>
            )}
          </CardHeader>

          {keyFrames.length === 0 ? (
            <CardContent>
              <EmptyState
                title="No key frames detected"
                description="Extract frames, adjust the threshold, and detect meaningful screen changes."
              />
            </CardContent>
          ) : (
            <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-4">
              {keyFrames.map((frame) => (
                <article
                  key={`key-${frame.id}`}
                  className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"
                >
                  <div className="relative h-56 bg-zinc-950">
                    <Image
                      src={frame.previewUrl}
                      alt={`Key frame at ${frame.timestamp} seconds`}
                      fill
                      unoptimized
                      className="object-contain"
                    />
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-mono font-bold">
                          {formatTimestamp(frame.timestamp)}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {frame.differenceFromPrevious === null
                            ? "First frame"
                            : `${frame.differenceFromPrevious.toFixed(2)}% difference`}
                        </p>
                      </div>

                      <Badge variant="success">Kept</Badge>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>
      </section>
    </main>
  );
}
