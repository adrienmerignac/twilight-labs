from pydantic import BaseModel, Field


class Point(BaseModel):
    x: float
    y: float


class OcrLine(BaseModel):
    text: str
    confidence: float
    polygon: list[Point] = Field(default_factory=list)


class OcrResponse(BaseModel):
    engine: str
    profile: str
    text: str
    confidence: float
    duration_ms: float
    lines: list[OcrLine]
