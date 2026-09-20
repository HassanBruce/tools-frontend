"use client";

import { useMemo, useState } from "react";
// js-yaml v5 ships named exports only — there is no default export.
import { dump, loadAll } from "js-yaml";
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

type Direction = "yaml-to-json" | "json-to-yaml";

const SAMPLE_YAML = `name: tools-frontend
version: 1.0.0
services:
  web:
    image: node:22-alpine
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
  cache:
    image: redis:7
features:
  - formatting
  - conversion
  - validation`;

const SAMPLE_JSON = `{
  "name": "tools-frontend",
  "version": "1.0.0",
  "features": ["formatting", "conversion"]
}`;

export default function Client() {
  const [direction, setDirection] = useState<Direction>("yaml-to-json");
  const [yamlInput, setYamlInput] = useState(SAMPLE_YAML);
  const [jsonInput, setJsonInput] = useState(SAMPLE_JSON);
  const [indent, setIndent] = useState("2");

  const toJson = direction === "yaml-to-json";
  const input = toJson ? yamlInput : jsonInput;
  const setInput = toJson ? setYamlInput : setJsonInput;

  const { output, error, documents } = useMemo(() => {
    if (!input.trim()) return { output: "", error: null, documents: 0 };

    try {
      if (toJson) {
        // loadAll handles multi-document YAML (--- separated) as well as single.
        const docs = loadAll(input) as unknown[];
        const value = docs.length === 1 ? docs[0] : docs;
        return {
          output: JSON.stringify(value, null, Number(indent)),
          error: null,
          documents: docs.length,
        };
      }

      const parsed = JSON.parse(input) as unknown;
      return {
        output: dump(parsed, { indent: Number(indent), lineWidth: 100, noRefs: true }),
        error: null,
        documents: 1,
      };
    } catch (caught) {
      return {
        output: "",
        error: toJson
          ? caught instanceof Error
            ? caught.message
            : String(caught)
          : describeJsonError(caught, input),
        documents: 0,
      };
    }
  }, [input, toJson, indent]);

  return (
    <>
      <Toolbar>
        <Segmented
          label="Direction"
          value={direction}
          onChange={setDirection}
          options={[
            { value: "yaml-to-json", label: "YAML → JSON" },
            { value: "json-to-yaml", label: "JSON → YAML" },
          ]}
        />
        <Field label="Indent" className="w-32">
          <Select
            value={indent}
            onChange={setIndent}
            options={[
              { value: "2", label: "2 spaces" },
              { value: "4", label: "4 spaces" },
            ]}
          />
        </Field>
      </Toolbar>

      <ToolGrid>
        <InputPanel
          language={toJson ? "yaml" : "json"}
          share
          openFile
          label={toJson ? "YAML input" : "JSON input"}
          value={input}
          onChange={setInput}
          placeholder={toJson ? "key: value" : '{ "key": "value" }'}
        />
        <OutputPanel
          language={toJson ? "json" : "yaml"}
          label={toJson ? "JSON output" : "YAML output"}
          value={output}
          filename={toJson ? "config.json" : "config.yaml"}
          mime={toJson ? "application/json" : "text/yaml"}
        />
      </ToolGrid>

      {error && <ErrorNote>{error}</ErrorNote>}
      {!error && documents > 1 && (
        <Note>
          Found {documents} YAML documents — they were converted to a JSON array, one entry per
          document.
        </Note>
      )}
      {!error && documents === 1 && output && <Note tone="success">Converted successfully.</Note>}
    </>
  );
}
