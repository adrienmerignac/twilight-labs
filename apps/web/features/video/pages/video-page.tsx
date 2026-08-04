"use client";

import type { Character } from "@twilight-labs/domain";
import {
  EvidenceProcessingStatus,
  EvidenceType,
} from "@twilight-labs/evidence";
import { Metric } from "@repo/ui/metric";
import { PageHeader } from "@repo/ui/page-header";
import { useEffect, useMemo, useState } from "react";

import { loadCharacters } from "../../../lib/character-storage";
import {
  saveEvidenceBatch,
  type StoredEvidence,
} from "../../evidence/storage/evidence-storage";
import { FrameGallery } from "../components/frame-gallery";
import { KeyFrameReview } from "../components/keyframe-review";
import {
  blobToDataUrl,
  formatTimestamp,
} from "../components/video-format";
import { VideoControlPanel } from "../components/video-control-panel";
import { useVideoPipeline } from "../hooks/use-video-pipeline";

const createEvidenceId = (index: number) =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `video-evidence-${Date.now()}-${index}`;

export default function VideoPage() {
  const pipeline = useVideoPipeline();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [characterId, setCharacterId] = useState("");
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const storedCharacters = loadCharacters();

    setCharacters(storedCharacters);
    setCharacterId(storedCharacters[0]?.id ?? "");
  }, []);

  const selectedCharacter = useMemo(
    () =>
      characters.find(
        (character) => character.id === characterId,
      ),
    [characterId, characters],
  );

  const sendToInbox = async () => {
    if (
      !selectedCharacter ||
      pipeline.selectedFrameIds.size === 0
    ) {
      return;
    }

    setImporting(true);
    setMessage(null);
    pipeline.setError(null);

    try {
      const selectedFrames = pipeline.keyFrames.filter(
        (frame) =>
          pipeline.selectedFrameIds.has(frame.id),
      );
      const importedAt = new Date().toISOString();

      const evidenceItems: StoredEvidence[] =
        await Promise.all(
          selectedFrames.map(async (frame, index) => ({
            id: createEvidenceId(index),
            characterId: selectedCharacter.id,
            type: EvidenceType.VideoFrame,
            createdAt: importedAt,
            title: `Video frame ${formatTimestamp(
              frame.timestamp,
            )}`,
            previewDataUrl: await blobToDataUrl(frame.blob),
            source: {
              filename: `frame-${Math.round(
                frame.timestamp * 1000,
              )}.jpg`,
              mimeType: frame.blob.type || "image/jpeg",
              size: frame.blob.size,
            },
            metadata: {
              characterName: selectedCharacter.name,
              characterUid:
                selectedCharacter.gameIdentity?.uid,
              importedFrom: "video-keyframes",
              videoFilename: pipeline.file?.name,
              videoTimestamp: frame.timestamp,
              visualDifference:
                frame.differenceFromPrevious,
            },
            processing: {
              status: EvidenceProcessingStatus.Pending,
              updatedAt: importedAt,
            },
          })),
        );

      await saveEvidenceBatch(evidenceItems);
      setMessage(
        `${evidenceItems.length} key frame${
          evidenceItems.length === 1 ? "" : "s"
        } sent to ${selectedCharacter.name}.`,
      );
    } catch (caughtError) {
      pipeline.setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to send key frames to the Inbox.",
      );
    } finally {
      setImporting(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <PageHeader
        eyebrow="Video pipeline"
        title="Recording lab"
        description="Extract a timeline, detect visual changes, review the useful frames, and send them to a character."
      />

      <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric
          label="Duration"
          value={
            pipeline.metadata
              ? `${pipeline.metadata.duration.toFixed(1)}s`
              : "—"
          }
        />
        <Metric
          label="Resolution"
          value={
            pipeline.metadata
              ? `${pipeline.metadata.width}×${pipeline.metadata.height}`
              : "—"
          }
        />
        <Metric
          label="Sampling"
          value={`${pipeline.framesPerSecond} FPS`}
        />
        <Metric
          label="Frames"
          value={String(pipeline.frames.length)}
        />
        <Metric
          label="Key frames"
          value={String(pipeline.keyFrames.length)}
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[400px_1fr]">
        <VideoControlPanel
          file={pipeline.file}
          videoPreviewUrl={pipeline.videoPreviewUrl}
          framesPerSecond={pipeline.framesPerSecond}
          differenceThreshold={
            pipeline.differenceThreshold
          }
          frameCount={pipeline.frames.length}
          extracting={pipeline.extracting}
          detecting={pipeline.detecting}
          detectionProgress={pipeline.detectionProgress}
          error={pipeline.error}
          onSelectVideo={(file) => {
            setMessage(null);
            void pipeline.selectVideo(file);
          }}
          onFramesPerSecondChange={
            pipeline.setFramesPerSecond
          }
          onThresholdChange={
            pipeline.setDifferenceThreshold
          }
          onExtract={() => {
            setMessage(null);
            void pipeline.extract();
          }}
          onDetect={() => {
            setMessage(null);
            void pipeline.detect();
          }}
        />

        <FrameGallery frames={pipeline.frames} />
      </section>

      <section className="mt-8">
        <KeyFrameReview
          frames={pipeline.keyFrames}
          originalFrameCount={pipeline.frames.length}
          selectedFrameIds={pipeline.selectedFrameIds}
          characters={characters}
          characterId={characterId}
          importing={importing}
          message={message}
          onCharacterChange={setCharacterId}
          onToggleFrame={pipeline.toggleFrame}
          onSelectAll={pipeline.selectAll}
          onClearSelection={pipeline.clearSelection}
          onSend={() => void sendToInbox()}
        />
      </section>
    </main>
  );
}
