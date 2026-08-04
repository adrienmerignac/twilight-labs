import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader } from "@repo/ui/card";
import type { ChangeEvent } from "react";

type VideoControlPanelProps = {
  file: File | null;
  videoPreviewUrl: string | null;
  framesPerSecond: number;
  differenceThreshold: number;
  frameCount: number;
  extracting: boolean;
  detecting: boolean;
  detectionProgress: number;
  error: string | null;
  onSelectVideo: (file: File | undefined) => void;
  onFramesPerSecondChange: (value: number) => void;
  onThresholdChange: (value: number) => void;
  onExtract: () => void;
  onDetect: () => void;
};

export function VideoControlPanel({
  file,
  videoPreviewUrl,
  framesPerSecond,
  differenceThreshold,
  frameCount,
  extracting,
  detecting,
  detectionProgress,
  error,
  onSelectVideo,
  onFramesPerSecondChange,
  onThresholdChange,
  onExtract,
  onDetect,
}: VideoControlPanelProps) {
  const handleInput = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    onSelectVideo(event.target.files?.[0]);
    event.target.value = "";
  };

  return (
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
              onFramesPerSecondChange(
                Number(event.target.value),
              )
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
          onClick={onExtract}
          disabled={!file || extracting}
        >
          {extracting ? "Extracting frames…" : "Extract frames"}
        </Button>

        {frameCount > 0 && (
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
                  onThresholdChange(
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
              onClick={onDetect}
              disabled={detecting}
            >
              {detecting
                ? `Detecting… ${detectionProgress}%`
                : "Detect key frames"}
            </Button>
          </div>
        )}

        {error && <Badge variant="danger">{error}</Badge>}
      </CardContent>
    </Card>
  );
}
