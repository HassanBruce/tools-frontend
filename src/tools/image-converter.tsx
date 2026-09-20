"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import JSZip from "jszip";
import {
  Button,
  ErrorNote,
  Field,
  FileDrop,
  Note,
  Panel,
  Select,
  Slider,
  StatGrid,
  Toolbar,
  downloadBlob,
  formatBytes,
} from "@/components/ui";
import {
  IMAGE_FORMATS,
  canEncode,
  canvasToBlob,
  dedupeFilenames,
  loadImage,
  renderToCanvas,
  replaceExtension,
  type ImageMime,
} from "@/lib/image";

interface Item {
  id: string;
  file: File;
  status: "pending" | "done" | "error";
  blob?: Blob;
  previewUrl?: string;
  error?: string;
}

let counter = 0;

export default function Client() {
  const [items, setItems] = useState<Item[]>([]);
  const [target, setTarget] = useState<ImageMime>("image/webp");
  const [quality, setQuality] = useState(82);
  const [supported, setSupported] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const urlsRef = useRef<string[]>([]);
  useEffect(
    () => () => {
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  // canvas.toBlob() silently falls back to PNG for formats it cannot encode,
  // which would produce mislabelled files — so probe support up front.
  useEffect(() => {
    let cancelled = false;
    Promise.all(IMAGE_FORMATS.map(async (entry) => [entry.value, await canEncode(entry.value)] as const))
      .then((results) => {
        if (cancelled) return;
        setSupported(Object.fromEntries(results));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const addFiles = useCallback((files: File[]) => {
    const images = files.filter((file) => file.type.startsWith("image/"));
    setItems((current) => [
      ...current,
      ...images.map((file) => ({ id: `item-${counter++}`, file, status: "pending" as const })),
    ]);
  }, []);

  const spec = IMAGE_FORMATS.find((entry) => entry.value === target)!;

  const process = useCallback(async () => {
    setBusy(true);
    setError(null);

    try {
      const results: Item[] = [];

      for (const item of items) {
        try {
          const { bitmap, width, height } = await loadImage(item.file);
          const canvas = renderToCanvas(bitmap, {
            width,
            height,
            // Only JPEG lacks an alpha channel.
            background: target === "image/jpeg" ? "#ffffff" : undefined,
          });

          const blob = await canvasToBlob(canvas, target, quality / 100);
          bitmap.close();

          const previewUrl = URL.createObjectURL(blob);
          urlsRef.current.push(previewUrl);

          results.push({ ...item, status: "done", blob, previewUrl });
        } catch (caught) {
          results.push({
            ...item,
            status: "error",
            error: caught instanceof Error ? caught.message : "Conversion failed.",
          });
        }
      }

      setItems(results);
    } finally {
      setBusy(false);
    }
  }, [items, target, quality]);

  const done = items.filter((item) => item.status === "done" && item.blob);

  const downloadAll = async () => {
    const zip = new JSZip();
    const names = dedupeFilenames(
      done.map((item) => replaceExtension(item.file.name, spec.extension)),
    );
    done.forEach((item, index) => zip.file(names[index], item.blob!));
    downloadBlob(await zip.generateAsync({ type: "blob" }), `converted-${spec.extension}.zip`);
  };

  const beforeBytes = done.reduce((total, item) => total + item.file.size, 0);
  const afterBytes = done.reduce((total, item) => total + (item.blob?.size ?? 0), 0);

  const formatOptions = IMAGE_FORMATS.map((entry) => ({
    value: entry.value,
    label:
      supported[entry.value] === false ? `${entry.label} — not supported here` : entry.label,
  }));

  return (
    <>
      <Toolbar>
        <Field label="Convert to" className="w-56">
          <Select value={target} onChange={setTarget} options={formatOptions} />
        </Field>
        {spec.lossy && (
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
        )}
      </Toolbar>

      {supported[target] === false && (
        <ErrorNote>
          This browser cannot encode {spec.label}. Pick another format — otherwise the output would
          silently be a PNG with the wrong extension.
        </ErrorNote>
      )}

      <FileDrop onFiles={addFiles} accept="image/*" hint="Drop images here, or click to browse" />

      {items.length > 0 && (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="primary"
              onClick={process}
              disabled={busy || supported[target] === false}
            >
              {busy ? "Converting…" : `Convert ${items.length} to ${spec.label}`}
            </Button>
            {done.length > 1 && (
              <Button onClick={downloadAll} disabled={busy}>
                Download all as .zip
              </Button>
            )}
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => {
                urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
                urlsRef.current = [];
                setItems([]);
              }}
            >
              Clear
            </Button>
          </div>

          {done.length > 0 && (
            <div className="mt-4">
              <StatGrid
                stats={[
                  { label: "Converted", value: done.length },
                  { label: "Before", value: formatBytes(beforeBytes) },
                  { label: "After", value: formatBytes(afterBytes) },
                  {
                    label: "Change",
                    value:
                      beforeBytes > 0
                        ? `${afterBytes <= beforeBytes ? "−" : "+"}${Math.abs(
                            Math.round((1 - afterBytes / beforeBytes) * 100),
                          )}%`
                        : "—",
                  },
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
                        downloadBlob(item.blob!, replaceExtension(item.file.name, spec.extension))
                      }
                    >
                      Save
                    </Button>
                  )
                }
              >
                <div className="flex aspect-video items-center justify-center overflow-hidden bg-surface-muted">
                  {item.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-muted">
                      {item.status === "error" ? "Failed" : "Not converted yet"}
                    </span>
                  )}
                </div>
                <div className="px-3 py-2 text-xs text-muted">
                  {item.blob ? (
                    <>
                      {formatBytes(item.file.size)} → {formatBytes(item.blob.size)}
                      <span className="ml-1">({spec.label})</span>
                    </>
                  ) : item.error ? (
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
        {target === "image/jpeg"
          ? "JPEG has no alpha channel — transparent areas are flattened onto white."
          : "Transparency is preserved in PNG, WebP and AVIF."}{" "}
        AVIF usually compresses 20–30% smaller than WebP, but encodes more slowly.
      </Note>
    </>
  );
}
