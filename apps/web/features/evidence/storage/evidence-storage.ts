import {
  EvidenceProcessingStatus,
  type Evidence,
  type EvidenceProcessingStatus as EvidenceStatus,
} from "@twilight-labs/evidence";

export interface EvidenceTranscription {
  rawText: string;
  updatedAt: string;
  recognizedCount: number;
  unrecognizedCount: number;
  recognitionRate: number;
}

export interface StoredEvidence extends Evidence {
  previewDataUrl: string;
  title?: string;
  transcription?: EvidenceTranscription;
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

const normalizeEvidence = (evidence: StoredEvidence): StoredEvidence => ({
  ...evidence,
  processing: evidence.processing ?? {
    status: EvidenceProcessingStatus.Pending,
    updatedAt: evidence.createdAt,
  },
});

function persistEvidence(evidence: StoredEvidence[]): StoredEvidence[] {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(evidence));
  }

  return evidence;
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
      ? parsed.filter(isStoredEvidence).map(normalizeEvidence)
      : [];
  } catch {
    return [];
  }
}

export function loadEvidenceForCharacter(
  characterId: string,
): StoredEvidence[] {
  return loadEvidence()
    .filter((evidence) => evidence.characterId === characterId)
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime(),
    );
}

export function getEvidence(
  evidenceId: string,
): StoredEvidence | undefined {
  return loadEvidence().find(
    (evidence) => evidence.id === evidenceId,
  );
}

export function saveEvidence(
  evidence: StoredEvidence,
): StoredEvidence[] {
  const current = loadEvidence();
  const normalized = normalizeEvidence(evidence);

  return persistEvidence([normalized, ...current]);
}

export function saveEvidenceBatch(
  evidenceItems: StoredEvidence[],
): StoredEvidence[] {
  const current = loadEvidence();
  const normalized = evidenceItems.map(normalizeEvidence);

  return persistEvidence([...normalized, ...current]);
}

export function updateEvidenceStatus(
  evidenceId: string,
  status: EvidenceStatus,
  error?: string,
): StoredEvidence[] {
  const next = loadEvidence().map((evidence) =>
    evidence.id === evidenceId
      ? {
          ...evidence,
          processing: {
            status,
            updatedAt: new Date().toISOString(),
            error: status === EvidenceProcessingStatus.Failed ? error : undefined,
          },
        }
      : evidence,
  );

  return persistEvidence(next);
}

export function updateEvidenceTranscription(
  evidenceId: string,
  transcription: EvidenceTranscription,
): StoredEvidence[] {
  const next = loadEvidence().map((evidence) =>
    evidence.id === evidenceId
      ? {
          ...evidence,
          transcription,
          processing: {
            status: EvidenceProcessingStatus.Processed,
            updatedAt: transcription.updatedAt,
          },
        }
      : evidence,
  );

  return persistEvidence(next);
}

export function deleteEvidence(
  evidenceId: string,
): StoredEvidence[] {
  return persistEvidence(
    loadEvidence().filter((evidence) => evidence.id !== evidenceId),
  );
}
