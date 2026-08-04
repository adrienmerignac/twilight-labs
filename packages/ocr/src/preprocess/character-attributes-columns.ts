import type {
  OcrPreprocessResult,
  OcrRegion,
} from "../types";

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
          "Unable to load the Character Attributes image.",
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
          new Error("Unable to encode an OCR region."),
        );
      }
    }, "image/png");
  });

const enhanceRegion = async (
  image: HTMLImageElement,
  id: string,
  xRatio: number,
  yRatio: number,
  widthRatio: number,
  heightRatio: number,
): Promise<OcrRegion> => {
  const sourceX = Math.round(
    image.naturalWidth * xRatio,
  );
  const sourceY = Math.round(
    image.naturalHeight * yRatio,
  );
  const sourceWidth = Math.max(
    1,
    Math.round(image.naturalWidth * widthRatio),
  );
  const sourceHeight = Math.max(
    1,
    Math.round(image.naturalHeight * heightRatio),
  );

  const scale = 3;
  const canvas = document.createElement("canvas");
  canvas.width = Math.min(2200, sourceWidth * scale);
  canvas.height = Math.min(3200, sourceHeight * scale);

  const context = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!context) {
    throw new Error("Canvas 2D context is unavailable.");
  }

  context.imageSmoothingEnabled = false;
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
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

    // Aggressive contrast for small outlined UI text.
    const contrasted = Math.max(
      0,
      Math.min(255, (luminance - 128) * 2.1 + 128),
    );

    pixels[index] = contrasted;
    pixels[index + 1] = contrasted;
    pixels[index + 2] = contrasted;
    pixels[index + 3] = 255;
  }

  context.putImageData(imageData, 0, 0);

  const blob = await canvasToBlob(canvas);

  return {
    id,
    image: blob,
    previewBlob: blob,
  };
};

export async function preprocessCharacterAttributeColumns(
  source: string | Blob,
): Promise<OcrPreprocessResult> {
  const image = await loadImage(source);

  // Two stat panels, each cropped tightly enough to keep
  // label + value while excluding most surrounding game UI.
  const regions = await Promise.all([
    enhanceRegion(
      image,
      "left-column",
      0.18,
      0.16,
      0.38,
      0.76,
    ),
    enhanceRegion(
      image,
      "right-column",
      0.53,
      0.16,
      0.42,
      0.76,
    ),
  ]);

  return {
    regions,
    previewBlob: regions[0]?.previewBlob,
  };
}
