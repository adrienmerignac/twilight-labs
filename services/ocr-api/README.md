# Twilight Labs OCR API

Local FastAPI service wrapping PaddleOCR.

## Setup

```bash
services/ocr-api/setup.sh
```

## Start

```bash
services/ocr-api/start.sh
```

## Health check

```bash
curl http://127.0.0.1:8001/health
```

The first OCR request downloads the PaddleOCR models.
