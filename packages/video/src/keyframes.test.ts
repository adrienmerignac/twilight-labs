import { describe, expect, it } from "vitest";

import { selectKeyFrames } from "./keyframes";

describe("selectKeyFrames", () => {
  it("returns an empty list for an empty timeline", async () => {
    await expect(selectKeyFrames([])).resolves.toEqual([]);
  });

  it("validates the threshold", async () => {
    await expect(
      selectKeyFrames([], {
        differenceThreshold: 101,
      }),
    ).rejects.toThrow(
      "Difference threshold must be between zero and one hundred.",
    );
  });
});
