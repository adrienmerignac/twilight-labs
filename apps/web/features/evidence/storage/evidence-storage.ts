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

const DATABASE_NAME = "twilight-labs";
const DATABASE_VERSION = 1;
const STORE_NAME = "evidence";
const LEGACY_STORAGE_KEY = "twilight-labs.evidence";

function isStoredEvidence(value: unknown): value is StoredEvidence {
  if (!value || typeof value !== "object") return false;

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

const normalizeEvidence = (
  evidence: StoredEvidence,
): StoredEvidence => ({
  ...evidence,
  processing: evidence.processing ?? {
    status: EvidenceProcessingStatus.Pending,
    updatedAt: evidence.createdAt,
  },
});

const requestToPromise = <Result>(
  request: IDBRequest<Result>,
): Promise<Result> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB request failed."));
  });

const transactionToPromise = (
  transaction: IDBTransaction,
): Promise<void> =>
  new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction failed."));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction aborted."));
  });

let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("IndexedDB is only available in the browser."),
    );
  }

  if (databasePromise) return databasePromise;

  databasePromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(
      DATABASE_NAME,
      DATABASE_VERSION,
    );

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });

        store.createIndex("characterId", "characterId", {
          unique: false,
        });
        store.createIndex("createdAt", "createdAt", {
          unique: false,
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Unable to open IndexedDB."));
    request.onblocked = () =>
      reject(
        new Error(
          "IndexedDB upgrade is blocked by another open Twilight Labs tab.",
        ),
      );
  });

  return databasePromise;
}

async function putEvidence(
  evidenceItems: StoredEvidence[],
): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  for (const evidence of evidenceItems) {
    store.put(normalizeEvidence(evidence));
  }

  await transactionToPromise(transaction);
}

async function migrateLegacyLocalStorage(): Promise<void> {
  if (typeof window === "undefined") return;

  const rawValue = window.localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!rawValue) return;

  try {
    const parsed: unknown = JSON.parse(rawValue);

    if (Array.isArray(parsed)) {
      const legacyEvidence = parsed
        .filter(isStoredEvidence)
        .map(normalizeEvidence);

      if (legacyEvidence.length > 0) {
        await putEvidence(legacyEvidence);
      }
    }

    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Preserve malformed legacy data for manual inspection.
  }
}

let migrationPromise: Promise<void> | null = null;

async function ensureMigrated(): Promise<void> {
  migrationPromise ??= migrateLegacyLocalStorage();
  await migrationPromise;
}

export async function loadEvidence(): Promise<StoredEvidence[]> {
  await ensureMigrated();

  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, "readonly");
  const store = transaction.objectStore(STORE_NAME);
  const result = await requestToPromise(store.getAll());

  await transactionToPromise(transaction);

  return result
    .filter(isStoredEvidence)
    .map(normalizeEvidence)
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime(),
    );
}

export async function loadEvidenceForCharacter(
  characterId: string,
): Promise<StoredEvidence[]> {
  return (await loadEvidence()).filter(
    (item) => item.characterId === characterId,
  );
}

export async function getEvidence(
  evidenceId: string,
): Promise<StoredEvidence | undefined> {
  await ensureMigrated();

  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, "readonly");
  const result = await requestToPromise(
    transaction.objectStore(STORE_NAME).get(evidenceId),
  );

  await transactionToPromise(transaction);

  return isStoredEvidence(result)
    ? normalizeEvidence(result)
    : undefined;
}

export async function saveEvidence(
  evidence: StoredEvidence,
): Promise<StoredEvidence[]> {
  await ensureMigrated();
  await putEvidence([evidence]);
  return loadEvidence();
}

export async function saveEvidenceBatch(
  evidenceItems: StoredEvidence[],
): Promise<StoredEvidence[]> {
  await ensureMigrated();
  await putEvidence(evidenceItems);
  return loadEvidence();
}

export async function updateEvidenceStatus(
  evidenceId: string,
  status: EvidenceStatus,
  error?: string,
): Promise<StoredEvidence[]> {
  const evidence = await getEvidence(evidenceId);
  if (!evidence) return loadEvidence();

  await putEvidence([
    {
      ...evidence,
      processing: {
        status,
        updatedAt: new Date().toISOString(),
        error:
          status === EvidenceProcessingStatus.Failed
            ? error
            : undefined,
      },
    },
  ]);

  return loadEvidence();
}

export async function updateEvidenceTranscription(
  evidenceId: string,
  transcription: EvidenceTranscription,
): Promise<StoredEvidence[]> {
  const evidence = await getEvidence(evidenceId);
  if (!evidence) return loadEvidence();

  await putEvidence([
    {
      ...evidence,
      transcription,
      processing: {
        status: EvidenceProcessingStatus.Processed,
        updatedAt: transcription.updatedAt,
      },
    },
  ]);

  return loadEvidence();
}

export async function deleteEvidence(
  evidenceId: string,
): Promise<StoredEvidence[]> {
  await ensureMigrated();

  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, "readwrite");
  transaction.objectStore(STORE_NAME).delete(evidenceId);
  await transactionToPromise(transaction);

  return loadEvidence();
}
