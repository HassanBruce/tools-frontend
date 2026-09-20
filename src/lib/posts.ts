import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { markdownToPlainText, readingMinutes } from "@/lib/markdown";

/**
 * Blog posts are markdown files in `content/blog/`, read at build time.
 *
 * Server-only — this module touches the filesystem, so never import it from a
 * Client Component. Add a post by dropping a new `.md` file in that folder;
 * nothing here needs editing.
 */

export interface Post {
  slug: string;
  title: string;
  description: string;
  /** ISO date, e.g. 2026-09-12 */
  date: string;
  author: string;
  tags: string[];
  /** Raw markdown body, without the frontmatter block. */
  body: string;
  readingMinutes: number;
}

const POSTS_DIR = join(process.cwd(), "content", "blog");

/**
 * Minimal frontmatter parser: a leading `---` block of `key: value` lines.
 * Deliberately not a YAML implementation — posts only need strings and a
 * comma-separated tag list, and this avoids a dependency for that.
 */
function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) return { data: {}, body: raw };

  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    // Strip surrounding quotes if the author used them.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) data[key] = value;
  }

  return { data, body: match[2] };
}

function toPost(filename: string): Post | null {
  const raw = readFileSync(join(POSTS_DIR, filename), "utf8");
  const { data, body } = parseFrontmatter(raw);

  const slug = filename.replace(/\.md$/, "");
  if (!data.title) return null; // a file without a title is a draft, skip it

  return {
    slug,
    title: data.title,
    description: data.description || markdownToPlainText(body, 155),
    date: data.date || "",
    author: data.author || "Toolkit",
    tags: (data.tags || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    body,
    readingMinutes: readingMinutes(body),
  };
}

/** Newest first. */
export function getAllPosts(): Post[] {
  if (!existsSync(POSTS_DIR)) return [];

  return readdirSync(POSTS_DIR)
    .filter((name) => name.endsWith(".md"))
    .map(toPost)
    .filter((post): post is Post => post !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string): Post | undefined {
  const file = `${slug}.md`;
  if (!existsSync(join(POSTS_DIR, file))) return undefined;
  return toPost(file) ?? undefined;
}

export function formatPostDate(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** URL-safe form of a tag: "meta tags" -> "meta-tags". */
export function tagSlug(tag: string): string {
  return tag.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Every tag in use, with its post count, most-used first. */
export function getAllTags(): { tag: string; slug: string; count: number }[] {
  const counts = new Map<string, { tag: string; count: number }>();

  for (const post of getAllPosts()) {
    for (const tag of post.tags) {
      const slug = tagSlug(tag);
      const existing = counts.get(slug);
      // Keep the first spelling seen so display casing stays stable.
      counts.set(slug, { tag: existing?.tag ?? tag, count: (existing?.count ?? 0) + 1 });
    }
  }

  return [...counts.entries()]
    .map(([slug, value]) => ({ slug, tag: value.tag, count: value.count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function getPostsByTag(slug: string): Post[] {
  return getAllPosts().filter((post) => post.tags.some((tag) => tagSlug(tag) === slug));
}

/** Other posts sharing a tag, falling back to the most recent. */
export function relatedPosts(slug: string, limit = 3): Post[] {
  const all = getAllPosts();
  const current = all.find((post) => post.slug === slug);
  if (!current) return all.slice(0, limit);

  const scored = all
    .filter((post) => post.slug !== slug)
    .map((post) => ({
      post,
      shared: post.tags.filter((tag) => current.tags.includes(tag)).length,
    }))
    .sort((a, b) => b.shared - a.shared || b.post.date.localeCompare(a.post.date));

  return scored.slice(0, limit).map((entry) => entry.post);
}
