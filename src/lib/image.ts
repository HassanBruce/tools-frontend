/** Canvas-based image processing shared by the bulk image tools. Browser only. */

export const IMAGE_FORMATS = [
  { value: "image/jpeg", label: "JPEG", extension: "jpg", lossy: true },
  { value: "image/png", label: "PNG", extension: "png", lossy: false },
  { value: "image/webp", label: "WebP", extension: "webp", lossy: true },
  { value: "image/avif", label: "AVIF", extension: "avif", lossy: true },
] as const;

export type ImageMime = (typeof IMAGE_FORMATS)[number]["value"];

/**
 * Check whether this browser can *encode* a format — canvas silently falls back
 * to PNG for unsupported types, which would otherwise produce mislabelled files.
 */
export async function canEncode(mime: ImageMime): Promise<boolean> {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, mime, 0.5),
    );
    return blob?.type === mime;
  } catch {
    return false;
  }
}

export interface LoadedImage {
  bitmap: ImageBitmap;
  width: number;
  height: number;
}

export async function loadImage(file: File): Promise<LoadedImage> {
  const bitmap = await createImageBitmap(file);
  return { bitmap, width: bitmap.width, height: bitmap.height };
}

/** Scale to fit inside the given box, never enlarging beyond the original. */
export function fitWithin(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  if (maxWidth <= 0 && maxHeight <= 0) return { width, height };

  const widthRatio = maxWidth > 0 ? maxWidth / width : Infinity;
  const heightRatio = maxHeight > 0 ? maxHeight / height : Infinity;
  const ratio = Math.min(widthRatio, heightRatio, 1);

  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

export interface RenderOptions {
  width: number;
  height: number;
  /** Flatten transparency onto this colour — required when encoding to JPEG. */
  background?: string;
}

export function renderToCanvas(
  source: CanvasImageSource,
  { width, height, background }: RenderOptions,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not get a 2D canvas context.");

  if (background) {
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(source, 0, 0, width, height);

  return canvas;
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Encoding failed."))),
      mime,
      quality,
    );
  });
}

export function replaceExtension(filename: string, extension: string): string {
  const base = filename.replace(/\.[^./\\]+$/, "");
  return `${base}.${extension}`;
}

/** Strip characters that are awkward inside a zip entry or on disk. */
export function safeFilename(input: string, fallback = "file"): string {
  const cleaned = input
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return cleaned || fallback;
}

/** Append -2, -3 … so a batch never contains two identical filenames. */
export function dedupeFilenames(names: string[]): string[] {
  const seen = new Map<string, number>();
  return names.map((name) => {
    const count = seen.get(name) ?? 0;
    seen.set(name, count + 1);
    if (count === 0) return name;

    const dot = name.lastIndexOf(".");
    return dot > 0
      ? `${name.slice(0, dot)}-${count + 1}${name.slice(dot)}`
      : `${name}-${count + 1}`;
  });
}
