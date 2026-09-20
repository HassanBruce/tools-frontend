import { getAllPosts, type Post } from "@/lib/posts";
import { TOOLS, getTool, type Tool } from "@/lib/tools";

/**
 * Two-way links between blog posts and tools, derived from the markdown itself.
 *
 * Nothing here is configured by hand. When a post links to `/tools/json-formatter`,
 * that tool's page automatically starts listing the post — so the connection
 * between the two halves of the site maintains itself as you write, and cannot
 * drift out of sync the way a manual list would.
 *
 * Server-only: reads the blog folder from disk.
 */

/** Matches a markdown link or bare reference to a tool page. */
const TOOL_LINK = /\/tools\/([a-z0-9-]+)/g;

/** Tools referenced by a post, in the order they first appear. */
export function toolsInPost(post: Post): Tool[] {
  const seen = new Set<string>();
  const found: Tool[] = [];

  for (const match of post.body.matchAll(TOOL_LINK)) {
    const slug = match[1];
    if (seen.has(slug)) continue;
    seen.add(slug);

    const tool = getTool(slug);
    // Ignore links to slugs that no longer exist rather than rendering a dead card.
    if (tool) found.push(tool);
  }

  return found;
}

/** Posts that reference a given tool, newest first. */
export function postsForTool(slug: string, limit = 3): Post[] {
  return getAllPosts()
    .filter((post) => toolsInPost(post).some((tool) => tool.slug === slug))
    .slice(0, limit);
}

/**
 * Coverage report — which tools have been written about and which have not.
 * Handy when planning what to write next; not rendered anywhere.
 */
export function toolCoverage(): { covered: string[]; uncovered: string[] } {
  const posts = getAllPosts();
  const linked = new Set(posts.flatMap((post) => toolsInPost(post).map((tool) => tool.slug)));

  return {
    covered: TOOLS.filter((tool) => linked.has(tool.slug)).map((tool) => tool.slug),
    uncovered: TOOLS.filter((tool) => !linked.has(tool.slug)).map((tool) => tool.slug),
  };
}
