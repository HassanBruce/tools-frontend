"use client";

import { useMemo, useState } from "react";
import { marked } from "marked";
import TurndownService from "turndown";
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
import { sanitizeHtml } from "@/lib/markup";

type Direction = "md-to-html" | "html-to-md";
type View = "code" | "preview";

const SAMPLE_MD = `# Project Toolkit

A collection of **browser-based** tools with _no backend_.

## Features

- [x] Runs offline
- [x] No uploads
- [ ] Dark mode everywhere

| Tool | Category |
| ---- | -------- |
| JSON formatter | Developer |
| Meta tags | SEO |

> Everything happens locally.

\`\`\`js
const total = items.reduce((sum, item) => sum + item.value, 0);
\`\`\`

See the [docs](https://example.com) for more.`;

const SAMPLE_HTML = `<h1>Project Toolkit</h1>
<p>A collection of <strong>browser-based</strong> tools.</p>
<ul><li>Runs offline</li><li>No uploads</li></ul>
<blockquote><p>Everything happens locally.</p></blockquote>`;

export default function Client() {
  const [direction, setDirection] = useState<Direction>("md-to-html");
  const [view, setView] = useState<View>("code");
  const [markdown, setMarkdown] = useState(SAMPLE_MD);
  const [html, setHtml] = useState(SAMPLE_HTML);

  const toHtml = direction === "md-to-html";
  const input = toHtml ? markdown : html;
  const setInput = toHtml ? setMarkdown : setHtml;

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: null };
    try {
      if (toHtml) {
        const result = marked.parse(input, { gfm: true, breaks: false, async: false });
        return { output: typeof result === "string" ? result : "", error: null };
      }
      const service = new TurndownService({
        headingStyle: "atx",
        codeBlockStyle: "fenced",
        bulletListMarker: "-",
      });
      return { output: service.turndown(input), error: null };
    } catch (caught) {
      return { output: "", error: caught instanceof Error ? caught.message : String(caught) };
    }
  }, [input, toHtml]);

  return (
    <>
      <Toolbar>
        <Segmented
          label="Direction"
          value={direction}
          onChange={setDirection}
          options={[
            { value: "md-to-html", label: "Markdown → HTML" },
            { value: "html-to-md", label: "HTML → Markdown" },
          ]}
        />
        {toHtml && (
          <Segmented
            label="Output as"
            value={view}
            onChange={setView}
            options={[
              { value: "code", label: "Code" },
              { value: "preview", label: "Preview" },
            ]}
          />
        )}
      </Toolbar>

      <ToolGrid>
        <InputPanel
          label={toHtml ? "Markdown" : "HTML"}
          value={input}
          onChange={setInput}
          rows={20}
        />

        {toHtml && view === "preview" ? (
          <Panel label="Rendered preview">
            <div
              className="prose-preview max-w-none px-4 py-3"
              // marked passes raw HTML through, so the rendered string is run
              // through sanitizeHtml first — otherwise a <script> tag in the
              // markdown would execute here.
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(output) }}
            />
          </Panel>
        ) : (
          <OutputPanel
            label={toHtml ? "HTML" : "Markdown"}
            value={output}
            filename={toHtml ? "content.html" : "content.md"}
            mime={toHtml ? "text/html" : "text/markdown"}
            rows={20}
          />
        )}
      </ToolGrid>

      {error && <ErrorNote>{error}</ErrorNote>}

      <Note>
        GitHub Flavored Markdown — tables, fenced code, task lists and strikethrough are all
        supported. The <strong>preview</strong> is sanitised before rendering, but the{" "}
        <strong>HTML output</strong> is raw: if you publish it on your own site, sanitise it there
        too.
      </Note>

      <style>{`
        .prose-preview h1 { font-size: 1.75rem; font-weight: 600; margin: 0.75rem 0; letter-spacing: -0.02em; }
        .prose-preview h2 { font-size: 1.35rem; font-weight: 600; margin: 1rem 0 0.5rem; }
        .prose-preview h3 { font-size: 1.1rem; font-weight: 600; margin: 0.75rem 0 0.4rem; }
        .prose-preview p { margin: 0.6rem 0; line-height: 1.65; }
        .prose-preview ul, .prose-preview ol { margin: 0.6rem 0; padding-left: 1.4rem; }
        .prose-preview ul { list-style: disc; }
        .prose-preview ol { list-style: decimal; }
        .prose-preview li { margin: 0.25rem 0; }
        .prose-preview a { color: var(--accent); text-decoration: underline; }
        .prose-preview code { font-family: var(--font-geist-mono), monospace; font-size: 0.85em; background: var(--surface-muted); padding: 0.1rem 0.3rem; border-radius: 4px; }
        .prose-preview pre { background: var(--surface-muted); padding: 0.75rem; border-radius: 8px; overflow-x: auto; margin: 0.75rem 0; }
        .prose-preview pre code { background: none; padding: 0; }
        .prose-preview blockquote { border-left: 3px solid var(--border); padding-left: 0.9rem; color: var(--muted); margin: 0.75rem 0; }
        .prose-preview table { border-collapse: collapse; width: 100%; margin: 0.75rem 0; font-size: 0.9em; }
        .prose-preview th, .prose-preview td { border: 1px solid var(--border); padding: 0.4rem 0.6rem; text-align: left; }
        .prose-preview th { background: var(--surface-muted); font-weight: 600; }
        .prose-preview hr { border: 0; border-top: 1px solid var(--border); margin: 1rem 0; }
        .prose-preview img { max-width: 100%; height: auto; }
      `}</style>
    </>
  );
}
