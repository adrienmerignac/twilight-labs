from __future__ import annotations

import json
import tempfile
from pathlib import Path
from threading import Lock
from typing import Any

import numpy as np
from paddleocr import PaddleOCR

from .models import OcrLine, Point


class PaddleEngine:
    def __init__(self) -> None:
        self._lock = Lock()
        self._ocr: PaddleOCR | None = None

    def _get_ocr(self) -> PaddleOCR:
        if self._ocr is None:
            self._ocr = PaddleOCR(
                use_doc_orientation_classify=False,
                use_doc_unwarping=False,
                use_textline_orientation=False,
                engine="paddle",
            )
        return self._ocr

    @staticmethod
    def _to_python(value: Any) -> Any:
        if isinstance(value, np.ndarray):
            return value.tolist()
        if isinstance(value, dict):
            return {
                str(key): PaddleEngine._to_python(item)
                for key, item in value.items()
            }
        if isinstance(value, (list, tuple)):
            return [PaddleEngine._to_python(item) for item in value]
        return value

    def _result_payload(self, result: Any) -> dict[str, Any]:
        if isinstance(result, dict):
            return self._to_python(result)

        for attribute in ("json", "res"):
            value = getattr(result, attribute, None)
            if isinstance(value, dict):
                return self._to_python(value)
            if isinstance(value, str):
                try:
                    parsed = json.loads(value)
                    if isinstance(parsed, dict):
                        return self._to_python(parsed)
                except json.JSONDecodeError:
                    pass

        with tempfile.TemporaryDirectory() as directory:
            result.save_to_json(save_path=directory)
            candidates = list(Path(directory).glob("*.json"))
            if not candidates:
                candidates = list(Path(directory).rglob("*.json"))
            if not candidates:
                raise RuntimeError(
                    "PaddleOCR produced no readable JSON result."
                )
            return json.loads(candidates[0].read_text(encoding="utf-8"))

    @staticmethod
    def _extract_result_dict(payload: dict[str, Any]) -> dict[str, Any]:
        nested = payload.get("res")
        return nested if isinstance(nested, dict) else payload

    @staticmethod
    def _polygon(points: Any) -> list[Point]:
        if not isinstance(points, list):
            return []

        polygon: list[Point] = []
        for point in points:
            if (
                isinstance(point, list)
                and len(point) >= 2
                and isinstance(point[0], (int, float))
                and isinstance(point[1], (int, float))
            ):
                polygon.append(
                    Point(x=float(point[0]), y=float(point[1]))
                )
        return polygon

    def recognize(self, image_path: Path) -> list[OcrLine]:
        with self._lock:
            results = self._get_ocr().predict(str(image_path))

        lines: list[OcrLine] = []

        for result in results:
            payload = self._extract_result_dict(
                self._result_payload(result)
            )
            texts = payload.get("rec_texts", [])
            scores = payload.get("rec_scores", [])
            polygons = payload.get(
                "rec_polys",
                payload.get("dt_polys", []),
            )

            if not isinstance(texts, list):
                continue

            for index, raw_text in enumerate(texts):
                text = str(raw_text).strip()
                if not text:
                    continue

                raw_score = (
                    scores[index]
                    if isinstance(scores, list)
                    and index < len(scores)
                    else 0
                )
                confidence = (
                    float(raw_score) * 100
                    if isinstance(raw_score, (int, float))
                    else 0
                )
                raw_polygon = (
                    polygons[index]
                    if isinstance(polygons, list)
                    and index < len(polygons)
                    else []
                )

                lines.append(
                    OcrLine(
                        text=text,
                        confidence=confidence,
                        polygon=self._polygon(raw_polygon),
                    )
                )

        return sorted(
            lines,
            key=lambda line: (
                line.polygon[0].y if line.polygon else 0,
                line.polygon[0].x if line.polygon else 0,
            ),
        )
