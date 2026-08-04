export type OcrEngineId = "tesseract" | "mock";

export type OcrPageSegmentationMode =
  | "auto"
  | "single-block"
  | "sparse-text";

export interface OcrProgress {
  status: string;
  progress: number;
}

export interface OcrResult {
  engineId: OcrEngineId;
  text: string;
  confidence: number;
  durationMs: number;
}

export interface OcrEngineRequest {
  image: string | Blob;
  language?: string;
  pageSegmentationMode?: OcrPageSegmentationMode;
  onProgress?: (progress: OcrProgress) => void;
}

export interface OcrEngine {
  id: OcrEngineId;
  recognize(request: OcrEngineRequest): Promise<OcrResult>;
}

export interface OcrPreprocessResult {
  image: string | Blob;
  previewBlob?: Blob;
}

export interface OcrProfile {
  id: string;
  label: string;
  engineId: OcrEngineId;
  language: string;
  pageSegmentationMode: OcrPageSegmentationMode;
  preprocess(
    image: string | Blob,
  ): Promise<OcrPreprocessResult>;
}

export interface RunOcrProfileRequest {
  image: string | Blob;
  profileId: string;
  onProgress?: (progress: OcrProgress) => void;
}

export interface RunOcrProfileResult extends OcrResult {
  profileId: string;
  previewBlob?: Blob;
}
