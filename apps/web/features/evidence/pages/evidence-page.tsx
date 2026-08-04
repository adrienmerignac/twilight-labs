"use client";

import type { Character } from "@twilight-labs/domain";
import {
  EvidenceProcessingStatus,
  EvidenceType,
} from "@twilight-labs/evidence";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader } from "@repo/ui/card";
import { EmptyState } from "@repo/ui/empty-state";
import { Metric } from "@repo/ui/metric";
import { PageHeader } from "@repo/ui/page-header";
import Image from "next/image";
import type { ChangeEvent, DragEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { loadCharacters } from "../../../lib/character-storage";
import {
  deleteEvidence,
  loadEvidence,
  saveEvidence,
  type StoredEvidence,
} from "../storage/evidence-storage";

type PendingImage = {
  file: File;
  previewDataUrl: string;
};

const MAX_FILE_SIZE = 4 * 1024 * 1024;

const createEvidenceId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `evidence-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read this image."));
    reader.readAsDataURL(file);
  });

export default function EvidencePage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [evidence, setEvidence] = useState<StoredEvidence[]>([]);
  const [characterId, setCharacterId] = useState("");
  const [title, setTitle] = useState("");
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedCharacters = loadCharacters();

    setCharacters(storedCharacters);
    setCharacterId(storedCharacters[0]?.id ?? "");
    setEvidence(loadEvidence());
  }, []);

  const selectedCharacter = useMemo(
    () => characters.find((character) => character.id === characterId),
    [characterId, characters],
  );

  const handleFile = useCallback(async (file: File | undefined) => {
    setMessage(null);
    setError(null);

    if (!file) {
      return false;
    }

    if (!file.type.startsWith("image/")) {
      setError("Only image files are supported.");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("The image must be smaller than 4 MB.");
      return false;
    }

    try {
      setPendingImage({
        file,
        previewDataUrl: await readFileAsDataUrl(file),
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to read this image.",
      );

      return false;
    }

    return true;
  }, []);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const imageItem = Array.from(event.clipboardData?.items ?? []).find(
        (item) => item.type.startsWith("image/"),
      );

      const clipboardFile = imageItem?.getAsFile();

      if (!clipboardFile) {
        return;
      }

      event.preventDefault();

      const extension =
        clipboardFile.type.split("/")[1]?.replace("jpeg", "jpg") ?? "png";

      const pastedFile = new File(
        [clipboardFile],
        `clipboard-${new Date()
          .toISOString()
          .replace(/[:.]/g, "-")}.${extension}`,
        {
          type: clipboardFile.type,
          lastModified: Date.now(),
        },
      );

      void handleFile(pastedFile).then((accepted) => {
        if (accepted) {
          setMessage("Screenshot pasted from clipboard.");
        }
      });
    };

    window.addEventListener("paste", handlePaste);

    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [handleFile]);

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    void handleFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    void handleFile(event.dataTransfer.files[0]);
  };

  const handleSave = () => {
    if (!pendingImage || !selectedCharacter) {
      return;
    }

    const nextEvidence: StoredEvidence = {
      id: createEvidenceId(),
      characterId: selectedCharacter.id,
      type: EvidenceType.Screenshot,
      createdAt: new Date().toISOString(),
      title: title.trim() || undefined,
      previewDataUrl: pendingImage.previewDataUrl,
      source: {
        filename: pendingImage.file.name,
        mimeType: pendingImage.file.type,
        size: pendingImage.file.size,
      },
      metadata: {
        characterName: selectedCharacter.name,
        characterUid: selectedCharacter.gameIdentity?.uid,
      },
      processing: {
        status: EvidenceProcessingStatus.Pending,
        updatedAt: new Date().toISOString(),
      },
    };

    setEvidence(saveEvidence(nextEvidence));
    setPendingImage(null);
    setTitle("");
    setMessage("Screenshot evidence saved.");
    setError(null);
  };

  const handleDelete = (evidenceId: string) => {
    setEvidence(deleteEvidence(evidenceId));
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <PageHeader
        eyebrow="Evidence pipeline"
        title="Evidence"
        description="Attach screenshots to saved characters and preserve their original source before extraction or OCR."
      />

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        <Metric label="Saved evidence" value={String(evidence.length)} />
        <Metric
          label="Linked characters"
          value={String(new Set(evidence.map((item) => item.characterId)).size)}
        />
        <Metric
          label="Storage mode"
          value="Local"
          detail="Browser storage, 4 MB per image"
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
              New evidence
            </p>
            <h2 className="mt-2 text-xl font-black">Add a screenshot</h2>
          </CardHeader>

          <CardContent className="space-y-5">
            {characters.length === 0 ? (
              <EmptyState
                title="No characters available"
                description="Import and save a character before attaching evidence."
              />
            ) : (
              <>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold">Character</span>
                  <select
                    value={characterId}
                    onChange={(event) => setCharacterId(event.target.value)}
                    className="rounded-xl border border-zinc-300 bg-white px-4 py-3"
                  >
                    {characters.map((character) => (
                      <option key={character.id} value={character.id}>
                        {character.name} — {character.gameClass}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold">Title</span>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Stats screen, equipment page…"
                    className="rounded-xl border border-zinc-300 px-4 py-3"
                  />
                </label>

                <label
                  onDragEnter={() => setDragging(true)}
                  onDragLeave={() => setDragging(false)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleDrop}
                  className={[
                    "flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-6 text-center transition",
                    dragging
                      ? "border-violet-500 bg-violet-50"
                      : "border-zinc-300 bg-zinc-50 hover:border-violet-400",
                  ].join(" ")}
                >
                  <span className="text-3xl">＋</span>
                  <span className="mt-3 font-bold">
                    Drop or paste a screenshot
                  </span>
                  <span className="mt-2 text-sm text-zinc-500">
                    Ctrl+V / ⌘V · click to browse · max 4 MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleInput}
                    className="sr-only"
                  />
                </label>

                {pendingImage && (
                  <div className="overflow-hidden rounded-2xl border border-zinc-200">
                    <div className="relative h-80 w-full">
                      <Image
                        src={pendingImage.previewDataUrl}
                        alt="Screenshot preview"
                        fill
                        unoptimized
                        className="object-contain"
                      />
                    </div>
                    <div className="border-t border-zinc-200 p-4">
                      <p className="truncate text-sm font-semibold">
                        {pendingImage.file.name}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {(pendingImage.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleSave}
                  disabled={!pendingImage || !selectedCharacter}
                  className="w-full"
                >
                  Save evidence
                </Button>
              </>
            )}

            {message && <Badge variant="success">{message}</Badge>}
            {error && <Badge variant="danger">{error}</Badge>}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
              Evidence library
            </p>
            <h2 className="mt-2 text-xl font-black">Saved screenshots</h2>
          </CardHeader>

          {evidence.length === 0 ? (
            <CardContent>
              <EmptyState
                title="No evidence saved"
                description="Add the first screenshot to start building a traceable evidence library."
              />
            </CardContent>
          ) : (
            <div className="grid gap-5 p-5 md:grid-cols-2">
              {evidence.map((item) => {
                const character = characters.find(
                  (candidate) => candidate.id === item.characterId,
                );

                return (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"
                  >
                    <div className="relative h-56 w-full bg-zinc-950">
                      <Image
                        src={item.previewDataUrl}
                        alt={item.title ?? item.source.filename}
                        fill
                        unoptimized
                        className="object-contain"
                      />
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold">
                            {item.title ?? item.source.filename}
                          </p>
                          <p className="mt-1 text-sm text-zinc-500">
                            {character?.name ?? "Unknown character"}
                          </p>
                        </div>

                        <Badge variant="research">Screenshot</Badge>
                      </div>

                      <p className="mt-4 text-xs text-zinc-400">
                        {new Date(item.createdAt).toLocaleString("en-US")}
                      </p>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="mt-4 text-sm font-bold text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </Card>
      </section>
    </main>
  );
}
