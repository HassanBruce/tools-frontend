"use client";

import { useMemo, useState } from "react";
import { Checkbox, InputPanel, Note, Panel, StatGrid, Toolbar, useDebounced } from "@/components/ui";
import {
  countSyllables,
  getSentences,
  getWords,
  looksPassive,
  readability,
  readingEaseLabel,
} from "@/lib/text";

const SAMPLE = `The implementation of the aforementioned configuration methodology necessitates careful consideration of numerous interdependent variables, and it should be noted that the performance characteristics of the system are significantly influenced by decisions that are made during the initial architectural planning phase.

Short sentences work better. They are easier to read. Your reader can follow them without effort.

The documentation was written by the engineering team and was subsequently reviewed by several stakeholders before it was eventually published to the internal knowledge base, which is where most people will encounter it for the first time.`;

const LONG_SENTENCE = 25;
const VERY_LONG_SENTENCE = 35;

interface Analysed {
  text: string;
  words: number;
  tone: "ok" | "long" | "veryLong";
  passive: boolean;
}

export default function Client() {
  const [text, setText] = useState(SAMPLE);
  const [showComplex, setShowComplex] = useState(true);
  const [showPassive, setShowPassive] = useState(true);

  const debounced = useDebounced(text, 250);

  const scores = useMemo(() => readability(debounced), [debounced]);

  const sentences = useMemo<Analysed[]>(() => {
    return getSentences(debounced).map((sentence) => {
      const words = getWords(sentence).length;
      return {
        text: sentence,
        words,
        tone:
          words > VERY_LONG_SENTENCE ? "veryLong" : words > LONG_SENTENCE ? "long" : "ok",
        passive: looksPassive(sentence),
      };
    });
  }, [debounced]);

  const hardCount = sentences.filter((sentence) => sentence.tone !== "ok").length;
  const passiveCount = sentences.filter((sentence) => sentence.passive).length;
  const ease = scores ? readingEaseLabel(scores.fleschReadingEase) : null;

  return (
    <>
      <Toolbar>
        <div className="flex flex-wrap gap-x-5 gap-y-1 pb-1">
          <Checkbox
            checked={showComplex}
            onChange={setShowComplex}
            label="Underline complex words"
          />
          <Checkbox checked={showPassive} onChange={setShowPassive} label="Mark passive voice" />
        </div>
      </Toolbar>

      <div className="grid gap-4 lg:grid-cols-2">
        <InputPanel label="Your writing" value={text} onChange={setText} rows={20} />

        <Panel label="Marked up">
          <div className="px-3 py-2.5 leading-[1.9]">
            {sentences.length === 0 ? (
              <p className="text-sm text-muted">Paste some text to see it analysed.</p>
            ) : (
              sentences.map((sentence, index) => (
                <span
                  key={index}
                  title={`${sentence.words} words${sentence.passive ? " · passive voice" : ""}`}
                  className={
                    sentence.tone === "veryLong"
                      ? "rounded bg-danger/15 decoration-danger/50"
                      : sentence.tone === "long"
                        ? "rounded bg-warning/15"
                        : showPassive && sentence.passive
                          ? "rounded bg-accent/10"
                          : ""
                  }
                >
                  {showComplex
                    ? sentence.text.split(/(\s+)/).map((token, tokenIndex) =>
                        /\s/.test(token) || countSyllables(token) < 3 ? (
                          token
                        ) : (
                          <span
                            key={tokenIndex}
                            className="underline decoration-muted decoration-dotted underline-offset-4"
                          >
                            {token}
                          </span>
                        ),
                      )
                    : sentence.text}{" "}
                </span>
              ))
            )}
          </div>
        </Panel>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-warning/40" /> Long sentence (over {LONG_SENTENCE}{" "}
          words)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-danger/40" /> Very long (over {VERY_LONG_SENTENCE})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-accent/30" /> Passive voice
        </span>
        <span className="flex items-center gap-1.5">
          <span className="underline decoration-muted decoration-dotted">word</span> Three or more
          syllables
        </span>
      </div>

      {scores && ease && (
        <>
          <div className="mt-4">
            <StatGrid
              stats={[
                {
                  label: "Reading ease",
                  value: Math.round(scores.fleschReadingEase),
                  hint: `${ease.label} · ${ease.grade}`,
                },
                {
                  label: "Grade level",
                  value: scores.fleschKincaidGrade.toFixed(1),
                  hint: "Flesch–Kincaid",
                },
                {
                  label: "Words / sentence",
                  value: scores.averageWordsPerSentence.toFixed(1),
                  hint: "aim for under 20",
                },
                {
                  label: "Complex words",
                  value: `${Math.round(scores.complexWordRatio * 100)}%`,
                  hint: "3+ syllables",
                },
              ]}
            />
          </div>

          <div className="mt-3">
            <StatGrid
              stats={[
                { label: "Gunning Fog", value: scores.gunningFog.toFixed(1) },
                { label: "Coleman–Liau", value: scores.colemanLiau.toFixed(1) },
                { label: "Automated RI", value: scores.automatedReadability.toFixed(1) },
                {
                  label: "Needs work",
                  value: hardCount,
                  hint: `${passiveCount} passive`,
                },
              ]}
            />
          </div>
        </>
      )}

      <Note>
        Aim for a reading ease of 60–70 for general web copy. Passive voice is flagged, not
        forbidden — it is the right choice when the actor is unknown or irrelevant.
      </Note>
    </>
  );
}
