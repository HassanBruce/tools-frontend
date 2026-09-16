"use client";

import { useMemo, useState } from "react";
import { CopyButton, InputPanel, Panel } from "@/components/ui";
import { toCases } from "@/lib/text";

const LABELS: { key: keyof ReturnType<typeof toCases>; label: string; example: string }[] = [
  { key: "camel", label: "camelCase", example: "JavaScript variables" },
  { key: "pascal", label: "PascalCase", example: "Class and component names" },
  { key: "snake", label: "snake_case", example: "Python, SQL columns" },
  { key: "constant", label: "CONSTANT_CASE", example: "Environment variables" },
  { key: "kebab", label: "kebab-case", example: "URLs, CSS classes" },
  { key: "train", label: "Train-Case", example: "HTTP headers" },
  { key: "dot", label: "dot.case", example: "Config keys" },
  { key: "path", label: "path/case", example: "File paths" },
  { key: "title", label: "Title Case", example: "Headings" },
  { key: "sentence", label: "Sentence case", example: "Body copy" },
  { key: "lower", label: "lowercase", example: "" },
  { key: "upper", label: "UPPERCASE", example: "" },
  { key: "alternating", label: "aLtErNaTiNg", example: "" },
  { key: "inverse", label: "Inverse case", example: "" },
];

export default function Client() {
  const [input, setInput] = useState("parseHTTPResponse handler");

  const cases = useMemo(() => toCases(input), [input]);

  return (
    <>
      <InputPanel
        label="Input text"
        value={input}
        onChange={setInput}
        placeholder="my variable name"
        rows={4}
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {LABELS.map(({ key, label, example }) => (
          <Panel key={key} label={label} actions={<CopyButton value={cases[key]} />}>
            <div className="px-3 py-2.5">
              <p className="code-pane wrap-anywhere min-h-5">{cases[key] || "—"}</p>
              {example && <p className="mt-1.5 text-xs text-muted">{example}</p>}
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}
