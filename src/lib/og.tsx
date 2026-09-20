import { ImageResponse } from "next/og";
import { CATEGORIES, getTool } from "@/lib/tools";
import { getPost, getAllTags, getPostsByTag } from "@/lib/posts";
import { getContentPage } from "@/lib/pages";
import { SITE_NAME } from "@/lib/metadata";

/**
 * Shared Open Graph card renderer.
 *
 * Rendered by Satori, which supports flexbox and a subset of CSS — no grid, and
 * every element with more than one child needs an explicit `display: flex`.
 * Styles must be inline; Tailwind classes do not apply here.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const COLORS = {
  background: "#09090b",
  panel: "#111113",
  border: "#27272a",
  foreground: "#fafafa",
  muted: "#a1a1aa",
  accent: "#818cf8",
};

function Card({
  eyebrow,
  title,
  subtitle,
  footnote,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  footnote: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: COLORS.background,
        padding: "64px 72px",
        // A subtle accent wash so the card is not a flat rectangle.
        backgroundImage: `radial-gradient(circle at 85% 15%, ${COLORS.accent}22 0%, transparent 55%)`,
      }}
    >
      {/* Brand row */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: COLORS.accent,
            color: COLORS.background,
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          T
        </div>
        <div
          style={{
            marginLeft: 16,
            fontSize: 28,
            fontWeight: 600,
            color: COLORS.foreground,
          }}
        >
          {SITE_NAME}
        </div>
      </div>

      {/* Main copy */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: COLORS.accent,
            marginBottom: 18,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            fontSize: title.length > 34 ? 60 : 72,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: -1.5,
            color: COLORS.foreground,
            marginBottom: 20,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 30,
            lineHeight: 1.4,
            color: COLORS.muted,
            // Satori has no line-clamp; keep taglines short in the registry.
            maxWidth: 940,
          }}
        >
          {subtitle}
        </div>
      </div>

      {/* Footer strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderTop: `1px solid ${COLORS.border}`,
          paddingTop: 24,
          fontSize: 24,
          color: COLORS.muted,
        }}
      >
        {footnote}
      </div>
    </div>
  );
}

/** OG card for a single tool page. */
export function toolOgImage(slug: string) {
  const tool = getTool(slug);

  if (!tool) {
    return new ImageResponse(
      (
        <Card
          eyebrow={SITE_NAME}
          title="Free browser tools"
          subtitle="Formatters, converters and generators that run entirely on your device."
          footnote="No uploads · No sign-up · Completely free"
        />
      ),
      OG_SIZE,
    );
  }

  return new ImageResponse(
    (
      <Card
        eyebrow={CATEGORIES[tool.category].label}
        title={tool.name}
        subtitle={tool.tagline}
        footnote="Runs in your browser · Nothing is uploaded · Free"
      />
    ),
    OG_SIZE,
  );
}

/** OG card for a blog post. */
export function postOgImage(slug: string) {
  const post = getPost(slug);

  return new ImageResponse(
    (
      <Card
        eyebrow={post?.tags[0] ?? "Article"}
        title={post?.title ?? `${SITE_NAME} blog`}
        subtitle={post?.description ?? "Notes on search, performance and developer tooling."}
        footnote={post ? `${post.author} · ${post.readingMinutes} min read` : SITE_NAME}
      />
    ),
    OG_SIZE,
  );
}

/** OG card for a tag archive. */
export function tagOgImage(slug: string) {
  const entry = getAllTags().find((tag) => tag.slug === slug);
  const count = entry ? getPostsByTag(slug).length : 0;

  return new ImageResponse(
    (
      <Card
        eyebrow="Topic"
        title={entry ? entry.tag : "Articles"}
        subtitle={
          entry
            ? `${count} article${count === 1 ? "" : "s"} on ${entry.tag}.`
            : "Browse articles by topic."
        }
        footnote={`${SITE_NAME} — notes on search, performance and developer tooling`}
      />
    ),
    OG_SIZE,
  );
}

/** OG card for a standalone content page (privacy, terms, about, contact). */
export function contentPageOgImage(slug: string) {
  const page = getContentPage(slug);

  return new ImageResponse(
    (
      <Card
        eyebrow={SITE_NAME}
        title={page ? page.title : SITE_NAME}
        subtitle={page ? page.description : "Free browser-based developer and SEO tools."}
        footnote="No accounts · No uploads · No tracking"
      />
    ),
    OG_SIZE,
  );
}

/** OG card for the homepage and the tools index. */
export function siteOgImage(title: string, subtitle: string) {
  return new ImageResponse(
    (
      <Card
        eyebrow={SITE_NAME}
        title={title}
        subtitle={subtitle}
        footnote="No accounts · No uploads · No tracking"
      />
    ),
    OG_SIZE,
  );
}
