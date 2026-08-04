import type {
  OcrEngine,
  OcrLine,
} from "../types";

const OCR_API_URL = "http://127.0.0.1:8001";

const dataUrlToBlob = async (
  dataUrl: string,
): Promise<Blob> => {
  const response = await fetch(dataUrl);

  if (!response.ok) {
    throw new Error("Unable to decode the evidence image.");
  }

  return response.blob();
};

const toBlob = async (
  image: string | Blob,
): Promise<Blob> =>
  typeof image === "string"
    ? dataUrlToBlob(image)
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

    const imageBlob = await toBlob(request.image);
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
