import type { OcrPreprocessResult } from "../types";

export async function passthroughPreprocess(
  image: string | Blob,
): Promise<OcrPreprocessResult> {
  return { image };
}
