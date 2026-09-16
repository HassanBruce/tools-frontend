"use client";

import { useMemo, useState } from "react";
import { ToolCard } from "@/components/tool-card";
import { CATEGORIES, CATEGORY_ORDER, TOOLS } from "@/lib/tools";

export function ToolSearch() {
  const [query, setQuery] = useState("");

  const term = query.trim().toLowerCase();

  const matches = useMemo(() => {
    if (!term) return TOOLS;
    return TOOLS.filter((tool) =>
      [tool.name, tool.tagline, tool.description, ...tool.keywords]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [term]);

  return (
    <>
      <div className="relative mt-6 max-w-md">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search ${TOOLS.length} tools…`}
          aria-label="Search tools"
          className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
        />
      </div>

      {term ? (
        <section className="mt-10">
          <h2 className="text-sm font-medium text-muted">
            {matches.length} {matches.length === 1 ? "result" : "results"} for “{query.trim()}”
          </h2>
          {matches.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {matches.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-border bg-surface-muted p-6 text-sm text-muted">
              Nothing matched. Try a broader term like “json”, “image” or “meta”.
            </p>
          )}
        </section>
      ) : (
        CATEGORY_ORDER.map((category) => {
          const tools = TOOLS.filter((tool) => tool.category === category);
          const meta = CATEGORIES[category];
          return (
            <section key={category} id={category} className="scroll-mt-20 py-8">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-2xl font-semibold tracking-tight">{meta.label}</h2>
                <span className="text-sm text-muted">{tools.length} tools</span>
              </div>
              <p className="mt-2 max-w-2xl text-muted">{meta.blurb}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </>
  );
}
