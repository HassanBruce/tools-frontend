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
import { formatXml, minifyMarkup, validateXml } from "@/lib/markup";

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?><catalog><book id="bk101"><author>Ada Lovelace</author><title>Notes on the Analytical Engine</title><price currency="GBP">29.99</price><!-- first published 1843 --><description><![CDATA[Contains the first published algorithm intended for a machine.]]></description></book></catalog>`;

type Mode = "format" | "minify";

export default function Client() {
  const [input, setInput] = useState(SAMPLE);
  const [mode, setMode] = useState<Mode>("format");
  const [indent, setIndent] = useState("2");

  const output = useMemo(() => {
    if (!input.trim()) return "";
    const unit = indent === "tab" ? "\t" : " ".repeat(Number(indent));
    return mode === "minify" ? minifyMarkup(input, false) : formatXml(input, unit);
  }, [input, mode, indent]);

  const error = useMemo(() => validateXml(input), [input]);

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
          language="xml"
          share
          openFile
          label="XML input"
          value={input}
          onChange={setInput}
          placeholder="<root><item>value</item></root>"
        />
        <OutputPanel
          language="xml"
          label={mode === "minify" ? "Minified" : "Formatted"}
          value={output}
          filename="formatted.xml"
          mime="application/xml"
        />
      </ToolGrid>

      {error ? (
        <ErrorNote>{error}</ErrorNote>
      ) : (
        output && <Note tone="success">Well-formed XML. Comments and CDATA were preserved.</Note>
      )}
    </>
  );
}
