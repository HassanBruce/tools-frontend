"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import QRCode from "qrcode";
import {
  Button,
  ErrorNote,
  Field,
  InputPanel,
  Note,
  Panel,
  Segmented,
  Select,
  Slider,
  StatGrid,
  Toolbar,
  downloadBlob,
} from "@/components/ui";
import { dedupeFilenames, safeFilename } from "@/lib/image";

const SAMPLE = `https://example.com/product/1, blue-widget
https://example.com/product/2, red-widget
https://example.com/menu
https://example.com/contact, contact-page
Table 12 — scan to order`;

const LEVELS = [
  { value: "L", label: "L — 7%" },
  { value: "M", label: "M — 15%" },
  { value: "Q", label: "Q — 25%" },
  { value: "H", label: "H — 30%" },
] as const;

type Format = "png" | "svg";

interface Generated {
  content: string;
  filename: string;
  dataUrl?: string;
  svg?: string;
  error?: string;
}

/** Each line is `content` or `content, filename`. */
function parseLines(input: string): { content: string; name: string }[] {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const comma = line.lastIndexOf(",");
      if (comma > 0) {
        const content = line.slice(0, comma).trim();
        const name = line.slice(comma + 1).trim();
        // Only treat the tail as a filename if it looks like one.
        if (name && !name.includes(" ") && !/^https?:/i.test(name)) {
          return { content, name };
        }
      }
      return { content: line, name: "" };
    });
}

export default function Client() {
  const [input, setInput] = useState(SAMPLE);
  const [format, setFormat] = useState<Format>("png");
  const [size, setSize] = useState(512);
  const [level, setLevel] = useState<(typeof LEVELS)[number]["value"]>("M");
  const [results, setResults] = useState<Generated[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelled = useRef(false);
  useEffect(
    () => () => {
      cancelled.current = true;
    },
    [],
  );

  const entries = useMemo(() => parseLines(input), [input]);

  const generate = useCallback(async () => {
    setBusy(true);
    setError(null);

    try {
      const names = dedupeFilenames(
        entries.map((entry, index) => {
          const base = entry.name || safeFilename(entry.content, `qr-${index + 1}`);
          return `${base}.${format}`;
        }),
      );

      const options = { width: size, margin: 2, errorCorrectionLevel: level } as const;
      const generated: Generated[] = [];

      for (let index = 0; index < entries.length; index++) {
        const entry = entries[index];
        try {
          if (format === "svg") {
            generated.push({
              content: entry.content,
              filename: names[index],
              svg: await QRCode.toString(entry.content, { ...options, type: "svg" }),
            });
          } else {
            generated.push({
              content: entry.content,
              filename: names[index],
              dataUrl: await QRCode.toDataURL(entry.content, options),
            });
          }
        } catch (caught) {
          generated.push({
            content: entry.content,
            filename: names[index],
            error: caught instanceof Error ? caught.message : "Could not encode this value.",
          });
        }
      }

      if (!cancelled.current) setResults(generated);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Generation failed.");
    } finally {
      setBusy(false);
    }
  }, [entries, format, size, level]);

  const ok = results.filter((result) => !result.error);

  const downloadZip = async () => {
    const zip = new JSZip();
    for (const result of ok) {
      if (result.svg) zip.file(result.filename, result.svg);
      else if (result.dataUrl) {
        // Strip the data: prefix — JSZip wants raw base64.
        zip.file(result.filename, result.dataUrl.split(",")[1], { base64: true });
      }
    }
    downloadBlob(await zip.generateAsync({ type: "blob" }), "qr-codes.zip");
  };

  return (
    <>
      <Toolbar>
        <Segmented
          label="Format"
          value={format}
          onChange={setFormat}
          options={[
            { value: "png", label: "PNG" },
            { value: "svg", label: "SVG" },
          ]}
        />
        <div className="min-w-44 flex-1">
          <Slider
            label="Size"
            value={size}
            onChange={setSize}
            min={128}
            max={1024}
            step={64}
            display={`${size} px`}
          />
        </div>
        <Field label="Error correction" className="w-40">
          <Select value={level} onChange={setLevel} options={LEVELS} />
        </Field>
        <Button variant="primary" onClick={generate} disabled={busy || entries.length === 0} className="mb-0.5">
          {busy ? "Generating…" : `Generate ${entries.length}`}
        </Button>
      </Toolbar>

      <InputPanel
        label="One value per line — optionally followed by a comma and a filename"
        value={input}
        onChange={setInput}
        rows={10}
      />

      {results.length > 0 && (
        <>
          <div className="mt-4">
            <StatGrid
              stats={[
                { label: "Generated", value: ok.length },
                { label: "Failed", value: results.length - ok.length },
                { label: "Format", value: format.toUpperCase() },
                { label: "Size", value: `${size}px` },
              ]}
            />
          </div>

          <div className="mt-4">
            <Button onClick={downloadZip} disabled={ok.length === 0}>
              Download {ok.length} codes as .zip
            </Button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {results.map((result, index) => (
              <Panel key={`${result.filename}-${index}`} label={result.filename}>
                <div className="flex aspect-square items-center justify-center bg-white p-2">
                  {result.error ? (
                    <span className="p-2 text-center text-xs text-danger">{result.error}</span>
                  ) : result.svg ? (
                    <div
                      className="size-full [&>svg]:size-full"
                      // Generated locally by the qrcode library from the user's
                      // own input; no third-party markup is involved.
                      dangerouslySetInnerHTML={{ __html: result.svg }}
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={result.dataUrl} alt={result.content} className="size-full object-contain" />
                  )}
                </div>
                <p className="truncate px-2 py-1.5 text-[0.7rem] text-muted" title={result.content}>
                  {result.content}
                </p>
              </Panel>
            ))}
          </div>
        </>
      )}

      {error && <ErrorNote>{error}</ErrorNote>}

      <Note>
        Filenames come from the text after the comma where you supply one, otherwise from the
        content itself, and duplicates are numbered automatically. Everything is rendered locally,
        so there is no quota — a few hundred codes is comfortable.
      </Note>
    </>
  );
}
