"use client";

import { useMemo, useState } from "react";
import {
  Checkbox,
  InputPanel,
  Note,
  Panel,
  StatGrid,
  Toolbar,
  useDebounced,
} from "@/components/ui";
import { getWords, keywordCounts, type KeywordCount } from "@/lib/text";

const SAMPLE = `Choosing the right running shoes matters more than most runners realise. A good running shoe supports your gait, cushions impact and helps prevent injury over long distances.

When you buy running shoes, consider the surface you run on. Road running shoes are built for pavement, while trail running shoes add grip and protection for uneven ground.

Fit matters most. Running shoes that are half a size too small cause black toenails; shoes that are too loose cause blisters. Try running shoes at the end of the day, when your feet have swollen slightly.`;

/** Anything above this reads as over-optimisation for a single term. */
const STUFFING_THRESHOLD = 4;

function Table({ rows, title }: { rows: KeywordCount[]; title: string }) {
  const peak = rows[0]?.count ?? 1;

  return (
    <Panel label={title}>
      {rows.length === 0 ? (
        <p className="px-3 py-4 text-sm text-muted">Not enough text to find repeated phrases.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted uppercase">
              <th className="px-3 py-2 font-medium">Phrase</th>
              <th className="px-3 py-2 text-right font-medium">Count</th>
              <th className="px-3 py-2 text-right font-medium">Density</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.phrase} className="border-b border-border last:border-0">
                <td className="px-3 py-1.5">
                  <span className="relative block">
                    <span
                      aria-hidden
                      className="absolute inset-y-0 left-0 -z-10 rounded bg-accent/10"
                      style={{ width: `${(row.count / peak) * 100}%` }}
                    />
                    {row.phrase}
                  </span>
                </td>
                <td className="px-3 py-1.5 text-right font-mono text-xs">{row.count}</td>
                <td
                  className={`px-3 py-1.5 text-right font-mono text-xs ${
                    row.density > STUFFING_THRESHOLD ? "text-warning" : "text-muted"
                  }`}
                >
                  {row.density.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );
}

export default function Client() {
  const [text, setText] = useState(SAMPLE);
  const [ignoreStopWords, setIgnoreStopWords] = useState(true);

  const debounced = useDebounced(text, 250);

  const single = useMemo(
    () => keywordCounts(debounced, 1, { ignoreStopWords, limit: 20 }),
    [debounced, ignoreStopWords],
  );
  const pairs = useMemo(
    () => keywordCounts(debounced, 2, { ignoreStopWords, limit: 15 }),
    [debounced, ignoreStopWords],
  );
  const triples = useMemo(
    () => keywordCounts(debounced, 3, { ignoreStopWords, limit: 15 }),
    [debounced, ignoreStopWords],
  );

  const totalWords = useMemo(() => getWords(debounced).length, [debounced]);
  const overUsed = single.filter((entry) => entry.density > STUFFING_THRESHOLD);

  return (
    <>
      <Toolbar>
        <div className="pb-1">
          <Checkbox
            checked={ignoreStopWords}
            onChange={setIgnoreStopWords}
            label="Ignore common stop words (the, and, of…)"
          />
        </div>
      </Toolbar>

      <InputPanel label="Page copy" value={text} onChange={setText} rows={12} />

      <div className="mt-4">
        <StatGrid
          stats={[
            { label: "Total words", value: totalWords.toLocaleString() },
            { label: "Unique terms", value: single.length.toLocaleString() },
            { label: "Top term", value: single[0]?.phrase ?? "—" },
            {
              label: "Top density",
              value: single[0] ? `${single[0].density.toFixed(2)}%` : "—",
            },
          ]}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Table rows={single} title="Single words" />
        <Table rows={pairs} title="Two-word phrases" />
        <Table rows={triples} title="Three-word phrases" />
      </div>

      {overUsed.length > 0 ? (
        <Note tone="warning">
          {overUsed.map((entry) => `“${entry.phrase}”`).join(", ")}{" "}
          {overUsed.length === 1 ? "appears" : "appear"} unusually often. Read the copy aloud — if it
          sounds repetitive, it will read that way to visitors too.
        </Note>
      ) : (
        <Note>
          There is no target density worth chasing. Search engines analyse meaning, not term counts —
          use this to catch accidental repetition, not to hit a number.
        </Note>
      )}
    </>
  );
}
