import Link from "next/link";
import { ToolCard } from "@/components/tool-card";
import { JsonLd } from "@/components/json-ld";
import { CATEGORIES, CATEGORY_ORDER, TOOL_COUNT, toolsByCategory } from "@/lib/tools";
import { pageMetadata } from "@/lib/metadata";
import { graph, organisation, website } from "@/lib/schema";
import { formatPostDate, getAllPosts } from "@/lib/posts";

export const metadata = pageMetadata({
  title: `${TOOL_COUNT} Free Developer & SEO Tools — No Sign-up, No Uploads`,
  description:
    "A fast, free collection of developer and SEO tools that run entirely in your browser. Format JSON, compress images, build meta tags and more. Nothing is uploaded.",
  path: "/",
});

export default function Home() {
  // Newest three, so the section stays one tidy row.
  const posts = getAllPosts().slice(0, 3);

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

      {/*
        The homepage is the most linked-to page on the site, so it is where
        authority accumulates. Surfacing recent posts passes some of that to the
        blog and gives tool visitors a route into the writing.
      */}
      {posts.length > 0 && (
        <section className="border-t border-border py-12">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">From the blog</h2>
            <Link
              href="/blog"
              className="text-sm font-medium text-accent transition hover:opacity-80"
            >
              All articles →
            </Link>
          </div>
          <p className="mt-2 max-w-2xl text-muted">
            Working notes on search, performance and developer tooling.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-xl border border-border bg-surface p-4 transition hover:border-accent hover:shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
                  <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                  <span aria-hidden>·</span>
                  <span>{post.readingMinutes} min read</span>
                </div>
                <h3 className="mt-1.5 font-semibold tracking-tight transition group-hover:text-accent">
                  {post.title}
                </h3>
                <p className="mt-1.5 line-clamp-3 text-sm text-muted">{post.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <JsonLd json={graph([website(), organisation()])} />
    </div>
  );
}
