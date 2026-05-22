// Image utilities: cropping + compression for uploads.

export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

/**
 * Crop an image (data URL) to the given area and re-encode to JPEG.
 * Downscales so the longest side is at most `maxSize` to keep file size down
 * while preserving sharpness. Quality 0.9 = high quality but compressed.
 */
export async function cropAndCompress(
  imageSrc: string,
  crop: Area,
  maxSize = 1600,
  quality = 0.9,
): Promise<Blob> {
  const img = await loadImage(imageSrc);
  const scale = Math.min(1, maxSize / Math.max(crop.width, crop.height));
  const outW = Math.round(crop.width * scale);
  const outH = Math.round(crop.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, outW, outH);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Encode failed"))),
      "image/jpeg",
      quality,
    );
  });
}
