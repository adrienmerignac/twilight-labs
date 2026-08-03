"use client";

import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader } from "@repo/ui/card";
import { Metric } from "@repo/ui/metric";
import { PageHeader } from "@repo/ui/page-header";
import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";

import {
  clearCharacters,
  exportCharacters,
  importCharacters,
  loadCharacters,
} from "../../lib/character-storage";

export default function DataPage() {
  const [characterCount, setCharacterCount] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshCount = () => {
    setCharacterCount(loadCharacters().length);
  };

  useEffect(() => {
    refreshCount();
  }, []);

  const handleExport = () => {
    const blob = new Blob([exportCharacters()], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `twilight-labs-characters-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    anchor.click();
    URL.revokeObjectURL(url);

    setMessage("Character data exported successfully.");
    setError(null);
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const characters = importCharacters(await file.text());

      setCharacterCount(characters.length);
      setMessage(`${characters.length} character profile(s) imported.`);
      setError(null);
    } catch (caughtError) {
      setMessage(null);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to import this file.",
      );
    } finally {
      event.target.value = "";
    }
  };

  const handleClear = () => {
    if (!window.confirm("Delete every locally saved character profile?")) {
      return;
    }

    clearCharacters();
    refreshCount();
    setMessage("Local character data cleared.");
    setError(null);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-5 py-10 lg:px-8 lg:py-14">
      <PageHeader
        eyebrow="Local storage"
        title="Data management"
        description="Back up, restore, or clear character profiles stored in this browser."
      />

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <Metric
          label="Saved characters"
          value={String(characterCount)}
          detail="Stored locally in this browser"
        />

        <Metric
          label="Storage mode"
          value="Local"
          detail="No server synchronization yet"
        />
      </section>

      {message && (
        <div className="mt-6">
          <Badge variant="success">{message}</Badge>
        </div>
      )}

      {error && (
        <div className="mt-6">
          <Badge variant="danger">{error}</Badge>
        </div>
      )}

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
              Backup
            </p>
            <h2 className="mt-2 text-xl font-black">Export character data</h2>
          </CardHeader>

          <CardContent>
            <p className="leading-7 text-zinc-500">
              Download every locally saved profile as a portable JSON file.
            </p>

            <Button
              className="mt-6"
              onClick={handleExport}
              disabled={characterCount === 0}
            >
              Export JSON
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
              Restore
            </p>
            <h2 className="mt-2 text-xl font-black">Import character data</h2>
          </CardHeader>

          <CardContent>
            <p className="leading-7 text-zinc-500">
              Restore a Twilight Labs JSON export.
            </p>

            <label className="mt-6 inline-flex cursor-pointer rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-zinc-100">
              Choose JSON file
              <input
                type="file"
                accept="application/json,.json"
                onChange={handleImport}
                className="sr-only"
              />
            </label>
          </CardContent>
        </Card>
      </section>

      <Card className="mt-6 border-red-200">
        <CardHeader>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">
            Danger zone
          </p>
          <h2 className="mt-2 text-xl font-black">Clear local data</h2>
        </CardHeader>

        <CardContent>
          <p className="leading-7 text-zinc-500">
            Permanently delete every locally stored character profile.
          </p>

          <Button variant="danger" className="mt-6" onClick={handleClear}>
            Delete all local profiles
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
