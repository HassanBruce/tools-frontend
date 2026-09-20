"use client";

import { useMemo, useState } from "react";
import {
  InputPanel,
  Note,
  OutputPanel,
  Segmented,
  StatGrid,
  ToolGrid,
  Toolbar,
  formatBytes,
} from "@/components/ui";
import { minifyCss, minifyJs } from "@/lib/minify";

type Language = "css" | "js";

const SAMPLE_CSS = `/* Layout tokens */
:root {
  --gap: 1rem;
  --max-width: calc(100% - 2rem);
}

.card {
  display: grid;
  gap: var(--gap);
  padding: 1rem 1.25rem;   /* generous */
  border-radius: 12px;
}

.card > .title { font-weight: 600; }`;

const SAMPLE_JS = `// Format a byte count for display
function formatBytes(bytes) {
  /* Units are powers of 1024, not 1000 */
  const units = ["B", "KB", "MB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const clean = String(bytes).replace(/[^0-9]/g, "");
  return \`\${(bytes / 1024 ** index).toFixed(1)} \${units[index]}\`;
}`;

export default function Client() {
  const [language, setLanguage] = useState<Language>("css");
  const [css, setCss] = useState(SAMPLE_CSS);
  const [js, setJs] = useState(SAMPLE_JS);

  const isCss = language === "css";
  const input = isCss ? css : js;
  const setInput = isCss ? setCss : setJs;

  const output = useMemo(() => {
    if (!input.trim()) return "";
    return isCss ? minifyCss(input) : minifyJs(input);
  }, [input, isCss]);

  const before = new Blob([input]).size;
  const after = new Blob([output]).size;
  const saved = before > 0 ? Math.round((1 - after / before) * 100) : 0;

  return (
    <>
      <Toolbar>
        <Segmented
          label="Language"
          value={language}
          onChange={setLanguage}
          options={[
            { value: "css", label: "CSS" },
            { value: "js", label: "JavaScript" },
          ]}
        />
      </Toolbar>

      <ToolGrid>
        <InputPanel
          language={isCss ? "css" : "javascript"}
          share
          openFile
          label={isCss ? "CSS source" : "JavaScript source"}
          value={input}
          onChange={setInput}
          rows={18}
        />
        <OutputPanel
          language={isCss ? "css" : "javascript"}
          label="Minified"
          value={output}
          filename={isCss ? "styles.min.css" : "script.min.js"}
          mime={isCss ? "text/css" : "text/javascript"}
          rows={18}
        />
      </ToolGrid>

      {output && (
        <div className="mt-4">
          <StatGrid
            stats={[
              { label: "Original", value: formatBytes(before) },
              { label: "Minified", value: formatBytes(after) },
              { label: "Saved", value: `${saved}%` },
              { label: "Bytes removed", value: (before - after).toLocaleString() },
            ]}
          />
        </div>
      )}

      <Note>
        Safe minification only — comments and redundant whitespace. Variables are not renamed, and{" "}
        {isCss
          ? "spacing inside calc() is preserved, since removing it would produce invalid CSS."
          : "line breaks are kept so automatic semicolon insertion behaves identically."}{" "}
        Always test minified output before deploying.
      </Note>
    </>
  );
}
