"use client";

import { useMemo, useState } from "react";
import {
  Checkbox,
  CopyButton,
  Field,
  InputPanel,
  Note,
  NumberInput,
  Panel,
  Select,
  Toolbar,
} from "@/components/ui";
import { slugify } from "@/lib/text";

export default function Client() {
  const [input, setInput] = useState("The 10 Best Ways to Optimise Your Café's Website in 2026");
  const [separator, setSeparator] = useState("-");
  const [removeStopWords, setRemoveStopWords] = useState(false);
  const [maxLength, setMaxLength] = useState(0);

  const lines = useMemo(
    () => input.split("\n").map((line) => line.trim()).filter(Boolean),
    [input],
  );

  const slugs = useMemo(
    () => lines.map((line) => slugify(line, { separator, removeStopWords, maxLength })),
    [lines, separator, removeStopWords, maxLength],
  );

  return (
    <>
      <Toolbar>
        <Field label="Separator" className="w-36">
          <Select
            value={separator}
            onChange={setSeparator}
            options={[
              { value: "-", label: "Hyphen ( - )" },
              { value: "_", label: "Underscore ( _ )" },
            ]}
          />
        </Field>
        <Field label="Max length" hint="0 for no limit" className="w-32">
          <NumberInput value={maxLength} onChange={setMaxLength} min={0} max={200} />
        </Field>
        <div className="pb-2">
          <Checkbox
            checked={removeStopWords}
            onChange={setRemoveStopWords}
            label="Remove stop words"
          />
        </div>
      </Toolbar>

      <InputPanel
          share
          openFile
        label="Titles — one per line"
        value={input}
        onChange={setInput}
        placeholder="My Blog Post Title"
        rows={6}
      />

      <div className="mt-4 grid gap-3">
        {slugs.map((slug, index) => (
          <Panel
            key={`${slug}-${index}`}
            label={lines[index].slice(0, 60)}
            actions={<CopyButton value={slug} />}
          >
            <p className="code-pane wrap-anywhere px-3 py-2.5">{slug || "—"}</p>
          </Panel>
        ))}
      </div>

      {slugs.length > 1 && (
        <div className="mt-4">
          <Panel label="All slugs" actions={<CopyButton value={slugs.join("\n")} label="Copy all" />}>
            <pre className="code-pane wrap-anywhere px-3 py-2.5 whitespace-pre-wrap">
              {slugs.join("\n")}
            </pre>
          </Panel>
        </div>
      )}

      {separator === "_" && (
        <Note tone="warning">
          Google treats an underscore as a word joiner, not a separator — my_blog_post reads as one
          token. Hyphens are the safer choice for URLs.
        </Note>
      )}
    </>
  );
}
