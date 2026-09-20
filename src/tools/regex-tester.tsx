"use client";

import { useMemo, useState } from "react";
import {
  Checkbox,
  ErrorNote,
  Field,
  InputPanel,
  Note,
  Panel,
  TextInput,
  Toolbar,
} from "@/components/ui";

const SAMPLE_TEXT = `Contact: ada@example.com and grace@navy.mil
Backup addresses: hopper@example.org, invalid@@example
Updated 2026-01-15 by team@example.co.uk`;

const FLAGS = [
  { flag: "g", label: "global" },
  { flag: "i", label: "ignore case" },
  { flag: "m", label: "multiline" },
  { flag: "s", label: "dotall" },
  { flag: "u", label: "unicode" },
] as const;

/** Guards against a pathological pattern locking up the tab. */
const MATCH_LIMIT = 5000;

interface MatchInfo {
  index: number;
  text: string;
  groups: (string | undefined)[];
  named: Record<string, string | undefined>;
}

export default function Client() {
  const [pattern, setPattern] = useState("(?<user>[\\w.+-]+)@(?<domain>[\\w-]+\\.[\\w.]+)");
  const [flags, setFlags] = useState<string[]>(["g"]);
  const [text, setText] = useState(SAMPLE_TEXT);
  const [replacement, setReplacement] = useState("$<user> [at] $<domain>");

  const flagString = flags.join("");

  const { regex, error } = useMemo(() => {
    if (!pattern) return { regex: null, error: null };
    try {
      return { regex: new RegExp(pattern, flagString), error: null };
    } catch (caught) {
      return { regex: null, error: caught instanceof Error ? caught.message : String(caught) };
    }
  }, [pattern, flagString]);

  const matches = useMemo<MatchInfo[]>(() => {
    if (!regex || !text) return [];

    const found: MatchInfo[] = [];
    // Always iterate globally so the match table is complete, regardless of /g.
    const scanner = new RegExp(regex.source, flagString.includes("g") ? flagString : flagString + "g");

    let match: RegExpExecArray | null;
    while ((match = scanner.exec(text)) !== null) {
      found.push({
        index: match.index,
        text: match[0],
        groups: match.slice(1),
        named: match.groups ?? {},
      });

      // A zero-length match would otherwise loop forever.
      if (match[0] === "") scanner.lastIndex++;
      if (found.length >= MATCH_LIMIT) break;
      if (!flagString.includes("g")) break;
    }

    return found;
  }, [regex, text, flagString]);

  /** Split the subject into plain and matched segments for highlighting. */
  const segments = useMemo(() => {
    if (matches.length === 0) return [{ text, match: false }];

    const parts: { text: string; match: boolean }[] = [];
    let cursor = 0;

    for (const match of matches) {
      if (match.index > cursor) parts.push({ text: text.slice(cursor, match.index), match: false });
      if (match.text) parts.push({ text: match.text, match: true });
      cursor = match.index + match.text.length;
    }
    if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false });

    return parts;
  }, [matches, text]);

  const replaced = useMemo(() => {
    if (!regex || !text) return "";
    try {
      return text.replace(regex, replacement);
    } catch {
      return "";
    }
  }, [regex, text, replacement]);

  const toggleFlag = (flag: string, on: boolean) =>
    setFlags((current) => (on ? [...current, flag] : current.filter((item) => item !== flag)));

  return (
    <>
      <Toolbar>
        <Field label="Pattern" className="min-w-64 flex-1">
          <TextInput value={pattern} onChange={setPattern} placeholder="[a-z]+" mono />
        </Field>
        <div className="flex flex-wrap gap-x-4 gap-y-1 pb-1">
          {FLAGS.map(({ flag, label }) => (
            <Checkbox
              key={flag}
              checked={flags.includes(flag)}
              onChange={(on) => toggleFlag(flag, on)}
              label={`${flag} — ${label}`}
            />
          ))}
        </div>
      </Toolbar>

      {error && <ErrorNote>Invalid pattern: {error}</ErrorNote>}

      <div className="grid gap-4 lg:grid-cols-2">
        <InputPanel share openFile label="Test string" value={text} onChange={setText} rows={12} />

        <Panel label={`${matches.length} match${matches.length === 1 ? "" : "es"}`}>
          <pre className="code-pane wrap-anywhere px-3 py-2.5 whitespace-pre-wrap">
            {segments.map((segment, index) =>
              segment.match ? (
                <mark
                  key={index}
                  className="rounded bg-accent/25 text-foreground ring-1 ring-accent/40"
                >
                  {segment.text}
                </mark>
              ) : (
                <span key={index}>{segment.text}</span>
              ),
            )}
          </pre>
        </Panel>
      </div>

      {matches.length > 0 && (
        <Panel label="Match details" className="mt-4">
          <div className="max-h-80 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface">
                <tr className="border-b border-border text-left text-xs text-muted uppercase">
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">Index</th>
                  <th className="px-3 py-2 font-medium">Match</th>
                  <th className="px-3 py-2 font-medium">Groups</th>
                </tr>
              </thead>
              <tbody>
                {matches.slice(0, 200).map((match, index) => (
                  <tr key={index} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 font-mono text-xs text-muted">{index + 1}</td>
                    <td className="px-3 py-2 font-mono text-xs text-muted">{match.index}</td>
                    <td className="wrap-anywhere px-3 py-2 font-mono text-xs">{match.text}</td>
                    <td className="wrap-anywhere px-3 py-2 font-mono text-xs text-muted">
                      {Object.keys(match.named).length > 0
                        ? Object.entries(match.named)
                            .map(([name, value]) => `${name}: ${value ?? "—"}`)
                            .join(", ")
                        : match.groups.length > 0
                          ? match.groups.map((group, position) => `$${position + 1}: ${group ?? "—"}`).join(", ")
                          : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel label="Replacement pattern">
          <div className="p-3">
            <TextInput
              value={replacement}
              onChange={setReplacement}
              placeholder="$1 or $<name>"
              mono
            />
          </div>
        </Panel>
        <Panel label="Replace preview">
          <pre className="code-pane wrap-anywhere px-3 py-2.5 whitespace-pre-wrap">
            {replaced || "—"}
          </pre>
        </Panel>
      </div>

      {matches.length >= MATCH_LIMIT && (
        <Note tone="warning">
          Stopped at {MATCH_LIMIT.toLocaleString()} matches to keep the page responsive.
        </Note>
      )}
    </>
  );
}
