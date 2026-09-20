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
  OutputPanel,
  Panel,
  TextInput,
  Toolbar,
  downloadBlob,
  formatBytes,
} from "@/components/ui";
import { canvasToBlob, loadImage, renderToCanvas } from "@/lib/image";

/** The set a modern site actually needs — PNG throughout, no .ico required. */
const SIZES = [
  { size: 16, name: "favicon-16x16.png", note: "Browser tab" },
  { size: 32, name: "favicon-32x32.png", note: "Tab, retina" },
  { size: 48, name: "favicon-48x48.png", note: "Windows shortcut" },
  { size: 96, name: "favicon-96x96.png", note: "Google TV" },
  { size: 180, name: "apple-touch-icon.png", note: "iOS home screen" },
  { size: 192, name: "android-chrome-192x192.png", note: "Android" },
  { size: 512, name: "android-chrome-512x512.png", note: "PWA splash" },
];

const HTML_SNIPPET = `<link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
<link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
<link rel="manifest" href="/site.webmanifest" />`;

interface Generated {
  size: number;
  name: string;
  note: string;
  blob: Blob;
  url: string;
}

export default function Client() {
  const [file, setFile] = useState<File | null>(null);
  const [icons, setIcons] = useState<Generated[]>([]);
  const [background, setBackground] = useState("#ffffff");
  const [useBackground, setUseBackground] = useState(false);
  const [appName, setAppName] = useState("My Site");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<{ width: number; height: number } | null>(null);

  const urlsRef = useRef<string[]>([]);
  useEffect(
    () => () => {
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  const manifest = JSON.stringify(
    {
      name: appName,
      short_name: appName,
      icons: [
        { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      theme_color: background,
      background_color: background,
      display: "standalone",
    },
    null,
    2,
  );

  const generate = useCallback(
    async (input: File) => {
      setBusy(true);
      setError(null);

      try {
        const { bitmap, width, height } = await loadImage(input);
        setSource({ width, height });

        urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
        urlsRef.current = [];

        const results: Generated[] = [];
        for (const entry of SIZES) {
          const canvas = renderToCanvas(bitmap, {
            width: entry.size,
            height: entry.size,
            background: useBackground ? background : undefined,
          });
          const blob = await canvasToBlob(canvas, "image/png", 1);
          const url = URL.createObjectURL(blob);
          urlsRef.current.push(url);
          results.push({ ...entry, blob, url });
        }

        bitmap.close();
        setIcons(results);
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : "Could not read that image.",
        );
        setIcons([]);
      } finally {
        setBusy(false);
      }
    },
    [background, useBackground],
  );

  const onFiles = (files: File[]) => {
    const image = files.find((entry) => entry.type.startsWith("image/"));
    if (!image) {
      setError("That file is not an image.");
      return;
    }
    setFile(image);
    void generate(image);
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    for (const icon of icons) zip.file(icon.name, icon.blob);
    zip.file("site.webmanifest", manifest);
    zip.file("favicon-html-snippet.html", HTML_SNIPPET);
    downloadBlob(await zip.generateAsync({ type: "blob" }), "favicons.zip");
  };

  const tooSmall = source !== null && Math.min(source.width, source.height) < 512;
  const notSquare = source !== null && source.width !== source.height;

  return (
    <>
      <Toolbar>
        <Field label="App name" hint="Used in site.webmanifest" className="w-56">
          <TextInput value={appName} onChange={setAppName} />
        </Field>
        <Field label="Background" className="w-28">
          <input
            type="color"
            value={background}
            onChange={(event) => setBackground(event.target.value)}
            className="h-9.5 w-full cursor-pointer rounded-lg border border-border bg-surface p-1"
          />
        </Field>
        <div className="pb-2">
          <Checkbox
            checked={useBackground}
            onChange={setUseBackground}
            label="Fill transparency"
          />
        </div>
        {file && (
          <Button onClick={() => void generate(file)} disabled={busy} className="mb-0.5">
            {busy ? "Generating…" : "Regenerate"}
          </Button>
        )}
      </Toolbar>

      <FileDrop
        onFiles={onFiles}
        accept="image/*"
        multiple={false}
        hint="Drop a square image here — 512 × 512 or larger"
      />

      {error && <ErrorNote>{error}</ErrorNote>}

      {(tooSmall || notSquare) && (
        <Note tone="warning">
          {notSquare && `Your image is ${source?.width} × ${source?.height} and will be squashed to a square. `}
          {tooSmall && "For crisp icons, start from an image at least 512 × 512."}
        </Note>
      )}

      {icons.length > 0 && (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="primary" onClick={downloadZip}>
              Download all as .zip
            </Button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {icons.map((icon) => (
              <Panel
                key={icon.name}
                label={`${icon.size}×${icon.size}`}
                actions={
                  <Button size="sm" onClick={() => downloadBlob(icon.blob, icon.name)}>
                    Save
                  </Button>
                }
              >
                <div className="flex items-center justify-center bg-surface-muted p-4">
                  {/* Locally generated blob — next/image cannot optimise an object URL. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={icon.url}
                    alt={`${icon.size} pixel icon`}
                    width={Math.min(icon.size, 96)}
                    height={Math.min(icon.size, 96)}
                    style={{ imageRendering: icon.size <= 48 ? "pixelated" : "auto" }}
                  />
                </div>
                <div className="px-3 py-2">
                  <p className="truncate font-mono text-[0.7rem]">{icon.name}</p>
                  <p className="text-xs text-muted">
                    {icon.note} · {formatBytes(icon.blob.size)}
                  </p>
                </div>
              </Panel>
            ))}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <OutputPanel
              label="Paste into your <head>"
              value={HTML_SNIPPET}
              filename="favicon-html-snippet.html"
              mime="text/html"
              rows={6}
            />
            <OutputPanel
              label="site.webmanifest"
              value={manifest}
              filename="site.webmanifest"
              mime="application/manifest+json"
              rows={6}
            />
          </div>
        </>
      )}

      <Note>
        Put every file in your site root, next to index.html, then paste the link tags above into
        your head. Design for the 16-pixel size — fine detail and small text vanish completely there.
      </Note>
    </>
  );
}
