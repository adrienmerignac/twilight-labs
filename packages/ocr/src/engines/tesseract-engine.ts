import { createWorker, PSM } from "tesseract.js";

import type {
  OcrEngine,
  OcrPageSegmentationMode,
} from "../types";

const psmByMode: Record<OcrPageSegmentationMode, PSM> = {
  auto: PSM.AUTO,
  "single-block": PSM.SINGLE_BLOCK,
  "sparse-text": PSM.SPARSE_TEXT,
};

export const tesseractEngine: OcrEngine = {
  id: "tesseract",

  async recognize(request) {
    const startedAt = performance.now();
    const worker = await createWorker(
      request.language ?? "eng",
      undefined,
      {
        logger: (message) => {
          request.onProgress?.({
            status: message.status,
            progress:
              typeof message.progress === "number"
                ? message.progress
                : 0,
          });
        },
      },
    );

    try {
      await worker.setParameters({
        tessedit_pageseg_mode:
          psmByMode[
            request.pageSegmentationMode ?? "auto"
          ],
        preserve_interword_spaces: "1",
      });

      const result = await worker.recognize(request.image);

      return {
        engineId: "tesseract",
        text: result.data.text.trim(),
        confidence: result.data.confidence,
        durationMs: performance.now() - startedAt,
      };
    } finally {
      await worker.terminate();
    }
  },
};
