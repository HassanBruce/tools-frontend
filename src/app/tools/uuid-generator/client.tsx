"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  CopyButton,
  Field,
  Note,
  NumberInput,
  OutputPanel,
  Segmented,
  Select,
  Toolbar,
} from "@/components/ui";

type Version = "v4" | "v7";
type Format = "plain" | "json" | "sql" | "csv";

const HEX = Array.from({ length: 256 }, (_, index) => index.toString(16).padStart(2, "0"));

function formatUuid(bytes: Uint8Array): string {
  const hex = Array.from(bytes, (byte) => HEX[byte]);
  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
}

function uuidV4(): string {
  // randomUUID is v4 and available in every secure context; fall back manually.
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return formatUuid(bytes);
}

/**
 * UUID v7: 48-bit big-endian Unix milliseconds, then random. Sorting by the
 * identifier sorts by creation time, which is what makes it index-friendly.
 */
function uuidV7(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const now = Date.now();

  bytes[0] = Math.floor(now / 2 ** 40) & 0xff;
  bytes[1] = Math.floor(now / 2 ** 32) & 0xff;
  bytes[2] = Math.floor(now / 2 ** 24) & 0xff;
  bytes[3] = Math.floor(now / 2 ** 16) & 0xff;
  bytes[4] = Math.floor(now / 2 ** 8) & 0xff;
  bytes[5] = now & 0xff;

  bytes[6] = (bytes[6] & 0x0f) | 0x70; // version 7
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant

  return formatUuid(bytes);
}

export default function Client() {
  const [version, setVersion] = useState<Version>("v4");
  const [count, setCount] = useState(10);
  const [format, setFormat] = useState<Format>("plain");
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [ids, setIds] = useState<string[]>([]);

  const generate = useCallback(() => {
    const total = Math.min(Math.max(count, 1), 1000);
    const next = Array.from({ length: total }, () => (version === "v4" ? uuidV4() : uuidV7()));
    setIds(next);
  }, [count, version]);

  useEffect(() => {
    // These values come from crypto.getRandomValues(). Generating them during
    // the server render would emit markup the client cannot match on hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    generate();
  }, [generate]);

  const shaped = ids
    .map((id) => (hyphens ? id : id.replace(/-/g, "")))
    .map((id) => (uppercase ? id.toUpperCase() : id));

  const output =
    format === "json"
      ? JSON.stringify(shaped, null, 2)
      : format === "sql"
        ? shaped.map((id) => `('${id}')`).join(",\n")
        : format === "csv"
          ? `uuid\n${shaped.join("\n")}`
          : shaped.join("\n");

  return (
    <>
      <Toolbar>
        <Segmented
          label="Version"
          value={version}
          onChange={setVersion}
          options={[
            { value: "v4", label: "v4 — random" },
            { value: "v7", label: "v7 — time-ordered" },
          ]}
        />
        <Field label="How many" className="w-28">
          <NumberInput value={count} onChange={setCount} min={1} max={1000} />
        </Field>
        <Field label="Format" className="w-40">
          <Select
            value={format}
            onChange={setFormat}
            options={[
              { value: "plain", label: "One per line" },
              { value: "json", label: "JSON array" },
              { value: "sql", label: "SQL values" },
              { value: "csv", label: "CSV" },
            ]}
          />
        </Field>
        <div className="flex flex-col gap-1 pb-1.5">
          <Checkbox checked={hyphens} onChange={setHyphens} label="Hyphens" />
          <Checkbox checked={uppercase} onChange={setUppercase} label="Uppercase" />
        </div>
        <Button variant="primary" onClick={generate} className="mb-0.5">
          Generate
        </Button>
      </Toolbar>

      <OutputPanel
        label={`${ids.length} identifier${ids.length === 1 ? "" : "s"}`}
        value={output}
        filename="uuids.txt"
        rows={18}
        actions={<CopyButton value={output} label="Copy all" />}
      />

      <Note>
        {version === "v7"
          ? "v7 embeds a millisecond timestamp in the first six bytes, so identifiers sort by creation time — the right choice for database primary keys."
          : "v4 is 122 bits of randomness from crypto.getRandomValues(). Collisions are not a practical concern."}
      </Note>
    </>
  );
}
