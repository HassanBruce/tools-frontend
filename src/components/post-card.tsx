import Link from "next/link";
import { formatPostDate, tagSlug, type Post } from "@/lib/posts";

/**
 * One post in a listing. Shared by the blog index and the tag archives so both
 * stay identical — and so tags remain clickable in every context.
 */
export function PostCard({ post }: { post: Post }) {
  return (
    <article className="group relative rounded-xl border border-border bg-surface p-5 transition hover:border-accent hover:shadow-sm">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        <time dateTime={post.date}>{formatPostDate(post.date)}</time>
        <span aria-hidden>·</span>
        <span>{post.readingMinutes} min read</span>
      </div>

      <h2 className="mt-2 text-xl font-semibold tracking-tight transition group-hover:text-accent">
        <Link href={`/blog/${post.slug}`}>
          {post.title}
          {/* Stretches the link across the card without nesting anchors. */}
          <span className="absolute inset-0" aria-hidden />
        </Link>
      </h2>

      <p className="mt-2 text-muted">{post.description}</p>

      {post.tags.length > 0 && (
        // Sits above the stretched link so individual tags stay clickable.
        <div className="relative z-10 mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog/tag/${tagSlug(tag)}`}
              className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent transition hover:opacity-80"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
