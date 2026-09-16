"use client";

import { useMemo, useState } from "react";
import { InputPanel, Meter, Note, Panel, StatGrid } from "@/components/ui";
import { textStats } from "@/lib/text";

/** Where people actually run into a limit. */
const LIMITS = [
  { label: "Meta title", max: 60, unit: "characters" },
  { label: "Meta description", max: 160, unit: "characters" },
  { label: "X / Twitter post", max: 280, unit: "characters" },
  { label: "SMS (single)", max: 160, unit: "characters" },
  { label: "Instagram caption", max: 2200, unit: "characters" },
  { label: "LinkedIn post", max: 3000, unit: "characters" },
];

function formatMinutes(minutes: number): string {
  if (minutes < 1) return `${Math.max(1, Math.round(minutes * 60))} sec`;
  const whole = Math.floor(minutes);
  const seconds = Math.round((minutes - whole) * 60);
  return seconds > 0 ? `${whole} min ${seconds} sec` : `${whole} min`;
}

export default function Client() {
  const [text, setText] = useState(
    "Paste or type your text here. The counts update as you write, and the platform limits below show how close you are to being truncated.",
  );

  const stats = useMemo(() => textStats(text), [text]);

  return (
    <>
      <InputPanel label="Your text" value={text} onChange={setText} rows={14} />

      <div className="mt-4">
        <StatGrid
          stats={[
            { label: "Words", value: stats.words.toLocaleString() },
            {
              label: "Characters",
              value: stats.characters.toLocaleString(),
              hint: `${stats.charactersNoSpaces.toLocaleString()} without spaces`,
            },
            { label: "Sentences", value: stats.sentences.toLocaleString() },
            { label: "Paragraphs", value: stats.paragraphs.toLocaleString() },
          ]}
        />
      </div>

      <div className="mt-3">
        <StatGrid
          stats={[
            { label: "Lines", value: stats.lines.toLocaleString() },
            { label: "Syllables", value: stats.syllables.toLocaleString() },
            {
              label: "Reading time",
              value: formatMinutes(stats.readingMinutes),
              hint: "at 238 wpm",
            },
            {
              label: "Speaking time",
              value: formatMinutes(stats.speakingMinutes),
              hint: "at 150 wpm",
            },
          ]}
        />
      </div>

      <div className="mt-4">
        <Panel label="Platform limits">
          <div className="space-y-3 p-3">
            {LIMITS.map((limit) => {
              const over = stats.characters > limit.max;
              return (
                <Meter
                  key={limit.label}
                  label={limit.label}
                  value={Math.min(stats.characters, limit.max)}
                  max={limit.max}
                  display={`${stats.characters.toLocaleString()} / ${limit.max.toLocaleString()}`}
                  tone={over ? "danger" : stats.characters > limit.max * 0.9 ? "warning" : "success"}
                />
              );
            })}
          </div>
        </Panel>
      </div>

      <Note>
        Character counts include spaces, which is what nearly every platform limit counts. Reading
        time uses 238 words per minute, the average for silent adult reading.
      </Note>
    </>
  );
}
