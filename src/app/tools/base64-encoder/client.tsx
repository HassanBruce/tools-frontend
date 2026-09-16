"use client";

import { useMemo, useState } from "react";
import {
  Checkbox,
  ErrorNote,
  InputPanel,
  Note,
  OutputPanel,
  Segmented,
  ToolGrid,
  Toolbar,
} from "@/components/ui";

type Mode = "encode" | "decode";

/** Encode via UTF-8 bytes — btoa() alone throws on anything outside Latin-1. */
function encodeBase64(text: string, urlSafe: boolean): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);

  const base64 = btoa(binary);
  return urlSafe ? base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : base64;
}

function decodeBase64(text: string): string {
  let normalised = text.trim().replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  // Restore the padding a URL-safe encoder stripped.
  while (normalised.length % 4 !== 0) normalised += "=";

  const binary = atob(normalised);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

export default function Client() {
  const [mode, setMode] = useState<Mode>("encode");
  const [urlSafe, setUrlSafe] = useState(false);
  const [text, setText] = useState("Hello, world! 👋 Grüße");
  const [encoded, setEncoded] = useState("SGVsbG8sIHdvcmxkIQ==");

  const encoding = mode === "encode";
  const input = encoding ? text : encoded;
  const setInput = encoding ? setText : setEncoded;

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: null };
    try {
      return {
        output: encoding ? encodeBase64(input, urlSafe) : decodeBase64(input),
        error: null,
      };
    } catch {
      return {
        output: "",
        error: encoding
          ? "Could not encode this text."
          : "That is not valid Base64. Check for stray characters or a truncated string.",
      };
    }
  }, [input, encoding, urlSafe]);

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
        {encoding && (
          <div className="pb-2">
            <Checkbox checked={urlSafe} onChange={setUrlSafe} label="URL-safe (-_ , no padding)" />
          </div>
        )}
      </Toolbar>

      <ToolGrid>
        <InputPanel
          label={encoding ? "Plain text" : "Base64"}
          value={input}
          onChange={setInput}
          placeholder={encoding ? "Text to encode" : "SGVsbG8="}
        />
        <OutputPanel
          label={encoding ? "Base64" : "Plain text"}
          value={output}
          filename={encoding ? "encoded.txt" : "decoded.txt"}
        />
      </ToolGrid>

      {error && <ErrorNote>{error}</ErrorNote>}
      {!error && output && (
        <Note tone="success">
          {input.length.toLocaleString()} characters in, {output.length.toLocaleString()} out.
          {encoding && urlSafe && " Using the URL-safe alphabet."}
        </Note>
      )}
    </>
  );
}
