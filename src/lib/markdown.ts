import { marked } from "marked";
import { imageSizeForPublicPath } from "@/lib/image-size";

/**
 * Stamp width, height and loading hints onto every local image.
 *
 * Markdown produces a bare `<img src alt>`. With no dimensions the browser
 * cannot reserve space, so text below the image jumps as it loads — that is
 * Cumulative Layout Shift, and Google uses it as a ranking signal.
 *
 * Adding the intrinsic width/height lets the browser compute the aspect ratio
 * immediately and hold the space. The `.prose img` rule keeps `max-width:100%`
 * and `height:auto`, so the image still scales responsively.
 *
 * Remote images are left alone — their size cannot be known at build time.
 */
function annotateImages(html: string): string {
  return html.replace(/<img\s+([^>]*?)\/?>/g, (tag, attrs: string) => {
    // Never override dimensions an author set deliberately.
    if (/\bwidth\s*=/.test(attrs) || /\bheight\s*=/.test(attrs)) return tag;

    const src = /\bsrc\s*=\s*"([^"]*)"/.exec(attrs)?.[1];
    if (!src) return tag;

    const size = imageSizeForPublicPath(src);
    const dimensions = size ? ` width="${size.width}" height="${size.height}"` : "";

    // Content images sit below the fold in a post, so lazy loading is safe and
    // keeps them off the critical path.
    const loading = /\bloading\s*=/.test(attrs) ? "" : ' loading="lazy" decoding="async"';

    return `<img ${attrs.trim()}${dimensions}${loading} />`;
  });
}

/**
 * Render trusted, first-party markdown to HTML at build time.
 *
 * This is for content *you* author — tool sections and blog posts committed to
 * the repo — so the output is not sanitised and raw HTML in the source is
 * passed through deliberately. Never point this at anything a visitor supplies;
 * the Markdown tool's live preview uses `sanitizeHtml` for exactly that reason.
 */
export function renderMarkdown(source: string): string {
  const html = marked.parse(source.trim(), { gfm: true, breaks: false, async: false });
  return typeof html === "string" ? annotateImages(html) : "";
}

/** Strip markdown down to plain text — used for excerpts and meta descriptions. */
export function markdownToPlainText(source: string, limit = 0): string {
  const text = source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (limit <= 0 || text.length <= limit) return text;

  // Cut on a word boundary rather than mid-word.
  const clipped = text.slice(0, limit);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${(lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`;
}

/** Rough reading time, at the 238 wpm used elsewhere on the site. */
export function readingMinutes(source: string): number {
  const words = markdownToPlainText(source).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 238));
}
