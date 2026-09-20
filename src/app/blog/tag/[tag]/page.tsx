import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { PostCard } from "@/components/post-card";
import { pageMetadata } from "@/lib/metadata";
import { getAllTags, getPostsByTag } from "@/lib/posts";
import { breadcrumbs, graph } from "@/lib/schema";

/** One archive page per tag, prerendered from whatever tags posts actually use. */
export function generateStaticParams() {
  return getAllTags().map((entry) => ({ tag: entry.slug }));
}

export const dynamicParams = false;

function labelFor(slug: string): string | null {
  return getAllTags().find((entry) => entry.slug === slug)?.tag ?? null;
}

export async function generateMetadata(props: PageProps<"/blog/tag/[tag]">) {
  const { tag } = await props.params;
  const label = labelFor(tag);
  if (!label) return {};

  const count = getPostsByTag(tag).length;

  return pageMetadata({
    title: `${label} — Articles`,
    description: `${count} article${count === 1 ? "" : "s"} about ${label}. Practical notes on search, performance and developer tooling.`,
    path: `/blog/tag/${tag}`,
  });
}

export default async function TagPage(props: PageProps<"/blog/tag/[tag]">) {
  const { tag } = await props.params;
  const label = labelFor(tag);
  if (!label) notFound();

  const posts = getPostsByTag(tag);
  const allTags = getAllTags();

  const schema = graph([
    breadcrumbs([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: label, path: `/blog/tag/${tag}` },
    ]),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <nav
        aria-label="Breadcrumb"
        className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-muted"
      >
        <Link href="/" className="transition hover:text-foreground">
          Home
        </Link>
        <span aria-hidden>/</span>
        <Link href="/blog" className="transition hover:text-foreground">
          Blog
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">{label}</span>
      </nav>

      <header>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{label}</h1>
        <p className="mt-2 text-muted">
          {posts.length} article{posts.length === 1 ? "" : "s"} tagged “{label}”.
        </p>
      </header>

      <div className="mt-8 grid gap-4">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>

      <section className="mt-12 border-t border-border pt-6">
        <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">All topics</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {allTags.map((entry) => (
            <Link
              key={entry.slug}
              href={`/blog/tag/${entry.slug}`}
              className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                entry.slug === tag
                  ? "bg-accent text-accent-fg"
                  : "bg-surface-muted text-muted hover:text-foreground"
              }`}
            >
              {entry.tag}
              <span className="ml-1.5 opacity-60">{entry.count}</span>
            </Link>
          ))}
        </div>
      </section>

      <JsonLd json={schema} />
    </div>
  );
}
