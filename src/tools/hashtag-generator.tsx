"use client";

import { useMemo, useState } from "react";
import {
  Checkbox,
  CopyButton,
  InputPanel,
  Note,
  NumberInput,
  Field,
  Panel,
  Segmented,
  Toolbar,
} from "@/components/ui";
import { STOP_WORDS } from "@/lib/text";

type Platform = "instagram" | "x" | "linkedin" | "tiktok";

/** Recommended counts differ sharply — more is not better on any of them. */
const PLATFORMS: Record<Platform, { label: string; ideal: string; max: number }> = {
  instagram: { label: "Instagram", ideal: "3–5", max: 30 },
  x: { label: "X / Twitter", ideal: "1–2", max: 3 },
  linkedin: { label: "LinkedIn", ideal: "3–5", max: 5 },
  tiktok: { label: "TikTok", ideal: "3–6", max: 8 },
};

function toHashtag(phrase: string, camel: boolean): string {
  const words = phrase
    .trim()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "";

  const joined = camel
    ? words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join("")
    : words.join("").toLowerCase();

  return `#${joined}`;
}

export default function Client() {
  const [input, setInput] = useState(
    "social media marketing\ncontent strategy\nsmall business tips\nSEO",
  );
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [camelCase, setCamelCase] = useState(true);
  const [extractFromText, setExtractFromText] = useState(false);
  const [limit, setLimit] = useState(8);

  const tags = useMemo(() => {
    let phrases: string[];

    if (extractFromText) {
      // Treat the input as prose and pull out the meaningful words.
      const seen = new Set<string>();
      phrases = input
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .split(/\s+/)
        .filter((word) => word.length > 3 && !STOP_WORDS.has(word))
        .filter((word) => (seen.has(word) ? false : (seen.add(word), true)));
    } else {
      phrases = input.split("\n");
    }

    const unique = new Set<string>();
    for (const phrase of phrases) {
      const tag = toHashtag(phrase, camelCase);
      if (tag.length > 1) unique.add(tag);
    }

    return [...unique].slice(0, Math.max(1, limit));
  }, [input, camelCase, extractFromText, limit]);

  const meta = PLATFORMS[platform];
  const overRecommended = tags.length > meta.max;
  const joined = tags.join(" ");

  return (
    <>
      <Toolbar>
        <Segmented
          label="Platform"
          value={platform}
          onChange={setPlatform}
          options={(Object.keys(PLATFORMS) as Platform[]).map((key) => ({
            value: key,
            label: PLATFORMS[key].label,
          }))}
        />
        <Field label="Max tags" className="w-28">
          <NumberInput value={limit} onChange={setLimit} min={1} max={30} />
        </Field>
        <div className="flex flex-col gap-1 pb-1.5">
          <Checkbox checked={camelCase} onChange={setCamelCase} label="CamelCase (accessible)" />
          <Checkbox
            checked={extractFromText}
            onChange={setExtractFromText}
            label="Extract from a caption"
          />
        </div>
      </Toolbar>

      <InputPanel
          share
          openFile
        label={extractFromText ? "Paste your caption" : "Keywords — one per line"}
        value={input}
        onChange={setInput}
        rows={8}
      />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel label={`${tags.length} hashtags`}>
          <div className="flex flex-wrap gap-2 p-3">
            {tags.length === 0 ? (
              <p className="text-sm text-muted">Add some keywords above.</p>
            ) : (
              tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent"
                >
                  {tag}
                </span>
              ))
            )}
          </div>
        </Panel>

        <Panel label="Ready to paste" actions={<CopyButton value={joined} />}>
          <p className="wrap-anywhere px-3 py-3 text-sm select-all">{joined || "—"}</p>
        </Panel>
      </div>

      <Note tone={overRecommended ? "warning" : "success"}>
        {meta.label} works best with {meta.ideal} hashtags
        {overRecommended
          ? ` — you have ${tags.length}. Relevance beats volume on every platform.`
          : `. You have ${tags.length}.`}
      </Note>

      {camelCase && (
        <Note>
          CamelCase matters for accessibility: a screen reader announces #SocialMediaTips correctly
          but reads #socialmediatips as one unbroken string.
        </Note>
      )}
    </>
  );
}
