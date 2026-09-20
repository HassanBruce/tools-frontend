import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { PostCard } from "@/components/post-card";
import { pageMetadata } from "@/lib/metadata";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { blogListing, breadcrumbs, graph } from "@/lib/schema";

export const metadata = pageMetadata({
  title: "Blog — Practical Notes on SEO, Performance and Developer Tooling",
  description:
    "Working notes on search, web performance and developer tooling. No fluff, no listicles — just the things that turned out to matter in practice.",
  path: "/blog",
});

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const tags = getAllTags();

  const schema = graph([
    blogListing(posts.map((post) => ({ slug: post.slug, title: post.title, date: post.date }))),
    breadcrumbs([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
    ]),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Blog</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Working notes on search, performance and developer tooling — written when something turned
          out to be more interesting than expected.
        </p>
      </header>

      {tags.length > 0 && (
        <nav aria-label="Topics" className="mt-6 flex flex-wrap gap-2">
          {tags.map((entry) => (
            <Link
              key={entry.slug}
              href={`/blog/tag/${entry.slug}`}
              className="rounded-full bg-surface-muted px-3 py-1 text-sm font-medium text-muted transition hover:text-foreground"
            >
              {entry.tag}
              <span className="ml-1.5 opacity-60">{entry.count}</span>
            </Link>
          ))}
        </nav>
      )}

      {posts.length === 0 ? (
        <p className="mt-10 rounded-xl border border-border bg-surface-muted p-6 text-sm text-muted">
          No posts yet. Add a markdown file to <code className="font-mono">content/blog/</code> and
          it will appear here.
        </p>
      ) : (
        <div className="mt-8 grid gap-4">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}

      <JsonLd json={schema} />
    </div>
  );
}
