import type {
  OcrEngine,
  OcrLine,
} from "../types";

const OCR_API_URL = "http://127.0.0.1:8001";

const dataUrlToBlob = async (
  dataUrl: string,
  signal?: AbortSignal,
): Promise<Blob> => {
  const response = await fetch(dataUrl, { signal });

  if (!response.ok) {
    throw new Error("Unable to decode the evidence image.");
  }

  return response.blob();
};

const toBlob = async (
  image: string | Blob,
  signal?: AbortSignal,
): Promise<Blob> =>
  typeof image === "string"
    ? dataUrlToBlob(image, signal)
    : image;

interface HttpOcrResponse {
  engine: string;
  text: string;
  confidence: number;
  duration_ms: number;
  lines: OcrLine[];
}

export const httpOcrEngine: OcrEngine = {
  id: "http",

  async recognize(request) {
    request.onProgress?.({
      status: "uploading image to local OCR service",
      progress: 0.1,
    });

    const imageBlob = await toBlob(
      request.image,
      request.signal,
    );
    const formData = new FormData();

    formData.append(
      "file",
      imageBlob,
      `evidence.${imageBlob.type.split("/")[1] ?? "png"}`,
    );
    formData.append(
      "profile",
      request.profileId ?? "default",
    );

    const response = await fetch(`${OCR_API_URL}/ocr`, {
      method: "POST",
      body: formData,
      signal: request.signal,
    });

    if (!response.ok) {
      let detail = `OCR service failed with HTTP ${response.status}.`;

      try {
        const payload = (await response.json()) as {
          detail?: string;
        };

        if (payload.detail) {
          detail = payload.detail;
        }
      } catch {
        // Keep the HTTP fallback message.
      }

      throw new Error(detail);
    }

    request.onProgress?.({
      status: "reading OCR result",
      progress: 0.9,
    });

    const result = (await response.json()) as HttpOcrResponse;

    request.onProgress?.({
      status: "OCR completed",
      progress: 1,
    });

    return {
      engineId: "http",
      text: result.text,
      confidence: result.confidence,
      durationMs: result.duration_ms,
      lines: result.lines,
    };
  },
};
