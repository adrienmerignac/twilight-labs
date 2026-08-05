import {
  OcrRequestCanceledError,
  OcrRequestInProgressError,
  OcrRequestManager,
  OcrRequestTimeoutError,
} from "./request-manager";
import { afterEach, describe, expect, it, vi } from "vitest";

const waitForAbort = (
  signal: AbortSignal,
): Promise<never> =>
  new Promise((_, reject) => {
    signal.addEventListener(
      "abort",
      () => reject(signal.reason),
      { once: true },
    );
  });

describe("OcrRequestManager", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("cancels the active request and clears its running state", async () => {
    const manager = new OcrRequestManager();
    const request = manager.run(waitForAbort);

    manager.cancel();

    await expect(request).rejects.toBeInstanceOf(
      OcrRequestCanceledError,
    );
    expect(manager.isRunning).toBe(false);
  });

  it("times out the active request and clears its running state", async () => {
    vi.useFakeTimers();
    const manager = new OcrRequestManager();
    const request = manager.run(waitForAbort, 60_000);
    const rejection = expect(request).rejects.toBeInstanceOf(
      OcrRequestTimeoutError,
    );

    await vi.advanceTimersByTimeAsync(60_000);

    await rejection;
    expect(manager.isRunning).toBe(false);
  });

  it("clears its running state when the OCR request fails", async () => {
    const manager = new OcrRequestManager();

    await expect(
      manager.run(async () => {
        throw new TypeError("Failed to fetch");
      }),
    ).rejects.toThrow("Failed to fetch");

    expect(manager.isRunning).toBe(false);
  });

  it("prevents duplicate requests while one is running", async () => {
    const manager = new OcrRequestManager();
    let resolveRequest: (() => void) | undefined;
    const execute = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveRequest = resolve;
        }),
    );
    const firstRequest = manager.run(execute);

    await expect(manager.run(execute)).rejects.toBeInstanceOf(
      OcrRequestInProgressError,
    );
    expect(execute).toHaveBeenCalledTimes(1);

    resolveRequest?.();
    await expect(firstRequest).resolves.toBeUndefined();
    expect(manager.isRunning).toBe(false);
  });

  it("clears its running state after a successful request", async () => {
    const manager = new OcrRequestManager();

    await expect(
      manager.run(async () => "recognized text"),
    ).resolves.toBe("recognized text");

    expect(manager.isRunning).toBe(false);
  });
});
