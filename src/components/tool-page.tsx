import Link from "next/link";
import type { ReactNode } from "react";
import { CATEGORIES, getTool, relatedTools } from "@/lib/tools";
import { ToolCard } from "@/components/tool-card";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbs, faqPage, graph, softwareApplication } from "@/lib/schema";
import { renderMarkdown } from "@/lib/markdown";
import { postsForTool } from "@/lib/cross-links";

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
  const articles = postsForTool(slug);
  const category = CATEGORIES[tool.category];

  // One @graph carrying the app itself, the breadcrumb trail and the FAQ.
  const schema = graph([
    softwareApplication(tool),
    breadcrumbs([
      { name: "Home", path: "/" },
      { name: "Tools", path: "/tools" },
      { name: tool.name, path: `/tools/${tool.slug}` },
    ]),
    faqPage(tool.content.faq),
  ]);

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

          {tool.content.sections?.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-semibold tracking-tight">{section.heading}</h2>
              <div
                className="prose mt-3"
                // First-party content from the registry, rendered at build time.
                dangerouslySetInnerHTML={{ __html: renderMarkdown(section.body) }}
              />
            </section>
          ))}

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

        <aside className="space-y-8">
          {/*
            Derived automatically from posts that link to this tool — see
            lib/cross-links.ts. This is the path from tool traffic into the blog,
            so it appears above related tools deliberately.
          */}
          {articles.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold tracking-tight">Articles using this tool</h2>
              <div className="mt-4 grid gap-3">
                {articles.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group rounded-xl border border-border bg-surface p-4 transition hover:border-accent hover:shadow-sm"
                  >
                    <h3 className="font-semibold tracking-tight transition group-hover:text-accent">
                      {post.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-muted">{post.description}</p>
                    <p className="mt-2 text-xs text-muted">{post.readingMinutes} min read</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold tracking-tight">Related tools</h2>
              <div className="mt-4 grid gap-3">
                {related.map((item) => (
                  <ToolCard key={item.slug} tool={item} />
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>

      <JsonLd json={schema} />
    </div>
  );
}
