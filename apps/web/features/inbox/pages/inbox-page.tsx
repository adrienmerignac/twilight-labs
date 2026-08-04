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
import Link from "next/link";
import type { ChangeEvent, DragEvent } from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { loadCharacters } from "../../../lib/character-storage";
import {
  loadEvidence,
  saveEvidenceBatch,
  type StoredEvidence,
} from "../../evidence/storage/evidence-storage";

type InboxItem = {
  id: string;
  file: File;
  previewDataUrl: string;
  createdAt: string;
};

const MAX_FILE_SIZE = 4 * 1024 * 1024;

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `inbox-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(new Error(`Unable to read ${file.name}.`));
    reader.readAsDataURL(file);
  });

const normalizeClipboardFile = (file: File) => {
  const extension =
    file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "png";

  return new File(
    [file],
    `clipboard-${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.${extension}`,
    {
      type: file.type,
      lastModified: Date.now(),
    },
  );
};

export default function InboxPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [characterId, setCharacterId] = useState("");
  const [queue, setQueue] = useState<InboxItem[]>([]);
  const [savedEvidenceCount, setSavedEvidenceCount] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedCharacters = loadCharacters();

    setCharacters(storedCharacters);
    setCharacterId(storedCharacters[0]?.id ?? "");
    void loadEvidence().then((items) => {
      setSavedEvidenceCount(items.length);
    });
  }, []);

  const selectedCharacter = useMemo(
    () =>
      characters.find(
        (character) => character.id === characterId,
      ),
    [characterId, characters],
  );

  const appendFiles = useCallback(async (files: File[]) => {
    setMessage(null);
    setError(null);

    const imageFiles = files.filter((file) =>
      file.type.startsWith("image/"),
    );
    const oversizedFiles = imageFiles.filter(
      (file) => file.size > MAX_FILE_SIZE,
    );
    const acceptedFiles = imageFiles.filter(
      (file) => file.size <= MAX_FILE_SIZE,
    );

    if (imageFiles.length !== files.length) {
      setError("Some files were ignored because they are not images.");
    }

    if (oversizedFiles.length > 0) {
      setError(
        `${oversizedFiles.length} image(s) were ignored because they exceed 4 MB.`,
      );
    }

    if (acceptedFiles.length === 0) {
      return;
    }

    try {
      const nextItems = await Promise.all(
        acceptedFiles.map(async (file) => ({
          id: createId(),
          file,
          previewDataUrl: await readFileAsDataUrl(file),
          createdAt: new Date().toISOString(),
        })),
      );

      setQueue((current) => [...current, ...nextItems]);
      setMessage(
        `${nextItems.length} screenshot${nextItems.length === 1 ? "" : "s"} added to the queue.`,
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to read the selected images.",
      );
    }
  }, []);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const clipboardFiles = Array.from(
        event.clipboardData?.items ?? [],
      )
        .filter((item) => item.type.startsWith("image/"))
        .map((item) => item.getAsFile())
        .filter((file): file is File => Boolean(file))
        .map(normalizeClipboardFile);

      if (clipboardFiles.length === 0) {
        return;
      }

      event.preventDefault();
      void appendFiles(clipboardFiles);
    };

    window.addEventListener("paste", handlePaste);

    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [appendFiles]);

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    void appendFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    void appendFiles(Array.from(event.dataTransfer.files));
  };

  const removeItem = (itemId: string) => {
    setQueue((current) =>
      current.filter((item) => item.id !== itemId),
    );
  };

  const importAll = async () => {
    if (!selectedCharacter || queue.length === 0) {
      return;
    }

    const importedAt = new Date().toISOString();

    const evidenceItems: StoredEvidence[] = queue.map(
      (item, index) => ({
        id: createId(),
        characterId: selectedCharacter.id,
        type: EvidenceType.Screenshot,
        createdAt: item.createdAt,
        title: `Screenshot ${index + 1}`,
        previewDataUrl: item.previewDataUrl,
        source: {
          filename: item.file.name,
          mimeType: item.file.type,
          size: item.file.size,
        },
        metadata: {
          characterName: selectedCharacter.name,
          characterUid: selectedCharacter.gameIdentity?.uid,
          importedFrom: "inbox",
          batchImportedAt: importedAt,
        },
        processing: {
          status: EvidenceProcessingStatus.Pending,
          updatedAt: importedAt,
        },
      }),
    );

    const nextEvidence = await saveEvidenceBatch(evidenceItems);

    setSavedEvidenceCount(nextEvidence.length);
    setQueue([]);
    setError(null);
    setMessage(
      `${evidenceItems.length} screenshot${evidenceItems.length === 1 ? "" : "s"} imported for ${selectedCharacter.name}.`,
    );
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <PageHeader
        eyebrow="Capture workflow"
        title="Inbox"
        description="Paste or drop a complete screenshot series, assign it once, and import everything as pending evidence."
        actions={
          <Link
            href="/evidence"
            className="rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-zinc-100"
          >
            Open workbench
          </Link>
        }
      />

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        <Metric label="Waiting" value={String(queue.length)} />
        <Metric
          label="Saved evidence"
          value={String(savedEvidenceCount)}
        />
        <Metric
          label="Capture mode"
          value="Batch"
          detail="Paste and drop multiple images"
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                Capture
              </p>
              <h2 className="mt-2 text-xl font-black">
                Add screenshots
              </h2>
            </CardHeader>

            <CardContent>
              <label
                onDragEnter={() => setDragging(true)}
                onDragLeave={() => setDragging(false)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                className={[
                  "flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-6 text-center transition",
                  dragging
                    ? "border-violet-500 bg-violet-50"
                    : "border-zinc-300 bg-zinc-50 hover:border-violet-400",
                ].join(" ")}
              >
                <span className="text-4xl">＋</span>
                <span className="mt-4 text-lg font-black">
                  Paste, drop, or browse
                </span>
                <span className="mt-2 text-sm leading-6 text-zinc-500">
                  Ctrl+V / ⌘V as many times as needed
                  <br />
                  Multiple files supported · 4 MB each
                </span>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleInput}
                  className="sr-only"
                />
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                Batch destination
              </p>
              <h2 className="mt-2 text-xl font-black">
                Assign once
              </h2>
            </CardHeader>

            <CardContent className="space-y-5">
              {characters.length === 0 ? (
                <EmptyState
                  title="No characters available"
                  description="Import and save a character before using the Inbox."
                />
              ) : (
                <>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold">
                      Character
                    </span>
                    <select
                      value={characterId}
                      onChange={(event) =>
                        setCharacterId(event.target.value)
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

                  <Button
                    className="w-full"
                    disabled={queue.length === 0}
                    onClick={importAll}
                  >
                    Import {queue.length} screenshot
                    {queue.length === 1 ? "" : "s"}
                  </Button>
                </>
              )}

              {queue.length > 0 && (
                <button
                  type="button"
                  onClick={() => setQueue([])}
                  className="w-full text-sm font-bold text-red-600 hover:text-red-800"
                >
                  Clear queue
                </button>
              )}

              {message && (
                <Badge variant="success">{message}</Badge>
              )}
              {error && <Badge variant="danger">{error}</Badge>}
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                Capture queue
              </p>
              <h2 className="mt-2 text-xl font-black">
                Waiting screenshots
              </h2>
            </div>

            {queue.length > 0 && (
              <Badge variant="warning">
                {queue.length} waiting
              </Badge>
            )}
          </CardHeader>

          {queue.length === 0 ? (
            <CardContent>
              <EmptyState
                title="The Inbox is empty"
                description="Copy a Lightshot capture, return here, and press Ctrl+V. Repeat without saving between screenshots."
              />
            </CardContent>
          ) : (
            <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
              {queue.map((item, index) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"
                >
                  <div className="relative h-52 bg-zinc-950">
                    <Image
                      src={item.previewDataUrl}
                      alt={`Queued screenshot ${index + 1}`}
                      fill
                      unoptimized
                      className="object-contain"
                    />
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-bold">
                          Screenshot {index + 1}
                        </p>
                        <p className="mt-1 truncate text-xs text-zinc-500">
                          {item.file.name}
                        </p>
                      </div>

                      <Badge variant="warning">Queued</Badge>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-4">
                      <span className="text-xs text-zinc-400">
                        {(item.file.size / 1024).toFixed(1)} KB
                      </span>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-sm font-bold text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
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
