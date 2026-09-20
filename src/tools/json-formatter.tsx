"use client";

import { useMemo, useState } from "react";
import {
  ErrorNote,
  Field,
  InputPanel,
  Note,
  OutputPanel,
  Segmented,
  Select,
  ToolGrid,
  Toolbar,
} from "@/components/ui";
import { describeJsonError } from "@/lib/text";

const SAMPLE = `{"name":"Ada Lovelace","born":1815,"fields":["mathematics","computing"],"notes":{"title":"Countess of Lovelace","firstProgrammer":true}}`;

type Mode = "format" | "minify";

const INDENTS = [
  { value: "2", label: "2 spaces" },
  { value: "4", label: "4 spaces" },
  { value: "tab", label: "Tabs" },
] as const;

export default function Client() {
  const [input, setInput] = useState(SAMPLE);
  const [mode, setMode] = useState<Mode>("format");
  const [indent, setIndent] = useState<(typeof INDENTS)[number]["value"]>("2");
  const [sortKeys, setSortKeys] = useState(false);

  const { output, error, size } = useMemo(() => {
    if (!input.trim()) return { output: "", error: null, size: null };

    try {
      const parsed = JSON.parse(input) as unknown;
      const replacer = sortKeys ? sortedReplacer : undefined;
      const spacing = indent === "tab" ? "\t" : Number(indent);
      const result =
        mode === "minify"
          ? JSON.stringify(parsed, replacer)
          : JSON.stringify(parsed, replacer, spacing);

      return {
        output: result ?? "",
        error: null,
        size: { before: input.length, after: (result ?? "").length },
      };
    } catch (caught) {
      return { output: "", error: describeJsonError(caught, input), size: null };
    }
  }, [input, mode, indent, sortKeys]);

  return (
    <>
      <Toolbar>
        <Segmented
          label="Mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: "format", label: "Format" },
            { value: "minify", label: "Minify" },
          ]}
        />
        {mode === "format" && (
          <Field label="Indent" className="w-36">
            <Select value={indent} onChange={setIndent} options={INDENTS} />
          </Field>
        )}
        <Field label="Keys" className="w-40">
          <Select
            value={sortKeys ? "sorted" : "original"}
            onChange={(value) => setSortKeys(value === "sorted")}
            options={[
              { value: "original", label: "Original order" },
              { value: "sorted", label: "Sort A–Z" },
            ]}
          />
        </Field>
      </Toolbar>

      <ToolGrid>
        <InputPanel
          language="json"
          share
          openFile
          label="JSON input"
          value={input}
          onChange={setInput}
          placeholder='{"hello": "world"}'
        />
        <OutputPanel
          language="json"
          label={mode === "minify" ? "Minified" : "Formatted"}
          value={output}
          filename="formatted.json"
          mime="application/json"
        />
      </ToolGrid>

      {error && <ErrorNote>{error}</ErrorNote>}

      {!error && size && mode === "minify" && size.after < size.before && (
        <Note tone="success">
          Minified from {size.before.toLocaleString()} to {size.after.toLocaleString()} characters —
          a {Math.round((1 - size.after / size.before) * 100)}% reduction.
        </Note>
      )}

      {!error && output && mode === "format" && <Note tone="success">Valid JSON.</Note>}
    </>
  );
}

/** Recursively sort object keys so two documents can be compared meaningfully. */
function sortedReplacer(this: unknown, _key: string, value: unknown): unknown {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return value;

  return Object.keys(value as Record<string, unknown>)
    .sort()
    .reduce<Record<string, unknown>>((accumulator, key) => {
      accumulator[key] = (value as Record<string, unknown>)[key];
      return accumulator;
    }, {});
}
