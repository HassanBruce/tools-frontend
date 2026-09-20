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
import { csvToJson, jsonToCsv } from "@/lib/csv";
import { describeJsonError } from "@/lib/text";

type Direction = "json-to-csv" | "csv-to-json";

const SAMPLE_JSON = `[
  { "id": 1, "name": "Ada Lovelace", "role": { "title": "Mathematician" }, "tags": ["analysis", "computing"] },
  { "id": 2, "name": "Grace Hopper", "role": { "title": "Rear Admiral" }, "tags": ["compilers"] }
]`;

const SAMPLE_CSV = `id,name,role.title
1,Ada Lovelace,Mathematician
2,Grace Hopper,Rear Admiral`;

const DELIMITERS = [
  { value: ",", label: "Comma ( , )" },
  { value: ";", label: "Semicolon ( ; )" },
  { value: "\t", label: "Tab" },
  { value: "|", label: "Pipe ( | )" },
] as const;

export default function Client() {
  const [direction, setDirection] = useState<Direction>("json-to-csv");
  const [jsonInput, setJsonInput] = useState(SAMPLE_JSON);
  const [csvInput, setCsvInput] = useState(SAMPLE_CSV);
  const [delimiter, setDelimiter] = useState<string>(",");
  const [typed, setTyped] = useState(true);

  const toCsv = direction === "json-to-csv";
  const input = toCsv ? jsonInput : csvInput;
  const setInput = toCsv ? setJsonInput : setCsvInput;

  const { output, error, rows } = useMemo(() => {
    if (!input.trim()) return { output: "", error: null, rows: 0 };

    try {
      if (toCsv) {
        const parsed = JSON.parse(input) as unknown;
        if (!Array.isArray(parsed) && typeof parsed !== "object") {
          return { output: "", error: "Provide a JSON object or an array of objects.", rows: 0 };
        }
        const result = jsonToCsv(parsed, delimiter);
        return { output: result, error: null, rows: Array.isArray(parsed) ? parsed.length : 1 };
      }

      const parsed = csvToJson(input, { delimiter, typed });
      return { output: JSON.stringify(parsed, null, 2), error: null, rows: parsed.length };
    } catch (caught) {
      return {
        output: "",
        error: toCsv ? describeJsonError(caught, input) : String(caught),
        rows: 0,
      };
    }
  }, [input, toCsv, delimiter, typed]);

  return (
    <>
      <Toolbar>
        <Segmented
          label="Direction"
          value={direction}
          onChange={setDirection}
          options={[
            { value: "json-to-csv", label: "JSON → CSV" },
            { value: "csv-to-json", label: "CSV → JSON" },
          ]}
        />
        <Field label="Delimiter" className="w-44">
          <Select value={delimiter} onChange={setDelimiter} options={DELIMITERS} />
        </Field>
        {!toCsv && (
          <Field label="Values" className="w-48" hint="Parse numbers and booleans">
            <Select
              value={typed ? "typed" : "strings"}
              onChange={(value) => setTyped(value === "typed")}
              options={[
                { value: "typed", label: "Detect types" },
                { value: "strings", label: "Keep as strings" },
              ]}
            />
          </Field>
        )}
      </Toolbar>

      <ToolGrid>
        <InputPanel
          language={toCsv ? "json" : "plain"}
          share
          openFile
          label={toCsv ? "JSON input" : "CSV input"}
          value={input}
          onChange={setInput}
          placeholder={toCsv ? SAMPLE_JSON : SAMPLE_CSV}
        />
        <OutputPanel
          language={toCsv ? "plain" : "json"}
          label={toCsv ? "CSV output" : "JSON output"}
          value={output}
          filename={toCsv ? "data.csv" : "data.json"}
          mime={toCsv ? "text/csv" : "application/json"}
        />
      </ToolGrid>

      {error && <ErrorNote>{error}</ErrorNote>}
      {!error && rows > 0 && (
        <Note tone="success">
          Converted {rows.toLocaleString()} {rows === 1 ? "row" : "rows"}.
          {toCsv && " Nested keys were flattened into dotted column names."}
        </Note>
      )}
    </>
  );
}
