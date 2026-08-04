import type { Character } from "@twilight-labs/domain";
import {
  SCREEN_TYPES,
  SCREEN_TYPE_LABELS,
  type ScreenType,
} from "@twilight-labs/evidence";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader } from "@repo/ui/card";
import { EmptyState } from "@repo/ui/empty-state";
import Image from "next/image";

import type { DisplayKeyFrame } from "../hooks/use-video-pipeline";
import { formatTimestamp } from "./video-format";

type KeyFrameReviewProps = {
  frames: DisplayKeyFrame[];
  originalFrameCount: number;
  selectedFrameIds: Set<string>;
  classifications: Record<string, ScreenType>;
  characters: Character[];
  characterId: string;
  importing: boolean;
  message: string | null;
  onCharacterChange: (characterId: string) => void;
  onClassificationChange: (
    frameId: string,
    screenType: ScreenType,
  ) => void;
  onToggleFrame: (frameId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onSend: () => void;
};

export function KeyFrameReview({
  frames,
  originalFrameCount,
  selectedFrameIds,
  classifications,
  characters,
  characterId,
  importing,
  message,
  onCharacterChange,
  onClassificationChange,
  onToggleFrame,
  onSelectAll,
  onClearSelection,
  onSend,
}: KeyFrameReviewProps) {
  const classifiedCount = frames.filter(
    (frame) =>
      (classifications[frame.id] ?? "unknown") !== "unknown",
  ).length;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
            Screen classification
          </p>
          <h2 className="mt-2 text-xl font-black">
            Review detected screens
          </h2>
        </div>

        {frames.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">
              {frames.length} kept
            </Badge>
            <Badge variant="research">
              {classifiedCount}/{frames.length} classified
            </Badge>
            <Badge variant="neutral">
              {originalFrameCount - frames.length} removed
            </Badge>
          </div>
        )}
      </CardHeader>

      {frames.length === 0 ? (
        <CardContent>
          <EmptyState
            title="No key frames detected"
            description="Extract frames, adjust the threshold, and detect meaningful screen changes."
          />
        </CardContent>
      ) : (
        <>
          <div className="border-b border-zinc-200 bg-zinc-50 p-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold">
                  Send selected frames to
                </span>
                <select
                  value={characterId}
                  onChange={(event) =>
                    onCharacterChange(event.target.value)
                  }
                  className="rounded-xl border border-zinc-300 bg-white px-4 py-3"
                >
                  {characters.map((character) => (
                    <option
                      key={character.id}
                      value={character.id}
                    >
                      {character.name} — {character.gameClass}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onSelectAll}
                  className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-bold hover:bg-zinc-100"
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={onClearSelection}
                  className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-bold hover:bg-zinc-100"
                >
                  Clear
                </button>
                <Button
                  onClick={onSend}
                  disabled={
                    importing ||
                    selectedFrameIds.size === 0 ||
                    !characterId
                  }
                >
                  {importing
                    ? "Sending…"
                    : `Send ${selectedFrameIds.size} to Inbox`}
                </Button>
              </div>
            </div>

            {message && (
              <div className="mt-4">
                <Badge variant="success">{message}</Badge>
              </div>
            )}
          </div>

          <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-4">
            {frames.map((frame) => {
              const selected = selectedFrameIds.has(frame.id);
              const screenType =
                classifications[frame.id] ?? "unknown";

              return (
                <article
                  key={frame.id}
                  className={[
                    "overflow-hidden rounded-2xl border bg-white transition",
                    selected
                      ? "border-violet-500 ring-4 ring-violet-100"
                      : "border-zinc-200",
                  ].join(" ")}
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

                  <div className="space-y-4 p-4">
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

                      <Badge
                        variant={
                          screenType === "unknown"
                            ? "warning"
                            : "success"
                        }
                      >
                        {SCREEN_TYPE_LABELS[screenType]}
                      </Badge>
                    </div>

                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">
                        Screen type
                      </span>
                      <select
                        value={screenType}
                        onChange={(event) =>
                          onClassificationChange(
                            frame.id,
                            event.target.value as ScreenType,
                          )
                        }
                        className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm"
                      >
                        {SCREEN_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {SCREEN_TYPE_LABELS[type]}
                          </option>
                        ))}
                      </select>
                    </label>

                    <button
                      type="button"
                      onClick={() => onToggleFrame(frame.id)}
                      className={[
                        "w-full rounded-xl px-4 py-2.5 text-sm font-bold transition",
                        selected
                          ? "bg-violet-600 text-white hover:bg-violet-700"
                          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
                      ].join(" ")}
                    >
                      {selected ? "Selected" : "Select frame"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </Card>
  );
}
