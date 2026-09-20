import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Read an image's intrinsic dimensions straight from its file header.
 *
 * Used at build time to stamp width/height onto images in markdown. Without
 * those attributes the browser cannot reserve space before the bytes arrive,
 * so the text below jumps down as each image loads — layout shift, which is a
 * Core Web Vitals metric and a direct ranking factor.
 *
 * Deliberately dependency-free: every format below announces its size in the
 * first few bytes, so a full image library would be overkill.
 *
 * Server-only.
 */

export interface ImageSize {
  width: number;
  height: number;
}

function fromPng(buf: Buffer): ImageSize | null {
  // 8-byte signature, then the IHDR chunk: length(4) type(4) width(4) height(4)
  if (buf.length < 24) return null;
  if (buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function fromGif(buf: Buffer): ImageSize | null {
  if (buf.length < 10 || buf.toString("ascii", 0, 3) !== "GIF") return null;
  // Logical screen descriptor, little-endian.
  return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
}

function fromJpeg(buf: Buffer): ImageSize | null {
  if (buf.length < 4 || buf.readUInt16BE(0) !== 0xffd8) return null;

  let offset = 2;
  while (offset < buf.length - 9) {
    if (buf[offset] !== 0xff) {
      offset++;
      continue;
    }
    const marker = buf[offset + 1];

    // SOF0-3, SOF5-7, SOF9-11, SOF13-15 carry the frame dimensions. The gaps
    // (C4, C8, CC) are DHT/JPG/DAC and must be skipped.
    const isStartOfFrame =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;

    if (isStartOfFrame) {
      return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
    }

    // Otherwise skip this segment using its declared length.
    const length = buf.readUInt16BE(offset + 2);
    if (length <= 0) return null;
    offset += 2 + length;
  }

  return null;
}

function fromWebp(buf: Buffer): ImageSize | null {
  if (buf.length < 30) return null;
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WEBP") return null;

  const format = buf.toString("ascii", 12, 16);

  if (format === "VP8 ") {
    // Lossy: 14-bit dimensions after the 3-byte start code.
    return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  }

  if (format === "VP8L") {
    // Lossless: 14-bit width and height packed across four bytes.
    const bits = buf.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }

  if (format === "VP8X") {
    // Extended: 24-bit little-endian values, stored minus one.
    const width = buf.readUIntLE(24, 3) + 1;
    const height = buf.readUIntLE(27, 3) + 1;
    return { width, height };
  }

  return null;
}

function fromSvg(buf: Buffer): ImageSize | null {
  const head = buf.toString("utf8", 0, 4096);

  // Scope everything to the opening <svg> tag. Searching the whole document
  // would happily match a child element — `<rect width="100%">` is extremely
  // common and would report every such SVG as 100 wide.
  const openTag = /<svg\b[^>]*>/i.exec(head)?.[0];
  if (!openTag) return null;

  // Anchor the closing quote so only a bare number (optionally with px) counts.
  // Relative units such as "100%" or "20em" say nothing about pixel size.
  const lengthOf = (name: string): number | null => {
    const match = new RegExp(`\\b${name}\\s*=\\s*["']\\s*([\\d.]+)(?:px)?\\s*["']`, "i").exec(
      openTag,
    );
    const value = match ? Number(match[1]) : NaN;
    return Number.isFinite(value) && value > 0 ? value : null;
  };

  const width = lengthOf("width");
  const height = lengthOf("height");
  if (width && height) return { width: Math.round(width), height: Math.round(height) };

  // Fall back to the viewBox, which is what most exported SVGs actually carry.
  // Values may be separated by commas, whitespace, or both.
  const viewBox =
    /viewBox\s*=\s*["']\s*[\d.eE+-]+[,\s]+[\d.eE+-]+[,\s]+([\d.eE+]+)[,\s]+([\d.eE+]+)/i.exec(
      openTag,
    );
  if (viewBox) {
    const w = Number(viewBox[1]);
    const h = Number(viewBox[2]);
    if (w > 0 && h > 0) return { width: Math.round(w), height: Math.round(h) };
  }

  return null;
}

/** Intrinsic size of a file, or null if the format is unreadable. */
export function imageSizeFromBuffer(buf: Buffer): ImageSize | null {
  const size =
    fromPng(buf) ?? fromGif(buf) ?? fromJpeg(buf) ?? fromWebp(buf) ?? fromSvg(buf);

  // Guard against a malformed header producing nonsense.
  if (!size || !Number.isFinite(size.width) || !Number.isFinite(size.height)) return null;
  if (size.width <= 0 || size.height <= 0) return null;

  return size;
}

/**
 * Resolve a root-relative site path (`/blog/hero.png`) to its file in public/
 * and read its dimensions. Results are cached — the same image often appears in
 * several posts, and a build should not re-read it each time.
 */
const cache = new Map<string, ImageSize | null>();

export function imageSizeForPublicPath(src: string): ImageSize | null {
  if (cache.has(src)) return cache.get(src) ?? null;

  let size: ImageSize | null = null;

  // Only local, root-relative paths can be measured; remote URLs cannot.
  if (src.startsWith("/") && !src.startsWith("//")) {
    const clean = src.split("?")[0].split("#")[0];
    const file = join(process.cwd(), "public", decodeURIComponent(clean));

    if (existsSync(file)) {
      try {
        size = imageSizeFromBuffer(readFileSync(file));
      } catch {
        size = null;
      }
    }
  }

  cache.set(src, size);
  return size;
}
