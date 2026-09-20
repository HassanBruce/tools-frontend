import Link from "next/link";
import { ToolCard } from "@/components/tool-card";
import { TOOLS } from "@/lib/tools";

/**
 * 404 page. A dead end is a bounce, so this offers routes onward rather than
 * just apologising — the most-used tools, and links to the two indexes.
 */
export default function NotFound() {
  const suggestions = TOOLS.filter((tool) =>
    ["json-formatter", "image-compressor", "meta-tag-generator", "diff-checker"].includes(
      tool.slug,
    ),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-20">
      <p className="font-mono text-sm font-semibold tracking-wide text-accent uppercase">
        Error 404
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        That page does not exist
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        The link may be out of date, or the address may have a typo. Nothing was lost — every tool
        here runs in your browser and stores nothing.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/tools"
          className="rounded-lg bg-accent px-5 py-2.5 font-medium text-accent-fg transition hover:opacity-90"
        >
          Browse all {TOOLS.length} tools
        </Link>
        <Link
          href="/blog"
          className="rounded-lg border border-border px-5 py-2.5 font-medium transition hover:bg-surface-muted"
        >
          Read the blog
        </Link>
      </div>

      <section className="mt-14">
        <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">
          Popular tools
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {suggestions.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>
    </div>
  );
}
