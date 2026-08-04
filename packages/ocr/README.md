# @twilight-labs/ocr

Engine-agnostic OCR platform.

Current engines:
- Tesseract
- Mock

Current profiles:
- Default
- Character Attributes

A future PaddleOCR adapter can implement the same `OcrEngine` interface
without changing the Workbench or processing pipeline.
