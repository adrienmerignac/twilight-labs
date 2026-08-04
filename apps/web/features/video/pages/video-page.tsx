"use client";

import {
  extractFrames,
  readVideoMetadata,
  type ExtractedVideoFrame,
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

const formatTimestamp = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds - minutes * 60;

  return `${minutes}:${remainingSeconds
    .toFixed(1)
    .padStart(4, "0")}`;
};

export default function VideoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [framesPerSecond, setFramesPerSecond] = useState(1);
  const [frames, setFrames] = useState<DisplayFrame[]>([]);
  const [processing, setProcessing] = useState(false);
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
      for (const frame of frames) {
        URL.revokeObjectURL(frame.previewUrl);
      }
    },
    [frames],
  );

  const clearFrames = () => {
    setFrames((current) => {
      for (const frame of current) {
        URL.revokeObjectURL(frame.previewUrl);
      }

      return [];
    });
  };

  const selectVideo = async (selectedFile: File | undefined) => {
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

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
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

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <PageHeader
        eyebrow="Video foundation"
        title="Recording lab"
        description="Import a recording and extract deterministic frames in the browser. No OCR or duplicate detection yet."
      />

      <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[400px_1fr]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                Recording
              </p>
              <h2 className="mt-2 text-xl font-black">
                Import a video
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

              {error && <Badge variant="danger">{error}</Badge>}
            </CardContent>
          </Card>
        </div>

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
                description="Select a recording, choose a sampling rate, and extract the timeline."
              />
            </CardContent>
          ) : (
            <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
              {frames.map((frame) => (
                <article
                  key={frame.id}
                  className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"
                >
                  <div className="relative h-56 bg-zinc-950">
                    <Image
                      src={frame.previewUrl}
                      alt={`Video frame at ${frame.timestamp} seconds`}
                      fill
                      unoptimized
                      className="object-contain"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <p className="font-mono font-bold">
                        {formatTimestamp(frame.timestamp)}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {frame.width}×{frame.height}
                      </p>
                    </div>

                    <a
                      href={frame.previewUrl}
                      download={`${frame.id}.jpg`}
                      className="text-sm font-bold text-violet-700 hover:text-violet-900"
                    >
                      Download
                    </a>
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
