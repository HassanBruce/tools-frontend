"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Checkbox,
  CopyButton,
  ErrorNote,
  FileDrop,
  InputPanel,
  Note,
  Panel,
  Segmented,
  TextInput,
  Toolbar,
  formatBytes,
} from "@/components/ui";

type Source = "text" | "file";

/** Web Crypto deliberately omits MD5 — it is broken and should not be offered. */
const ALGORITHMS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;
type Algorithm = (typeof ALGORITHMS)[number];

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export default function Client() {
  const [source, setSource] = useState<Source>("text");
  const [text, setText] = useState("The quick brown fox jumps over the lazy dog");
  const [file, setFile] = useState<File | null>(null);
  const [enabled, setEnabled] = useState<Algorithm[]>(["SHA-256"]);
  const [hashes, setHashes] = useState<Partial<Record<Algorithm, string>>>({});
  const [expected, setExpected] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compute = useCallback(async () => {
    setError(null);

    const data =
      source === "text"
        ? new TextEncoder().encode(text).buffer as ArrayBuffer
        : file
          ? await file.arrayBuffer()
          : null;

    if (!data) {
      setHashes({});
      return;
    }

    setBusy(true);
    try {
      const results: Partial<Record<Algorithm, string>> = {};
      for (const algorithm of enabled) {
        results[algorithm] = toHex(await crypto.subtle.digest(algorithm, data));
      }
      setHashes(results);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Hashing failed.");
    } finally {
      setBusy(false);
    }
  }, [source, text, file, enabled]);

  useEffect(() => {
    // crypto.subtle is async and browser-only, so hashing cannot happen during
    // render — the result necessarily arrives via state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void compute();
  }, [compute]);

  const toggle = (algorithm: Algorithm, on: boolean) =>
    setEnabled((current) =>
      on ? [...current, algorithm] : current.filter((item) => item !== algorithm),
    );

  const normalisedExpected = expected.trim().toLowerCase();
  const match = normalisedExpected
    ? Object.entries(hashes).find(([, value]) => value === normalisedExpected)
    : null;

  return (
    <>
      <Toolbar>
        <Segmented
          label="Source"
          value={source}
          onChange={setSource}
          options={[
            { value: "text", label: "Text" },
            { value: "file", label: "File" },
          ]}
        />
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 pb-1">
          {ALGORITHMS.map((algorithm) => (
            <Checkbox
              key={algorithm}
              checked={enabled.includes(algorithm)}
              onChange={(on) => toggle(algorithm, on)}
              label={algorithm}
            />
          ))}
        </div>
      </Toolbar>

      {source === "text" ? (
        <InputPanel label="Text to hash" value={text} onChange={setText} rows={6} />
      ) : (
        <>
          <FileDrop
            multiple={false}
            onFiles={(files) => setFile(files[0] ?? null)}
            hint="Drop a file here, or click to browse"
          />
          {file && (
            <Note>
              {file.name} — {formatBytes(file.size)}
            </Note>
          )}
        </>
      )}

      <div className="mt-4 grid gap-3">
        {enabled.length === 0 && <Note tone="warning">Select at least one algorithm.</Note>}
        {enabled.map((algorithm) => (
          <Panel
            key={algorithm}
            label={algorithm}
            actions={<CopyButton value={hashes[algorithm] ?? ""} />}
          >
            <p className="code-pane wrap-anywhere px-3 py-2.5 select-all">
              {busy ? "Hashing…" : (hashes[algorithm] ?? "—")}
            </p>
          </Panel>
        ))}
      </div>

      <div className="mt-4">
        <Panel label="Verify against a published checksum">
          <div className="p-3">
            <TextInput
              value={expected}
              onChange={setExpected}
              placeholder="Paste an expected hash to compare"
              mono
            />
          </div>
        </Panel>
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      {normalisedExpected &&
        (match ? (
          <Note tone="success">Match — the {match[0]} hash is identical to the value you pasted.</Note>
        ) : (
          <Note tone="warning">
            No match against any computed hash. Check you have the right algorithm selected.
          </Note>
        ))}
    </>
  );
}
