import type { Metadata } from "next";
import { getTool } from "@/lib/tools";

/** Change this once you have a domain — it makes canonical and OG URLs absolute. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const SITE_NAME = "Toolkit";

/**
 * Metadata for a non-tool page (homepage, tools index).
 *
 * `openGraph.images` is deliberately omitted: an `opengraph-image.tsx` next to
 * the route generates the card and Next injects og:image, its dimensions and
 * twitter:image automatically. Setting it here would override that.
 */
export function pageMetadata({
  title,
  description,
  path = "",
}: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  const url = `${SITE_URL}${path}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/**
 * Builds the metadata block for a tool page from the registry, so titles,
 * descriptions, canonicals and OG tags stay in sync with `src/lib/tools.ts`.
 */
export function toolMetadata(slug: string): Metadata {
  const tool = getTool(slug);
  if (!tool) return {};

  const url = `${SITE_URL}/tools/${tool.slug}`;
  const title = `${tool.name} — Free Online Tool`;

  return {
    title,
    description: tool.description,
    keywords: tool.keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: tool.description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: tool.description,
    },
  };
}
