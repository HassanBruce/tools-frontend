"use client";

import { useMemo, useState } from "react";
import {
  ErrorNote,
  InputPanel,
  Note,
  OutputPanel,
  Panel,
  Segmented,
  ToolGrid,
  Toolbar,
} from "@/components/ui";

type Mode = "encode" | "decode";
type Scope = "component" | "full";

export default function Client() {
  const [mode, setMode] = useState<Mode>("encode");
  const [scope, setScope] = useState<Scope>("component");
  const [input, setInput] = useState("https://example.com/search?q=hello world&lang=en");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: null };
    try {
      if (mode === "encode") {
        return {
          output: scope === "component" ? encodeURIComponent(input) : encodeURI(input),
          error: null,
        };
      }
      return {
        output: scope === "component" ? decodeURIComponent(input) : decodeURI(input),
        error: null,
      };
    } catch {
      return {
        output: "",
        error:
          "Could not decode this string — it contains a malformed percent sequence such as a lone % sign.",
      };
    }
  }, [input, mode, scope]);

  /** Break a URL's query string out into a readable table. */
  const params = useMemo(() => {
    const source = mode === "decode" ? output || input : input;
    const queryStart = source.indexOf("?");
    if (queryStart === -1) return [];
    try {
      const search = new URLSearchParams(source.slice(queryStart + 1));
      return [...search.entries()];
    } catch {
      return [];
    }
  }, [input, output, mode]);

  return (
    <>
      <Toolbar>
        <Segmented
          label="Mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: "encode", label: "Encode" },
            { value: "decode", label: "Decode" },
          ]}
        />
        <Segmented
          label="Scope"
          value={scope}
          onChange={setScope}
          options={[
            { value: "component", label: "Component" },
            { value: "full", label: "Full URL" },
          ]}
        />
      </Toolbar>

      <ToolGrid>
        <InputPanel share openFile label="Input" value={input} onChange={setInput} placeholder="https://example.com/?q=a b" />
        <OutputPanel label="Result" value={output} filename="url.txt" />
      </ToolGrid>

      {error && <ErrorNote>{error}</ErrorNote>}

      {!error && (
        <Note>
          {scope === "component"
            ? "Component mode escapes reserved characters such as & = ? / — use it for a single query value."
            : "Full URL mode leaves the URL structure intact and only escapes unsafe characters like spaces."}
        </Note>
      )}

      {params.length > 0 && (
        <Panel label="Query parameters" className="mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted uppercase">
                <th className="px-3 py-2 font-medium">Key</th>
                <th className="px-3 py-2 font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {params.map(([key, value], index) => (
                <tr key={`${key}-${index}`} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 font-mono text-xs">{key}</td>
                  <td className="wrap-anywhere px-3 py-2 font-mono text-xs text-muted">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </>
  );
}
