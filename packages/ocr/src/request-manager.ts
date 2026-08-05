export const OCR_REQUEST_TIMEOUT_MS = 60_000;

export class OcrRequestCanceledError extends Error {
  constructor() {
    super("OCR was canceled.");
    this.name = "OcrRequestCanceledError";
  }
}

export class OcrRequestInProgressError extends Error {
  constructor() {
    super("An OCR request is already running.");
    this.name = "OcrRequestInProgressError";
  }
}

export class OcrRequestTimeoutError extends Error {
  constructor() {
    super("OCR timed out after 60 seconds.");
    this.name = "OcrRequestTimeoutError";
  }
}

type OcrAbortReason = "canceled" | "timed-out";

const getAbortError = (
  reason: OcrAbortReason | undefined,
): Error =>
  reason === "timed-out"
    ? new OcrRequestTimeoutError()
    : new OcrRequestCanceledError();

export class OcrRequestManager {
  private activeController: AbortController | null = null;

  private timeoutId: ReturnType<typeof setTimeout> | null =
    null;

  get isRunning(): boolean {
    return this.activeController !== null;
  }

  cancel(): void {
    this.activeController?.abort("canceled");
  }

  async run<Result>(
    execute: (signal: AbortSignal) => Promise<Result>,
    timeoutMs = OCR_REQUEST_TIMEOUT_MS,
  ): Promise<Result> {
    if (this.activeController) {
      throw new OcrRequestInProgressError();
    }

    const controller = new AbortController();
    this.activeController = controller;
    this.timeoutId = setTimeout(() => {
      controller.abort("timed-out");
    }, timeoutMs);

    const abortResult = new Promise<never>((_, reject) => {
      controller.signal.addEventListener(
        "abort",
        () => {
          const reason = controller.signal.reason;
          reject(
            getAbortError(
              reason === "timed-out" || reason === "canceled"
                ? reason
                : undefined,
            ),
          );
        },
        { once: true },
      );
    });

    try {
      return await Promise.race([
        execute(controller.signal),
        abortResult,
      ]);
    } finally {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }

      if (this.activeController === controller) {
        this.activeController = null;
      }
    }
  }
}
