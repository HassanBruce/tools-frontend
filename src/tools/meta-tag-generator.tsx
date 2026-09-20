"use client";

import { useMemo, useState } from "react";
import {
  Field,
  Meter,
  Note,
  OutputPanel,
  Panel,
  Segmented,
  TextInput,
  Toolbar,
  useMounted,
} from "@/components/ui";
import { escapeHtml, measureText } from "@/lib/text";

type Device = "desktop" | "mobile";

/**
 * Google truncates on rendered width, not character count. These are the
 * approximate container widths and the fonts the SERP renders in.
 */
const RENDER = {
  desktop: { titleFont: "20px Arial, sans-serif", titleMax: 580, descFont: "14px Arial, sans-serif", descMax: 920 },
  mobile: { titleFont: "18px Arial, sans-serif", titleMax: 460, descFont: "14px Arial, sans-serif", descMax: 680 },
} as const;

function truncateToWidth(text: string, font: string, max: number): string {
  if (measureText(text, font) <= max) return text;

  let low = 0;
  let high = text.length;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (measureText(text.slice(0, mid) + "…", font) <= max) low = mid;
    else high = mid - 1;
  }
  return text.slice(0, low).trimEnd() + "…";
}

export default function Client() {
  const [title, setTitle] = useState("Free Online JSON Formatter & Validator — Toolkit");
  const [description, setDescription] = useState(
    "Format, validate and minify JSON instantly in your browser. Get the exact line and column of any syntax error. No uploads, no sign-up, completely free.",
  );
  const [url, setUrl] = useState("https://example.com/tools/json-formatter");
  const [device, setDevice] = useState<Device>("desktop");

  const mounted = useMounted();
  const render = RENDER[device];

  const widths = useMemo(() => {
    if (!mounted) return null;
    return {
      title: measureText(title, render.titleFont),
      description: measureText(description, render.descFont),
    };
  }, [mounted, title, description, render]);

  const preview = useMemo(() => {
    if (!mounted) return { title, description };
    return {
      title: truncateToWidth(title, render.titleFont, render.titleMax),
      description: truncateToWidth(description, render.descFont, render.descMax),
    };
  }, [mounted, title, description, render]);

  const tags = useMemo(() => {
    const lines = [
      `<title>${escapeHtml(title)}</title>`,
      `<meta name="description" content="${escapeHtml(description)}" />`,
    ];
    if (url.trim()) lines.push(`<link rel="canonical" href="${escapeHtml(url.trim())}" />`);
    lines.push(`<meta name="robots" content="index, follow" />`);
    return lines.join("\n");
  }, [title, description, url]);

  const displayUrl = useMemo(() => {
    try {
      const parsed = new URL(url);
      const segments = parsed.pathname.split("/").filter(Boolean);
      return { host: parsed.hostname.replace(/^www\./, ""), crumbs: segments };
    } catch {
      return { host: url || "example.com", crumbs: [] as string[] };
    }
  }, [url]);

  const titleOver = widths ? widths.title > render.titleMax : false;
  const descOver = widths ? widths.description > render.descMax : false;

  return (
    <>
      <Toolbar>
        <Field label="Page title" className="min-w-64 flex-1">
          <TextInput value={title} onChange={setTitle} placeholder="Your page title" />
        </Field>
        <Segmented
          label="Preview"
          value={device}
          onChange={setDevice}
          options={[
            { value: "desktop", label: "Desktop" },
            { value: "mobile", label: "Mobile" },
          ]}
        />
      </Toolbar>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-3">
          <Panel label="Meta description">
            <div className="p-3">
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                className="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
              />
            </div>
          </Panel>

          <Panel label="Canonical URL">
            <div className="p-3">
              <TextInput value={url} onChange={setUrl} placeholder="https://example.com/page" mono />
            </div>
          </Panel>

          <Panel label="Rendered width">
            <div className="space-y-3 p-3">
              <Meter
                label="Title"
                value={Math.min(widths?.title ?? 0, render.titleMax)}
                max={render.titleMax}
                display={`${Math.round(widths?.title ?? 0)} / ${render.titleMax} px`}
                tone={titleOver ? "danger" : (widths?.title ?? 0) > render.titleMax * 0.9 ? "warning" : "success"}
              />
              <Meter
                label="Description"
                value={Math.min(widths?.description ?? 0, render.descMax)}
                max={render.descMax}
                display={`${Math.round(widths?.description ?? 0)} / ${render.descMax} px`}
                tone={descOver ? "danger" : (widths?.description ?? 0) > render.descMax * 0.9 ? "warning" : "success"}
              />
              <p className="text-xs text-muted">
                {title.length} title characters · {description.length} description characters
              </p>
            </div>
          </Panel>
        </div>

        <div className="grid gap-3">
          <Panel label={`Google preview — ${device}`}>
            <div className={`p-4 ${device === "mobile" ? "max-w-sm" : ""}`}>
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="grid size-6 place-items-center rounded-full border border-border text-[0.6rem]"
                >
                  {displayUrl.host.charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs text-foreground">{displayUrl.host}</span>
                  <span className="block truncate text-xs text-muted">
                    {displayUrl.host}
                    {displayUrl.crumbs.length > 0 && ` › ${displayUrl.crumbs.join(" › ")}`}
                  </span>
                </span>
              </div>
              <p
                className="mt-1.5 cursor-pointer text-[#1a0dab] hover:underline dark:text-[#8ab4f8]"
                style={{ font: render.titleFont }}
              >
                {preview.title || "Your page title"}
              </p>
              <p
                className="mt-1 text-[#4d5156] dark:text-[#bdc1c6]"
                style={{ font: render.descFont }}
              >
                {preview.description || "Your meta description appears here."}
              </p>
            </div>
          </Panel>

          <OutputPanel label="Meta tags" value={tags} filename="meta-tags.html" mime="text/html" rows={7} />
        </div>
      </div>

      {(titleOver || descOver) && (
        <Note tone="warning">
          {titleOver && "Your title will be truncated in search results. "}
          {descOver && "Your description will be truncated. "}
          The preview above shows where the cut falls.
        </Note>
      )}

      <Note>
        Widths are measured in pixels because that is how Google decides — a title of capitals and
        wide letters is cut well before 60 characters, while a narrow one can run longer.
      </Note>
    </>
  );
}
