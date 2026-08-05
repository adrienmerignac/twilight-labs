import { getOcrProfile } from "./registry";
import { describe, expect, it } from "vitest";

describe("OCR profile registry", () => {
  it("uses the local HTTP OCR service for the default fallback", () => {
    expect(getOcrProfile("unknown")).toMatchObject({
      id: "default",
      engineId: "http",
    });
  });

  it("preserves the dedicated Character Attributes and Cards profiles", () => {
    expect(getOcrProfile("character-attributes")).toMatchObject({
      id: "character-attributes",
      engineId: "http",
    });
    expect(getOcrProfile("cards")).toMatchObject({
      id: "cards",
      engineId: "http",
    });
  });
});
