"use client";

import { useMemo, useState } from "react";
import {
  Field,
  InputPanel,
  Note,
  OutputPanel,
  Segmented,
  Select,
  ToolGrid,
  Toolbar,
} from "@/components/ui";
import { formatHtml, minifyMarkup } from "@/lib/markup";

const SAMPLE = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Example</title><!-- a comment --><style>body{margin:0;font-family:system-ui}</style></head><body><main class="wrapper"><h1>Hello</h1><p>Some <strong>bold</strong> text with a <a href="/link">link</a>.</p><img src="/logo.png" alt="Logo"><pre>  preformatted
  stays exactly
    as written</pre></main></body></html>`;

type Mode = "format" | "minify";

export default function Client() {
  const [input, setInput] = useState(SAMPLE);
  const [mode, setMode] = useState<Mode>("format");
  const [indent, setIndent] = useState("2");

  const output = useMemo(() => {
    if (!input.trim()) return "";
    const unit = indent === "tab" ? "\t" : " ".repeat(Number(indent));
    return mode === "minify" ? minifyMarkup(input, true) : formatHtml(input, unit);
  }, [input, mode, indent]);

  const saving =
    mode === "minify" && output && input.length > 0
      ? Math.round((1 - output.length / input.length) * 100)
      : 0;

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
            <Select
              value={indent}
              onChange={setIndent}
              options={[
                { value: "2", label: "2 spaces" },
                { value: "4", label: "4 spaces" },
                { value: "tab", label: "Tabs" },
              ]}
            />
          </Field>
        )}
      </Toolbar>

      <ToolGrid>
        <InputPanel
          language="html"
          share
          openFile
          label="HTML input"
          value={input}
          onChange={setInput}
          placeholder="<div><p>Hello</p></div>"
          rows={18}
        />
        <OutputPanel
          language="html"
          label={mode === "minify" ? "Minified" : "Formatted"}
          value={output}
          filename={mode === "minify" ? "page.min.html" : "page.html"}
          mime="text/html"
          rows={18}
        />
      </ToolGrid>

      {mode === "minify" && saving > 0 ? (
        <Note tone="success">
          {input.length.toLocaleString()} → {output.length.toLocaleString()} characters, a {saving}%
          reduction. Comments were removed; script, style and pre contents were left intact.
        </Note>
      ) : (
        output && (
          <Note>
            Whitespace inside <code className="font-mono">pre</code>,{" "}
            <code className="font-mono">textarea</code>, <code className="font-mono">script</code>{" "}
            and <code className="font-mono">style</code> is preserved exactly.
          </Note>
        )
      )}
    </>
  );
}
