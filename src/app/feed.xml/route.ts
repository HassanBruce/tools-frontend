import { SITE_NAME, SITE_URL } from "@/lib/metadata";
import { getAllPosts } from "@/lib/posts";
import { renderMarkdown } from "@/lib/markdown";

/**
 * RSS 2.0 feed at /feed.xml.
 *
 * Built at request time from the same markdown as the blog, so a new post
 * appears here automatically. `force-static` means it is generated once at
 * build and served as a static file.
 */
export const dynamic = "force-static";

/** XML has five predefined entities; everything else must be escaped by hand. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Make relative links absolute — a feed reader has no base URL to resolve against. */
function absolutise(html: string): string {
  return html
    .replace(/href="\/([^"]*)"/g, `href="${SITE_URL}/$1"`)
    .replace(/src="\/([^"]*)"/g, `src="${SITE_URL}/$1"`);
}

export async function GET() {
  const posts = getAllPosts();
  const updated = posts[0]?.date ? new Date(posts[0].date) : new Date();

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`;
      const published = post.date ? new Date(post.date).toUTCString() : "";

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.description)}</description>
      ${published ? `<pubDate>${published}</pubDate>` : ""}
      <author>${escapeXml(post.author)}</author>
${post.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join("\n")}
      <content:encoded><![CDATA[${absolutise(renderMarkdown(post.body))}]]></content:encoded>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(SITE_NAME)} Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Working notes on search, performance and developer tooling.</description>
    <language>en</language>
    <lastBuildDate>${updated.toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
