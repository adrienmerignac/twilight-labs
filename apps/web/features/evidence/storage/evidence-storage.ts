import type { Evidence } from "@twilight-labs/evidence";

export interface StoredEvidence extends Evidence {
  previewDataUrl: string;
  title?: string;
}

const STORAGE_KEY = "twilight-labs.evidence";

function isStoredEvidence(value: unknown): value is StoredEvidence {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<StoredEvidence>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.characterId === "string" &&
    typeof candidate.type === "string" &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.previewDataUrl === "string" &&
    typeof candidate.source === "object" &&
    candidate.source !== null
  );
}

export function loadEvidence(): StoredEvidence[] {
  if (typeof window === "undefined") {
    return [];
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(rawValue);

    return Array.isArray(parsed)
      ? parsed.filter(isStoredEvidence)
      : [];
  } catch {
    return [];
  }
}

export function saveEvidence(
  evidence: StoredEvidence,
): StoredEvidence[] {
  const current = loadEvidence();
  const next = [evidence, ...current];

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

  return next;
}

export function deleteEvidence(
  evidenceId: string,
): StoredEvidence[] {
  const next = loadEvidence().filter(
    (evidence) => evidence.id !== evidenceId,
  );

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

  return next;
}
