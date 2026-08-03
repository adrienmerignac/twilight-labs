"use client";

import { useState } from "react";

export default function ImportPage() {
  const [text, setText] = useState("");

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 p-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-wider text-neutral-500">
          Twilight Labs
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Import Character
        </h1>

        <p className="mt-2 text-neutral-600">
          Colle les statistiques affichées dans Ragnarok: Twilight Global.
        </p>
      </div>

      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={`HP 167M
ATK 13.36M
DEF 6.94M
CRIT 6.34M
CRIT RATE 49.47%`}
        className="min-h-80 resize-y rounded-xl border border-neutral-300 bg-white p-4 font-mono text-sm text-black outline-none focus:border-neutral-600"
      />

      <button
        type="button"
        className="w-fit rounded-lg bg-black px-6 py-3 font-medium text-white"
      >
        Parse
      </button>

      <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <h2 className="mb-3 font-semibold">
          Preview
        </h2>

        <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-sm text-black">
          {text || "Aucune donnée saisie."}
        </pre>
      </section>
    </main>
  );
}
