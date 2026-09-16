"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import JSZip from "jszip";
import {
  Button,
  Checkbox,
  ErrorNote,
  Field,
  FileDrop,
  Note,
  NumberInput,
  Panel,
  Select,
  Slider,
  StatGrid,
  Toolbar,
  downloadBlob,
  formatBytes,
} from "@/components/ui";
import {
  canvasToBlob,
  dedupeFilenames,
  fitWithin,
  loadImage,
  renderToCanvas,
  replaceExtension,
} from "@/lib/image";

type Status = "pending" | "working" | "done" | "error";

interface Item {
  id: string;
  file: File;
  status: Status;
  width?: number;
  height?: number;
  outWidth?: number;
  outHeight?: number;
  blob?: Blob;
  previewUrl?: string;
  error?: string;
}

const OUTPUT_FORMATS = [
  { value: "image/jpeg", label: "JPEG" },
  { value: "image/webp", label: "WebP" },
  { value: "keep", label: "Keep original format" },
] as const;

let counter = 0;

export default function Client() {
  const [items, setItems] = useState<Item[]>([]);
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [maxHeight, setMaxHeight] = useState(0);
  const [format, setFormat] = useState<(typeof OUTPUT_FORMATS)[number]["value"]>("image/jpeg");
  const [stripTransparency, setStripTransparency] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Object URLs must be revoked or the browser leaks the decoded bitmaps.
  const urlsRef = useRef<string[]>([]);
  useEffect(
    () => () => {
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  const addFiles = useCallback((files: File[]) => {
    const images = files.filter((file) => file.type.startsWith("image/"));
    setItems((current) => [
      ...current,
      ...images.map((file) => ({ id: `item-${counter++}`, file, status: "pending" as Status })),
    ]);
  }, []);

  const process = useCallback(async () => {
    setBusy(true);
    setError(null);

    try {
      const results: Item[] = [];

      for (const item of items) {
        try {
          const { bitmap, width, height } = await loadImage(item.file);
          const target = fitWithin(width, height, maxWidth, maxHeight);

          const mime = format === "keep" ? item.file.type : format;
          // JPEG has no alpha channel; without a background, transparency turns black.
          const needsBackground = mime === "image/jpeg" || stripTransparency;

          const canvas = renderToCanvas(bitmap, {
            ...target,
            background: needsBackground ? "#ffffff" : undefined,
          });

          const blob = await canvasToBlob(canvas, mime, quality / 100);
          bitmap.close();

          const previewUrl = URL.createObjectURL(blob);
          urlsRef.current.push(previewUrl);

          results.push({
            ...item,
            status: "done",
            width,
            height,
            outWidth: target.width,
            outHeight: target.height,
            blob,
            previewUrl,
          });
        } catch (caught) {
          results.push({
            ...item,
            status: "error",
            error: caught instanceof Error ? caught.message : "Could not process this image.",
          });
        }
      }

      setItems(results);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Processing failed.");
    } finally {
      setBusy(false);
    }
  }, [items, quality, maxWidth, maxHeight, format, stripTransparency]);

  const done = items.filter((item) => item.status === "done" && item.blob);

  const extensionFor = (item: Item) =>
    item.blob?.type === "image/webp" ? "webp" : item.blob?.type === "image/png" ? "png" : "jpg";

  const downloadAll = async () => {
    const zip = new JSZip();
    const names = dedupeFilenames(
      done.map((item) => replaceExtension(item.file.name, extensionFor(item))),
    );
    done.forEach((item, index) => zip.file(names[index], item.blob!));
    downloadBlob(await zip.generateAsync({ type: "blob" }), "compressed-images.zip");
  };

  const originalBytes = items.reduce((total, item) => total + item.file.size, 0);
  const compressedBytes = done.reduce((total, item) => total + (item.blob?.size ?? 0), 0);
  const saving =
    done.length > 0 && originalBytes > 0
      ? Math.round((1 - compressedBytes / done.reduce((t, i) => t + i.file.size, 0)) * 100)
      : 0;

  return (
    <>
      <Toolbar>
        <div className="min-w-48 flex-1">
          <Slider
            label="Quality"
            value={quality}
            onChange={setQuality}
            min={10}
            max={100}
            display={`${quality}%`}
          />
        </div>
        <Field label="Max width" hint="0 = no limit" className="w-32">
          <NumberInput value={maxWidth} onChange={setMaxWidth} min={0} max={10000} step={10} />
        </Field>
        <Field label="Max height" hint="0 = no limit" className="w-32">
          <NumberInput value={maxHeight} onChange={setMaxHeight} min={0} max={10000} step={10} />
        </Field>
        <Field label="Output" className="w-48">
          <Select value={format} onChange={setFormat} options={OUTPUT_FORMATS} />
        </Field>
        <div className="pb-2">
          <Checkbox
            checked={stripTransparency}
            onChange={setStripTransparency}
            label="Flatten onto white"
          />
        </div>
      </Toolbar>

      <FileDrop onFiles={addFiles} accept="image/*" hint="Drop images here, or click to browse" />

      {items.length > 0 && (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="primary" onClick={process} disabled={busy}>
              {busy ? "Processing…" : `Compress ${items.length} image${items.length === 1 ? "" : "s"}`}
            </Button>
            {done.length > 1 && (
              <Button onClick={downloadAll} disabled={busy}>
                Download all as .zip
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => {
                urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
                urlsRef.current = [];
                setItems([]);
              }}
              disabled={busy}
            >
              Clear
            </Button>
          </div>

          {done.length > 0 && (
            <div className="mt-4">
              <StatGrid
                stats={[
                  { label: "Images", value: done.length },
                  { label: "Before", value: formatBytes(done.reduce((t, i) => t + i.file.size, 0)) },
                  { label: "After", value: formatBytes(compressedBytes) },
                  { label: "Saved", value: `${saving}%` },
                ]}
              />
            </div>
          )}

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Panel
                key={item.id}
                label={item.file.name}
                actions={
                  item.blob && (
                    <Button
                      size="sm"
                      onClick={() =>
                        downloadBlob(item.blob!, replaceExtension(item.file.name, extensionFor(item)))
                      }
                    >
                      Save
                    </Button>
                  )
                }
              >
                <div className="flex aspect-video items-center justify-center overflow-hidden bg-surface-muted">
                  {item.previewUrl ? (
                    // A local object URL for a blob this page just produced.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-muted">
                      {item.status === "error" ? "Failed" : "Not processed yet"}
                    </span>
                  )}
                </div>
                <div className="px-3 py-2 text-xs text-muted">
                  {item.status === "done" && item.blob ? (
                    <>
                      <div>
                        {formatBytes(item.file.size)} → {formatBytes(item.blob.size)} (
                        {Math.round((1 - item.blob.size / item.file.size) * 100)}% smaller)
                      </div>
                      <div>
                        {item.width} × {item.height} → {item.outWidth} × {item.outHeight}
                      </div>
                    </>
                  ) : item.status === "error" ? (
                    <span className="text-danger">{item.error}</span>
                  ) : (
                    formatBytes(item.file.size)
                  )}
                </div>
              </Panel>
            ))}
          </div>
        </>
      )}

      {error && <ErrorNote>{error}</ErrorNote>}

      <Note>
        Every image is decoded, resized and re-encoded by your own browser — nothing is uploaded.
        Compression is lossy and permanent, so keep your originals.
      </Note>
    </>
  );
}
