import { httpOcrEngine } from "./http-engine";
import { mockEngine } from "./mock-engine";
import { tesseractEngine } from "./tesseract-engine";
import type {
  OcrEngine,
  OcrEngineId,
} from "../types";

const engines: Record<OcrEngineId, OcrEngine> = {
  http: httpOcrEngine,
  tesseract: tesseractEngine,
  mock: mockEngine,
};

export function getOcrEngine(
  engineId: OcrEngineId,
): OcrEngine {
  return engines[engineId];
}
