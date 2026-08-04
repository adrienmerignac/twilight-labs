import { describe, expect, it } from "vitest";

import { createFrameTimestamps } from "./timeline";

describe("createFrameTimestamps", () => {
  it("creates one timestamp per second", () => {
    expect(
      createFrameTimestamps({
        duration: 3.2,
        framesPerSecond: 1,
      }),
    ).toEqual([0, 1, 2, 3]);
  });

  it("supports fractional intervals", () => {
    expect(
      createFrameTimestamps({
        duration: 2,
        framesPerSecond: 2,
      }),
    ).toEqual([0, 0.5, 1, 1.5]);
  });

  it("respects the maximum frame count", () => {
    expect(
      createFrameTimestamps({
        duration: 100,
        framesPerSecond: 10,
        maxFrames: 3,
      }),
    ).toEqual([0, 0.1, 0.2]);
  });
});
