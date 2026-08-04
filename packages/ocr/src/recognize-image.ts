import { createWorker } from "tesseract.js";

import type {
  OcrResult,
  RecognizeImageOptions,
} from "./types";

export async function recognizeImage(
  image: string | Blob,
  options: RecognizeImageOptions = {},
): Promise<OcrResult> {
  const {
    language = "eng",
    onProgress,
  } = options;

  const worker = await createWorker(language, undefined, {
    logger: (message) => {
      onProgress?.({
        status: message.status,
        progress:
          typeof message.progress === "number"
            ? message.progress
            : 0,
      });
    },
  });

  try {
    const result = await worker.recognize(image);

    return {
      text: result.data.text.trim(),
      confidence: result.data.confidence,
    };
  } finally {
    await worker.terminate();
  }
}
