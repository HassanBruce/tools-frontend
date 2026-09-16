import Link from "next/link";
import type { ReactNode } from "react";
import { CATEGORIES, getTool, relatedTools } from "@/lib/tools";
import { ToolCard } from "@/components/tool-card";

/**
 * Chrome shared by every tool page: heading, the tool itself, then the
 * editorial sections driven by `content` in the tool registry.
 *
 * The interactive tool is passed as `children` — it is the only client
 * component on the page, which keeps `metadata` exportable from page.tsx.
 */
export function ToolPage({ slug, children }: { slug: string; children: ReactNode }) {
  const tool = getTool(slug);
  if (!tool) throw new Error(`Unknown tool: ${slug}`);

  const related = relatedTools(slug);
  const category = CATEGORIES[tool.category];

  // FAQ rich-result markup. Harmless if Google chooses not to use it.
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: tool.content.faq.map((entry) => ({
      "@type": "Question",
      name: entry.q,
      acceptedAnswer: { "@type": "Answer", text: entry.a },
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-muted">
        <Link href="/" className="transition hover:text-foreground">
          Home
        </Link>
        <span aria-hidden>/</span>
        <Link href="/tools" className="transition hover:text-foreground">
          Tools
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">{tool.name}</span>
      </nav>

      <header className="mb-6">
        <span className="text-xs font-semibold tracking-wide text-accent uppercase">
          {category.label}
        </span>
        <h1 className="mt-1.5 text-3xl font-semibold tracking-tight sm:text-4xl">{tool.name}</h1>
        <p className="mt-2 max-w-2xl text-muted">{tool.tagline}</p>
      </header>

      {children}

      {/* ---------------------------------------------- editorial / SEO copy */}
      <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-10">
          <section>
            <h2 className="text-xl font-semibold tracking-tight">About this tool</h2>
            <p className="mt-3 leading-relaxed text-muted">{tool.content.intro}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight">How to use it</h2>
            <ol className="mt-4 space-y-3">
              {tool.content.steps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span
                    aria-hidden
                    className="grid size-6 shrink-0 place-items-center rounded-full bg-accent-soft font-mono text-xs font-semibold text-accent"
                  >
                    {index + 1}
                  </span>
                  <span className="leading-relaxed text-muted">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
            <dl className="mt-4 divide-y divide-border rounded-xl border border-border bg-surface">
              {tool.content.faq.map((entry) => (
                <div key={entry.q} className="p-4">
                  <dt className="font-medium">{entry.q}</dt>
                  <dd className="mt-1.5 leading-relaxed text-muted">{entry.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        {related.length > 0 && (
          <aside>
            <h2 className="text-xl font-semibold tracking-tight">Related tools</h2>
            <div className="mt-4 grid gap-3">
              {related.map((item) => (
                <ToolCard key={item.slug} tool={item} />
              ))}
            </div>
          </aside>
        )}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </div>
  );
}
