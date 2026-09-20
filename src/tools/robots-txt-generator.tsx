"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Field,
  Note,
  NumberInput,
  OutputPanel,
  Panel,
  Segmented,
  Select,
  TextInput,
  Toolbar,
} from "@/components/ui";

interface Rule {
  id: number;
  userAgent: string;
  directive: "Disallow" | "Allow";
  path: string;
}

let nextId = 1;
const makeRule = (partial: Partial<Rule> = {}): Rule => ({
  id: nextId++,
  userAgent: "*",
  directive: "Disallow",
  path: "/",
  ...partial,
});

type Preset = "open" | "closed" | "wordpress" | "custom";

const PRESETS: Record<Exclude<Preset, "custom">, Rule[]> = {
  open: [makeRule({ userAgent: "*", directive: "Disallow", path: "" })],
  closed: [makeRule({ userAgent: "*", directive: "Disallow", path: "/" })],
  wordpress: [
    makeRule({ userAgent: "*", directive: "Disallow", path: "/wp-admin/" }),
    makeRule({ userAgent: "*", directive: "Allow", path: "/wp-admin/admin-ajax.php" }),
    makeRule({ userAgent: "*", directive: "Disallow", path: "/?s=" }),
    makeRule({ userAgent: "*", directive: "Disallow", path: "/search/" }),
  ],
};

const AGENTS = [
  { value: "*", label: "All crawlers (*)" },
  { value: "Googlebot", label: "Googlebot" },
  { value: "Googlebot-Image", label: "Googlebot-Image" },
  { value: "Bingbot", label: "Bingbot" },
  { value: "DuckDuckBot", label: "DuckDuckBot" },
  { value: "GPTBot", label: "GPTBot (OpenAI)" },
  { value: "CCBot", label: "CCBot (Common Crawl)" },
  { value: "AhrefsBot", label: "AhrefsBot" },
  { value: "SemrushBot", label: "SemrushBot" },
];

export default function Client() {
  const [preset, setPreset] = useState<Preset>("wordpress");
  const [rules, setRules] = useState<Rule[]>(PRESETS.wordpress);
  const [sitemap, setSitemap] = useState("https://example.com/sitemap.xml");
  const [crawlDelay, setCrawlDelay] = useState(0);

  const applyPreset = (next: Preset) => {
    setPreset(next);
    if (next !== "custom") {
      // Fresh ids so React keys stay unique after switching presets.
      setRules(PRESETS[next].map((rule) => makeRule(rule)));
    }
  };

  const update = (id: number, patch: Partial<Rule>) => {
    setPreset("custom");
    setRules((current) => current.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)));
  };

  const output = useMemo(() => {
    const lines: string[] = [];

    // Group rules by user-agent — one block per crawler is the correct format.
    const grouped = new Map<string, Rule[]>();
    for (const rule of rules) {
      const agent = rule.userAgent.trim() || "*";
      grouped.set(agent, [...(grouped.get(agent) ?? []), rule]);
    }

    for (const [agent, agentRules] of grouped) {
      lines.push(`User-agent: ${agent}`);
      for (const rule of agentRules) {
        lines.push(`${rule.directive}: ${rule.path.trim()}`);
      }
      if (crawlDelay > 0) lines.push(`Crawl-delay: ${crawlDelay}`);
      lines.push("");
    }

    if (sitemap.trim()) {
      for (const entry of sitemap.split("\n").map((line) => line.trim()).filter(Boolean)) {
        lines.push(`Sitemap: ${entry}`);
      }
    }

    return lines.join("\n").trim() + "\n";
  }, [rules, sitemap, crawlDelay]);

  const blocksEverything = rules.some(
    (rule) => rule.userAgent.trim() === "*" && rule.directive === "Disallow" && rule.path.trim() === "/",
  );

  return (
    <>
      <Toolbar>
        <Segmented
          label="Start from"
          value={preset}
          onChange={applyPreset}
          options={[
            { value: "open", label: "Allow everything" },
            { value: "closed", label: "Block everything" },
            { value: "wordpress", label: "WordPress" },
            { value: "custom", label: "Custom" },
          ]}
        />
        <Field label="Crawl delay" hint="0 to omit" className="w-32">
          <NumberInput value={crawlDelay} onChange={setCrawlDelay} min={0} max={60} />
        </Field>
      </Toolbar>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-3">
          <Panel
            label="Rules"
            actions={
              <Button
                size="sm"
                onClick={() => {
                  setPreset("custom");
                  setRules((current) => [...current, makeRule({ path: "/private/" })]);
                }}
              >
                Add rule
              </Button>
            }
          >
            <div className="divide-y divide-border">
              {rules.map((rule) => (
                <div key={rule.id} className="grid gap-2 p-3 sm:grid-cols-[1fr_auto_1fr_auto]">
                  <Select
                    value={rule.userAgent}
                    onChange={(userAgent) => update(rule.id, { userAgent })}
                    options={AGENTS}
                  />
                  <Select
                    value={rule.directive}
                    onChange={(directive) => update(rule.id, { directive })}
                    options={[
                      { value: "Disallow", label: "Disallow" },
                      { value: "Allow", label: "Allow" },
                    ]}
                  />
                  <TextInput
                    value={rule.path}
                    onChange={(path) => update(rule.id, { path })}
                    placeholder="/path/"
                    mono
                  />
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      setPreset("custom");
                      setRules((current) => current.filter((item) => item.id !== rule.id));
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </Panel>

          <Panel label="Sitemaps — one per line">
            <div className="p-3">
              <textarea
                value={sitemap}
                onChange={(event) => setSitemap(event.target.value)}
                rows={3}
                className="code-pane w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
              />
            </div>
          </Panel>
        </div>

        <OutputPanel
          label="robots.txt"
          value={output}
          filename="robots.txt"
          rows={20}
        />
      </div>

      {blocksEverything && (
        <Note tone="warning">
          This blocks every crawler from your entire site. Correct for a staging environment —
          catastrophic on production.
        </Note>
      )}

      <Note>
        Upload to the root of your domain, at <code className="font-mono">/robots.txt</code>.
        Remember that Disallow prevents crawling, not indexing — to remove a page from results,
        allow crawling and use a <code className="font-mono">noindex</code> meta tag instead.
      </Note>
    </>
  );
}
