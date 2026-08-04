import { Badge } from "@repo/ui/badge";
import { Card, CardContent, CardHeader } from "@repo/ui/card";
import { EmptyState } from "@repo/ui/empty-state";
import Image from "next/image";

import type { DisplayFrame } from "../hooks/use-video-pipeline";
import { formatTimestamp } from "./video-format";

export function FrameGallery({
  frames,
}: {
  frames: DisplayFrame[];
}) {
  return (
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
  );
}
