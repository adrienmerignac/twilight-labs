const toGrayscale = (imageData: ImageData): Uint8Array => {
  const grayscale = new Uint8Array(
    imageData.width * imageData.height,
  );

  for (let pixelIndex = 0; pixelIndex < grayscale.length; pixelIndex += 1) {
    const sourceIndex = pixelIndex * 4;
    const red = imageData.data[sourceIndex] ?? 0;
    const green = imageData.data[sourceIndex + 1] ?? 0;
    const blue = imageData.data[sourceIndex + 2] ?? 0;

    grayscale[pixelIndex] = Math.round(
      red * 0.299 + green * 0.587 + blue * 0.114,
    );
  }

  return grayscale;
};

const sampleBlob = async (
  blob: Blob,
  width = 32,
  height = 32,
): Promise<Uint8Array> => {
  if (typeof createImageBitmap !== "function") {
    throw new Error("ImageBitmap is not supported by this browser.");
  }

  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!context) {
    bitmap.close();
    throw new Error("Canvas 2D context is not available.");
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return toGrayscale(
    context.getImageData(0, 0, width, height),
  );
};

export async function calculateFrameDifference(
  first: Blob,
  second: Blob,
): Promise<number> {
  const [firstPixels, secondPixels] = await Promise.all([
    sampleBlob(first),
    sampleBlob(second),
  ]);

  let totalDifference = 0;

  for (let index = 0; index < firstPixels.length; index += 1) {
    totalDifference += Math.abs(
      (firstPixels[index] ?? 0) -
        (secondPixels[index] ?? 0),
    );
  }

  return (
    totalDifference /
    (firstPixels.length * 255)
  ) * 100;
}
