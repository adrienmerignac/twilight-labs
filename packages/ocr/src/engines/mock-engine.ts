import type { OcrEngine } from "../types";

export const mockEngine: OcrEngine = {
  id: "mock",

  async recognize(request) {
    request.onProgress?.({
      status: "mock recognition",
      progress: 1,
    });

    return {
      engineId: "mock",
      text: "",
      confidence: 0,
      durationMs: 0,
    };
  },
};
