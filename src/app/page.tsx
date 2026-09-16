import Link from "next/link";
import { ToolCard } from "@/components/tool-card";
import { CATEGORIES, CATEGORY_ORDER, TOOL_COUNT, toolsByCategory } from "@/lib/tools";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <section className="py-10 text-center sm:py-16">
        <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {TOOL_COUNT} developer &amp; SEO tools that run in your browser
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted text-pretty">
          Format, convert, generate and analyse — instantly. No accounts, no uploads, no rate
          limits. Your data never leaves your device.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/tools"
            className="rounded-lg bg-accent px-5 py-2.5 font-medium text-accent-fg transition hover:opacity-90"
          >
            Browse all tools
          </Link>
          <Link
            href="/tools/json-formatter"
            className="rounded-lg border border-border px-5 py-2.5 font-medium transition hover:bg-surface-muted"
          >
            Try the JSON formatter
          </Link>
        </div>
      </section>

      {CATEGORY_ORDER.map((category) => {
        const tools = toolsByCategory(category);
        const meta = CATEGORIES[category];
        return (
          <section key={category} id={category} className="scroll-mt-20 py-10">
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
      })}
    </div>
  );
}
