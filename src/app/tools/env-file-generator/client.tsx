"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  Note,
  OutputPanel,
  Panel,
  TextInput,
  ToolGrid,
} from "@/components/ui";

interface Entry {
  id: number;
  key: string;
  value: string;
  comment: string;
  secret: boolean;
}

let nextId = 1;
const makeEntry = (partial: Partial<Entry> = {}): Entry => ({
  id: nextId++,
  key: "",
  value: "",
  comment: "",
  secret: false,
  ...partial,
});

const INITIAL: Entry[] = [
  makeEntry({ key: "APP_ENV", value: "local", comment: "local | staging | production" }),
  makeEntry({ key: "APP_URL", value: "http://localhost:3000" }),
  makeEntry({ key: "DATABASE_URL", value: "postgres://user:pass@localhost:5432/app", secret: true }),
  makeEntry({ key: "API_KEY", value: "sk_live_example_value", secret: true }),
  makeEntry({ key: "FEATURE_FLAGS", value: "beta ui, new checkout" }),
];

/** Quote only when the value would otherwise be misparsed. */
function formatValue(value: string): string {
  if (value === "") return "";
  const needsQuotes = /[\s#"'$`\\]/.test(value) || value !== value.trim();
  if (!needsQuotes) return value;
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/** Keys are conventionally SCREAMING_SNAKE_CASE and cannot start with a digit. */
function normaliseKey(key: string): string {
  return key
    .trim()
    .replace(/[^a-zA-Z0-9_]+/g, "_")
    .replace(/^(\d)/, "_$1")
    .toUpperCase();
}

export default function Client() {
  const [entries, setEntries] = useState<Entry[]>(INITIAL);

  const update = (id: number, patch: Partial<Entry>) =>
    setEntries((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
    );

  const remove = (id: number) =>
    setEntries((current) => current.filter((entry) => entry.id !== id));

  const { env, example, invalidKeys } = useMemo(() => {
    const lines: string[] = [];
    const exampleLines: string[] = [];
    const bad: string[] = [];

    for (const entry of entries) {
      if (!entry.key.trim()) continue;

      const key = normaliseKey(entry.key);
      if (key !== entry.key.trim()) bad.push(entry.key.trim());

      if (entry.comment.trim()) {
        lines.push(`# ${entry.comment.trim()}`);
        exampleLines.push(`# ${entry.comment.trim()}`);
      }

      lines.push(`${key}=${formatValue(entry.value)}`);
      // The committed example documents the key without leaking the value.
      exampleLines.push(`${key}=${entry.secret ? "" : formatValue(entry.value)}`);
    }

    return { env: lines.join("\n"), example: exampleLines.join("\n"), invalidKeys: bad };
  }, [entries]);

  return (
    <>
      <Panel
        label="Variables"
        actions={
          <Button size="sm" onClick={() => setEntries((current) => [...current, makeEntry()])}>
            Add variable
          </Button>
        }
      >
        <div className="divide-y divide-border">
          {entries.map((entry) => (
            <div key={entry.id} className="grid gap-2 p-3 sm:grid-cols-[1fr_1.5fr_auto]">
              <TextInput
                value={entry.key}
                onChange={(key) => update(entry.id, { key })}
                placeholder="KEY_NAME"
                mono
              />
              <TextInput
                value={entry.value}
                onChange={(value) => update(entry.id, { value })}
                placeholder="value"
                mono
              />
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={entry.secret}
                  onChange={(secret) => update(entry.id, { secret })}
                  label="Secret"
                />
                <Button size="sm" variant="danger" onClick={() => remove(entry.id)}>
                  Remove
                </Button>
              </div>
              <TextInput
                value={entry.comment}
                onChange={(comment) => update(entry.id, { comment })}
                placeholder="Optional comment above this line"
                className="sm:col-span-3"
              />
            </div>
          ))}
          {entries.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted">
              No variables yet — add one to get started.
            </p>
          )}
        </div>
      </Panel>

      <div className="mt-4">
        <ToolGrid>
          <OutputPanel label=".env" value={env} filename=".env" rows={14} />
          <OutputPanel
            label=".env.example — commit this one"
            value={example}
            filename=".env.example"
            rows={14}
          />
        </ToolGrid>
      </div>

      {invalidKeys.length > 0 && (
        <Note tone="warning">
          Normalised to valid key names: {invalidKeys.join(", ")}. Keys may only contain letters,
          digits and underscores, and cannot start with a digit.
        </Note>
      )}

      <Note>
        Values containing spaces, <code className="font-mono">#</code>, quotes or backslashes are
        quoted and escaped automatically. Add <code className="font-mono">.env</code> to your
        .gitignore and commit only the example file.
      </Note>
    </>
  );
}
