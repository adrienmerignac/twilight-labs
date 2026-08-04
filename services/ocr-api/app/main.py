from __future__ import annotations

import os
import tempfile
import time
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .models import OcrResponse
from .paddle_engine import PaddleEngine

app = FastAPI(
    title="Twilight Labs OCR API",
    version="0.1.0",
)

allowed_origins = os.getenv(
    "TWILIGHT_OCR_ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in allowed_origins
        if origin.strip()
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

engine = PaddleEngine()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "engine": "paddleocr"}


@app.post("/ocr", response_model=OcrResponse)
async def recognize(
    file: UploadFile = File(...),
    profile: str = Form("default"),
) -> OcrResponse:
    if not file.content_type or not file.content_type.startswith(
        "image/"
    ):
        raise HTTPException(
            status_code=415,
            detail="The OCR input must be an image.",
        )

    suffix = Path(file.filename or "evidence.png").suffix or ".png"
    started_at = time.perf_counter()

    try:
        content = await file.read()
        if not content:
            raise HTTPException(
                status_code=400,
                detail="The uploaded image is empty.",
            )

        with tempfile.NamedTemporaryFile(
            suffix=suffix,
            delete=False,
        ) as temporary:
            temporary.write(content)
            temporary_path = Path(temporary.name)

        try:
            lines = engine.recognize(temporary_path)
        finally:
            temporary_path.unlink(missing_ok=True)

        confidence = (
            sum(line.confidence for line in lines) / len(lines)
            if lines
            else 0
        )

        return OcrResponse(
            engine="paddleocr-python",
            profile=profile,
            text="\n".join(line.text for line in lines),
            confidence=confidence,
            duration_ms=(time.perf_counter() - started_at)
            * 1000,
            lines=lines,
        )
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"OCR failed: {error}",
        ) from error
    finally:
        await file.close()
