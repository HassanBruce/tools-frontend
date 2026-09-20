import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { SITE_URL } from "@/lib/metadata";
import { renderMarkdown } from "@/lib/markdown";
import { formatPostDate, getAllPosts, getPost, relatedPosts, tagSlug } from "@/lib/posts";
import { blogPosting, breadcrumbs, graph } from "@/lib/schema";
import { toolsInPost } from "@/lib/cross-links";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

export async function generateMetadata(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = getPost(slug);
  if (!post) return {};

  const url = `${SITE_URL}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article" as const,
      publishedTime: post.date || undefined,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image" as const,
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = relatedPosts(slug);
  const tools = toolsInPost(post);

  const schema = graph([
    blogPosting(post),
    breadcrumbs([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted"
      >
        <Link href="/" className="transition hover:text-foreground">
          Home
        </Link>
        <span aria-hidden>/</span>
        <Link href="/blog" className="transition hover:text-foreground">
          Blog
        </Link>
      </nav>

      <article>
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {post.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            <span aria-hidden>·</span>
            <span>{post.readingMinutes} min read</span>
            <span aria-hidden>·</span>
            <span>{post.author}</span>
          </div>
          {post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/tag/${tagSlug(tag)}`}
                  className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent transition hover:opacity-80"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        <div
          className="prose"
          // First-party markdown from content/blog, rendered at build time.
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }}
        />
      </article>

      {/* Tools this post links to, detected from the markdown itself. */}
      {tools.length > 0 && (
        <aside className="mt-14 rounded-xl border border-border bg-surface-muted p-5">
          <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">
            Tools used in this article
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {tools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group rounded-lg border border-border bg-surface p-3 transition hover:border-accent"
              >
                <h3 className="text-sm font-semibold transition group-hover:text-accent">
                  {tool.name}
                </h3>
                <p className="mt-1 text-xs text-muted">{tool.tagline}</p>
              </Link>
            ))}
          </div>
        </aside>
      )}

      {related.length > 0 && (
        <aside className="mt-16 border-t border-border pt-8">
          <h2 className="text-xl font-semibold tracking-tight">Read next</h2>
          <div className="mt-4 grid gap-3">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/blog/${item.slug}`}
                className="group rounded-xl border border-border bg-surface p-4 transition hover:border-accent"
              >
                <h3 className="font-semibold tracking-tight transition group-hover:text-accent">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-muted">{item.description}</p>
              </Link>
            ))}
          </div>
        </aside>
      )}

      <JsonLd json={schema} />
    </div>
  );
}
