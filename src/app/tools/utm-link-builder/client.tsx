"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  CopyButton,
  ErrorNote,
  Field,
  Note,
  OutputPanel,
  Panel,
  TextInput,
  Toolbar,
} from "@/components/ui";

const CHANNEL_PRESETS = [
  { label: "Email newsletter", source: "newsletter", medium: "email" },
  { label: "Facebook", source: "facebook", medium: "social" },
  { label: "LinkedIn", source: "linkedin", medium: "social" },
  { label: "X / Twitter", source: "twitter", medium: "social" },
  { label: "Google Ads", source: "google", medium: "cpc" },
  { label: "Affiliate", source: "partner", medium: "affiliate" },
  { label: "QR code / print", source: "print", medium: "offline" },
] as const;

export default function Client() {
  const [url, setUrl] = useState("https://example.com/landing-page");
  const [source, setSource] = useState("newsletter");
  const [medium, setMedium] = useState("email");
  const [campaign, setCampaign] = useState("spring-launch-2026");
  const [term, setTerm] = useState("");
  const [content, setContent] = useState("");
  const [lowercase, setLowercase] = useState(true);

  const { link, error } = useMemo(() => {
    const normalise = (value: string) => {
      const trimmed = value.trim();
      return lowercase ? trimmed.toLowerCase() : trimmed;
    };

    const base = url.trim();
    if (!base) return { link: "", error: null };

    let parsed: URL;
    try {
      parsed = new URL(base);
    } catch {
      return {
        link: "",
        error: "That is not a valid URL — include the scheme, for example https://example.com/page.",
      };
    }

    const params: [string, string][] = [
      ["utm_source", normalise(source)],
      ["utm_medium", normalise(medium)],
      ["utm_campaign", normalise(campaign)],
      ["utm_term", normalise(term)],
      ["utm_content", normalise(content)],
    ];

    for (const [key, value] of params) {
      if (value) parsed.searchParams.set(key, value);
      else parsed.searchParams.delete(key);
    }

    return { link: parsed.toString(), error: null };
  }, [url, source, medium, campaign, term, content, lowercase]);

  const missing = [
    !source.trim() && "source",
    !medium.trim() && "medium",
    !campaign.trim() && "campaign",
  ].filter(Boolean) as string[];

  /** One tagged URL per channel, for building a whole campaign at once. */
  const batch = useMemo(() => {
    if (!url.trim() || error) return "";

    const campaignValue = lowercase ? campaign.trim().toLowerCase() : campaign.trim();

    return CHANNEL_PRESETS.map((preset) => {
      try {
        const parsed = new URL(url.trim());
        parsed.searchParams.set("utm_source", preset.source);
        parsed.searchParams.set("utm_medium", preset.medium);
        if (campaignValue) parsed.searchParams.set("utm_campaign", campaignValue);
        return `${preset.label}\n${parsed.toString()}`;
      } catch {
        return "";
      }
    })
      .filter(Boolean)
      .join("\n\n");
  }, [url, campaign, error, lowercase]);

  return (
    <>
      <Toolbar>
        <Field label="Destination URL" className="min-w-64 flex-1">
          <TextInput value={url} onChange={setUrl} placeholder="https://example.com/page" mono />
        </Field>
        <div className="pb-2">
          <Checkbox checked={lowercase} onChange={setLowercase} label="Force lowercase" />
        </div>
      </Toolbar>

      <div className="mb-4 flex flex-wrap gap-2">
        {CHANNEL_PRESETS.map((preset) => (
          <Button
            key={preset.label}
            size="sm"
            onClick={() => {
              setSource(preset.source);
              setMedium(preset.medium);
            }}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label="Campaign parameters">
          <div className="grid gap-3 p-3">
            <Field label="Source *" hint="Where the traffic comes from — newsletter, google">
              <TextInput value={source} onChange={setSource} />
            </Field>
            <Field label="Medium *" hint="The channel type — email, cpc, social">
              <TextInput value={medium} onChange={setMedium} />
            </Field>
            <Field label="Campaign *" hint="The specific campaign name">
              <TextInput value={campaign} onChange={setCampaign} />
            </Field>
            <Field label="Term" hint="Paid keyword, optional">
              <TextInput value={term} onChange={setTerm} />
            </Field>
            <Field label="Content" hint="A/B variant or ad placement, optional">
              <TextInput value={content} onChange={setContent} />
            </Field>
          </div>
        </Panel>

        <div className="grid gap-3">
          <Panel label="Tagged URL" actions={<CopyButton value={link} />}>
            <p className="code-pane wrap-anywhere px-3 py-3 select-all">{link || "—"}</p>
          </Panel>

          <OutputPanel
            label="Every channel at once"
            value={batch}
            filename="utm-links.txt"
            rows={14}
          />
        </div>
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      {missing.length > 0 && !error && (
        <Note tone="warning">
          Missing {missing.join(", ")}. Source, medium and campaign are the three that make a
          campaign readable in analytics.
        </Note>
      )}

      <Note>
        Never put UTM parameters on internal links — they restart session attribution and overwrite
        the original traffic source, corrupting your reporting.
      </Note>
    </>
  );
}
