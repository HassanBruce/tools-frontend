"use client";

import { useMemo, useState } from "react";
import {
  Field,
  Note,
  OutputPanel,
  Panel,
  Segmented,
  Select,
  TextInput,
  Toolbar,
} from "@/components/ui";
import { escapeHtml } from "@/lib/text";

type Platform = "facebook" | "twitter" | "linkedin";

const CARD_TYPES = [
  { value: "summary_large_image", label: "Large image" },
  { value: "summary", label: "Summary (small image)" },
] as const;

export default function Client() {
  const [title, setTitle] = useState("Free Developer & SEO Tools — Toolkit");
  const [description, setDescription] = useState(
    "37 browser-based tools for formatting, converting and analysing. No uploads, no sign-up.",
  );
  const [url, setUrl] = useState("https://example.com");
  const [image, setImage] = useState("https://example.com/og-image.png");
  const [siteName, setSiteName] = useState("Toolkit");
  const [twitterHandle, setTwitterHandle] = useState("@example");
  const [cardType, setCardType] = useState<(typeof CARD_TYPES)[number]["value"]>(
    "summary_large_image",
  );
  const [platform, setPlatform] = useState<Platform>("facebook");

  const tags = useMemo(() => {
    const escape = (value: string) => escapeHtml(value.trim());
    const lines = [
      "<!-- Open Graph -->",
      `<meta property="og:type" content="website" />`,
      `<meta property="og:title" content="${escape(title)}" />`,
      `<meta property="og:description" content="${escape(description)}" />`,
      `<meta property="og:url" content="${escape(url)}" />`,
      `<meta property="og:image" content="${escape(image)}" />`,
      `<meta property="og:image:width" content="1200" />`,
      `<meta property="og:image:height" content="630" />`,
    ];
    if (siteName.trim()) lines.push(`<meta property="og:site_name" content="${escape(siteName)}" />`);

    lines.push(
      "",
      "<!-- Twitter / X -->",
      `<meta name="twitter:card" content="${cardType}" />`,
      `<meta name="twitter:title" content="${escape(title)}" />`,
      `<meta name="twitter:description" content="${escape(description)}" />`,
      `<meta name="twitter:image" content="${escape(image)}" />`,
    );
    if (twitterHandle.trim()) {
      const handle = twitterHandle.trim().startsWith("@")
        ? twitterHandle.trim()
        : `@${twitterHandle.trim()}`;
      lines.push(`<meta name="twitter:site" content="${escape(handle)}" />`);
    }

    return lines.join("\n");
  }, [title, description, url, image, siteName, twitterHandle, cardType]);

  const host = useMemo(() => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url || "example.com";
    }
  }, [url]);

  const isRelative = image.trim() !== "" && !/^https?:\/\//i.test(image.trim());

  return (
    <>
      <Toolbar>
        <Field label="Title" className="min-w-64 flex-1">
          <TextInput value={title} onChange={setTitle} />
        </Field>
        <Segmented
          label="Preview as"
          value={platform}
          onChange={setPlatform}
          options={[
            { value: "facebook", label: "Facebook" },
            { value: "twitter", label: "X" },
            { value: "linkedin", label: "LinkedIn" },
          ]}
        />
      </Toolbar>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-3">
          <Panel label="Description">
            <div className="p-3">
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                className="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
              />
            </div>
          </Panel>
          <Panel label="URLs and identity">
            <div className="grid gap-3 p-3">
              <Field label="Canonical URL">
                <TextInput value={url} onChange={setUrl} mono />
              </Field>
              <Field label="Image URL" hint="1200 × 630 px, absolute URL">
                <TextInput value={image} onChange={setImage} mono />
              </Field>
              <Field label="Site name">
                <TextInput value={siteName} onChange={setSiteName} />
              </Field>
              <Field label="X / Twitter handle">
                <TextInput value={twitterHandle} onChange={setTwitterHandle} />
              </Field>
              <Field label="Card type">
                <Select value={cardType} onChange={setCardType} options={CARD_TYPES} />
              </Field>
            </div>
          </Panel>
        </div>

        <div className="grid gap-3">
          <Panel label={`Preview — ${platform}`}>
            <div className="p-4">
              <div
                className={`overflow-hidden border border-border ${
                  platform === "twitter" ? "rounded-2xl" : "rounded-lg"
                }`}
              >
                {cardType === "summary_large_image" ? (
                  <div className="flex aspect-[1.91/1] items-center justify-center bg-surface-muted text-xs text-muted">
                    {image.trim() ? "1200 × 630 image" : "No image set"}
                  </div>
                ) : null}
                <div
                  className={`p-3 ${platform === "facebook" ? "bg-surface-muted" : "bg-surface"}`}
                >
                  <p className="text-[0.7rem] tracking-wide text-muted uppercase">{host}</p>
                  <p className="mt-1 line-clamp-2 font-semibold">{title || "Your title"}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">
                    {description || "Your description"}
                  </p>
                </div>
              </div>
            </div>
          </Panel>

          <OutputPanel
            label="Meta tags"
            value={tags}
            filename="open-graph.html"
            mime="text/html"
            rows={16}
          />
        </div>
      </div>

      {isRelative && (
        <Note tone="warning">
          Your image URL is relative. Crawlers cannot resolve relative paths — use a full URL
          beginning with https://.
        </Note>
      )}

      <Note>
        Platforms cache aggressively. After changing these tags, force a re-scrape with Facebook’s
        Sharing Debugger or LinkedIn’s Post Inspector, or the old card will keep appearing.
      </Note>
    </>
  );
}
