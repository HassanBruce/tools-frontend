"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  CopyButton,
  ErrorNote,
  Field,
  Note,
  Panel,
  TextInput,
  Toolbar,
} from "@/components/ui";

/** Ten digits is seconds, thirteen is milliseconds — the usual convention. */
function parseTimestamp(raw: string): { date: Date; unit: "seconds" | "milliseconds" } | null {
  const trimmed = raw.trim();
  if (!/^-?\d+$/.test(trimmed)) return null;

  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric)) return null;

  const unit = Math.abs(numeric) >= 1e12 ? "milliseconds" : "seconds";
  const date = new Date(unit === "seconds" ? numeric * 1000 : numeric);

  return Number.isNaN(date.getTime()) ? null : { date, unit };
}

function toLocalInputValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2.5 last:border-0">
      <span className="text-xs font-medium text-muted">{label}</span>
      <span className="flex items-center gap-2">
        <span className="code-pane wrap-anywhere">{value}</span>
        <CopyButton value={value} />
      </span>
    </div>
  );
}

export default function Client() {
  const [timestamp, setTimestamp] = useState("");
  const [dateValue, setDateValue] = useState("");
  const [now, setNow] = useState<number | null>(null);

  // Seed from the current time on mount — Date.now() differs between server and
  // client, so doing this during render would cause a hydration mismatch.
  useEffect(() => {
    const current = Date.now();
    /* eslint-disable react-hooks/set-state-in-effect -- the clock differs
       between server and client, so it can only be read after hydration. */
    setNow(current);
    setTimestamp(String(Math.floor(current / 1000)));
    setDateValue(toLocalInputValue(new Date(current)));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const parsed = useMemo(() => parseTimestamp(timestamp), [timestamp]);

  const fromDate = useMemo(() => {
    if (!dateValue) return null;
    const date = new Date(dateValue);
    return Number.isNaN(date.getTime()) ? null : date;
  }, [dateValue]);

  return (
    <>
      <Toolbar>
        <Field label="Current Unix time" className="w-56">
          <TextInput
            value={now ? String(Math.floor(now / 1000)) : ""}
            onChange={() => {}}
            mono
          />
        </Field>
        <Button
          onClick={() => {
            const current = Date.now();
            setTimestamp(String(Math.floor(current / 1000)));
            setDateValue(toLocalInputValue(new Date(current)));
          }}
          className="mb-0.5"
        >
          Use now
        </Button>
      </Toolbar>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Panel label="Timestamp → date">
            <div className="p-3">
              <TextInput
                value={timestamp}
                onChange={setTimestamp}
                placeholder="1767225600"
                mono
              />
            </div>
            {parsed && (
              <div className="border-t border-border">
                <Row label="Detected as" value={parsed.unit} />
                <Row label="UTC" value={parsed.date.toUTCString()} />
                <Row label="Local" value={parsed.date.toLocaleString()} />
                <Row label="ISO 8601" value={parsed.date.toISOString()} />
                <Row label="Seconds" value={String(Math.floor(parsed.date.getTime() / 1000))} />
                <Row label="Milliseconds" value={String(parsed.date.getTime())} />
              </div>
            )}
          </Panel>
          {timestamp.trim() && !parsed && (
            <ErrorNote>That is not a valid Unix timestamp — digits only.</ErrorNote>
          )}
        </div>

        <div>
          <Panel label="Date → timestamp">
            <div className="p-3">
              <input
                type="datetime-local"
                step="1"
                value={dateValue}
                onChange={(event) => setDateValue(event.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
              />
            </div>
            {fromDate && (
              <div className="border-t border-border">
                <Row label="Seconds" value={String(Math.floor(fromDate.getTime() / 1000))} />
                <Row label="Milliseconds" value={String(fromDate.getTime())} />
                <Row label="ISO 8601" value={fromDate.toISOString()} />
                <Row label="UTC" value={fromDate.toUTCString()} />
              </div>
            )}
          </Panel>
        </div>
      </div>

      <Note>
        Your timezone is{" "}
        <strong>{Intl.DateTimeFormat().resolvedOptions().timeZone}</strong>. The date picker reads
        as local time; the UTC row shows the same instant without the offset.
      </Note>
    </>
  );
}
