export interface OcrProgress {
  status: string;
  progress: number;
}

export interface OcrResult {
  text: string;
  confidence: number;
}

export interface RecognizeImageOptions {
  language?: string;
  onProgress?: (progress: OcrProgress) => void;
}
