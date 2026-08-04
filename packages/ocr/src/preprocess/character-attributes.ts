import type { OcrPreprocessResult } from "../types";

const loadImage = (
  source: string | Blob,
): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl =
      typeof source === "string"
        ? null
        : URL.createObjectURL(source);

    image.onload = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }

      resolve(image);
    };

    image.onerror = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }

      reject(
        new Error(
          "Unable to load the image for OCR preprocessing.",
        ),
      );
    };

    image.src =
      typeof source === "string"
        ? source
        : objectUrl ?? "";
  });

const canvasToBlob = (
  canvas: HTMLCanvasElement,
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(
          new Error(
            "Unable to encode the preprocessed OCR image.",
          ),
        );
      }
    }, "image/png");
  });

export async function preprocessCharacterAttributes(
  source: string | Blob,
): Promise<OcrPreprocessResult> {
  const image = await loadImage(source);

  // Keep the central/right statistics panel while removing
  // most surrounding game chrome.
  const left = Math.round(image.naturalWidth * 0.14);
  const top = Math.round(image.naturalHeight * 0.04);
  const width = Math.round(image.naturalWidth * 0.82);
  const height = Math.round(image.naturalHeight * 0.90);

  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = Math.min(3200, width * scale);
  canvas.height = Math.min(3200, height * scale);

  const context = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!context) {
    throw new Error("Canvas 2D context is unavailable.");
  }

  context.imageSmoothingEnabled = false;
  context.drawImage(
    image,
    left,
    top,
    width,
    height,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  const imageData = context.getImageData(
    0,
    0,
    canvas.width,
    canvas.height,
  );
  const pixels = imageData.data;

  for (let index = 0; index < pixels.length; index += 4) {
    const red = pixels[index] ?? 0;
    const green = pixels[index + 1] ?? 0;
    const blue = pixels[index + 2] ?? 0;

    const luminance =
      red * 0.299 + green * 0.587 + blue * 0.114;
    const contrasted = Math.max(
      0,
      Math.min(255, (luminance - 128) * 1.5 + 128),
    );

    pixels[index] = contrasted;
    pixels[index + 1] = contrasted;
    pixels[index + 2] = contrasted;
  }

  context.putImageData(imageData, 0, 0);

  const previewBlob = await canvasToBlob(canvas);

  return {
    image: previewBlob,
    previewBlob,
  };
}
