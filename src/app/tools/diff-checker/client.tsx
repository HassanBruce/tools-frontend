"use client";

import { useMemo, useState } from "react";
// diffArrays rather than diffLines: it accepts a custom comparator (diffLines
// has no ignoreCase option) and hands back the original lines, not normalised
// ones, so the rendered output keeps its real casing and spacing.
import { diffArrays } from "diff";
import {
  Checkbox,
  InputPanel,
  Note,
  Panel,
  Segmented,
  StatGrid,
  ToolGrid,
  Toolbar,
  useDebounced,
} from "@/components/ui";

type View = "split" | "unified";

const SAMPLE_A = `{
  "name": "toolkit",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  },
  "license": "MIT"
}`;

const SAMPLE_B = `{
  "name": "toolkit",
  "version": "1.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "lint": "eslint"
  },
  "license": "MIT"
}`;

interface Row {
  left?: { number: number; text: string };
  right?: { number: number; text: string };
  kind: "same" | "added" | "removed" | "changed";
}

/** Split text into lines, dropping a single trailing empty line. */
function toLines(value: string): string[] {
  const lines = value.split("\n");
  if (lines[lines.length - 1] === "") lines.pop();
  return lines;
}

export default function Client() {
  const [left, setLeft] = useState(SAMPLE_A);
  const [right, setRight] = useState(SAMPLE_B);
  const [view, setView] = useState<View>("split");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);

  const debouncedLeft = useDebounced(left, 250);
  const debouncedRight = useDebounced(right, 250);

  const { rows, stats } = useMemo(() => {
    const normalise = (line: string) => {
      let value = line;
      if (ignoreWhitespace) value = value.trim().replace(/\s+/g, " ");
      if (ignoreCase) value = value.toLowerCase();
      return value;
    };

    const changes = diffArrays(toLines(debouncedLeft), toLines(debouncedRight), {
      comparator: (a, b) => normalise(a) === normalise(b),
    });

    const built: Row[] = [];
    let leftNumber = 1;
    let rightNumber = 1;
    let added = 0;
    let removed = 0;

    for (let index = 0; index < changes.length; index++) {
      const change = changes[index];
      const lines = change.value;

      if (!change.added && !change.removed) {
        for (const text of lines) {
          built.push({
            kind: "same",
            left: { number: leftNumber++, text },
            right: { number: rightNumber++, text },
          });
        }
        continue;
      }

      if (change.removed) {
        const next = changes[index + 1];
        // A removal immediately followed by an addition is a modification —
        // pair them up so the two versions sit on the same row.
        const nextLines = next?.added ? next.value : [];
        const pairs = Math.max(lines.length, nextLines.length);

        for (let offset = 0; offset < pairs; offset++) {
          const leftText = lines[offset];
          const rightText = nextLines[offset];
          built.push({
            kind: leftText !== undefined && rightText !== undefined ? "changed" : leftText !== undefined ? "removed" : "added",
            left: leftText !== undefined ? { number: leftNumber++, text: leftText } : undefined,
            right: rightText !== undefined ? { number: rightNumber++, text: rightText } : undefined,
          });
        }

        removed += lines.length;
        if (next?.added) {
          added += nextLines.length;
          index++; // consumed
        }
        continue;
      }

      // A standalone addition.
      for (const text of lines) {
        built.push({ kind: "added", right: { number: rightNumber++, text } });
      }
      added += lines.length;
    }

    return { rows: built, stats: { added, removed, total: built.length } };
  }, [debouncedLeft, debouncedRight, ignoreWhitespace, ignoreCase]);

  const identical = stats.added === 0 && stats.removed === 0;

  const background = (kind: Row["kind"], side: "left" | "right") => {
    if (kind === "same") return "";
    if (kind === "added") return side === "right" ? "bg-success/12" : "bg-surface-muted/50";
    if (kind === "removed") return side === "left" ? "bg-danger/12" : "bg-surface-muted/50";
    return side === "left" ? "bg-danger/12" : "bg-success/12";
  };

  return (
    <>
      <Toolbar>
        <Segmented
          label="View"
          value={view}
          onChange={setView}
          options={[
            { value: "split", label: "Side by side" },
            { value: "unified", label: "Unified" },
          ]}
        />
        <div className="flex flex-col gap-1 pb-1.5">
          <Checkbox
            checked={ignoreWhitespace}
            onChange={setIgnoreWhitespace}
            label="Ignore whitespace"
          />
          <Checkbox checked={ignoreCase} onChange={setIgnoreCase} label="Ignore case" />
        </div>
      </Toolbar>

      <ToolGrid>
        <InputPanel label="Original" value={left} onChange={setLeft} rows={12} />
        <InputPanel label="Changed" value={right} onChange={setRight} rows={12} />
      </ToolGrid>

      <div className="mt-4">
        <StatGrid
          stats={[
            { label: "Lines added", value: stats.added },
            { label: "Lines removed", value: stats.removed },
            { label: "Total rows", value: stats.total },
            { label: "Result", value: identical ? "Identical" : "Different" },
          ]}
        />
      </div>

      <div className="mt-4">
        <Panel label="Differences">
          <div className="overflow-x-auto">
            {view === "split" ? (
              <table className="w-full table-fixed border-collapse">
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index} className="align-top">
                      <td className="w-10 border-r border-border px-2 py-0.5 text-right font-mono text-[0.7rem] text-muted select-none">
                        {row.left?.number ?? ""}
                      </td>
                      <td
                        className={`code-pane wrap-anywhere w-1/2 border-r border-border px-2 py-0.5 whitespace-pre-wrap ${background(row.kind, "left")}`}
                      >
                        {row.left?.text ?? ""}
                      </td>
                      <td className="w-10 border-r border-border px-2 py-0.5 text-right font-mono text-[0.7rem] text-muted select-none">
                        {row.right?.number ?? ""}
                      </td>
                      <td
                        className={`code-pane wrap-anywhere w-1/2 px-2 py-0.5 whitespace-pre-wrap ${background(row.kind, "right")}`}
                      >
                        {row.right?.text ?? ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="min-w-full">
                {rows.map((row, index) => (
                  <div key={index}>
                    {row.left && row.kind !== "same" && (
                      <div className="code-pane wrap-anywhere bg-danger/12 px-3 py-0.5 whitespace-pre-wrap">
                        <span className="mr-2 text-danger select-none">−</span>
                        {row.left.text}
                      </div>
                    )}
                    {row.right && row.kind !== "same" && (
                      <div className="code-pane wrap-anywhere bg-success/12 px-3 py-0.5 whitespace-pre-wrap">
                        <span className="mr-2 text-success select-none">+</span>
                        {row.right.text}
                      </div>
                    )}
                    {row.kind === "same" && (
                      <div className="code-pane wrap-anywhere px-3 py-0.5 whitespace-pre-wrap text-muted">
                        <span className="mr-2 select-none"> </span>
                        {row.left?.text}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Panel>
      </div>

      {identical && (
        <Note tone="success">
          The two texts are identical
          {ignoreWhitespace || ignoreCase ? " under the current comparison settings." : "."}
        </Note>
      )}
    </>
  );
}
