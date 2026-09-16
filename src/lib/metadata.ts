import type { Metadata } from "next";
import { getTool } from "@/lib/tools";

/** Change this once you have a domain — it makes canonical and OG URLs absolute. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const SITE_NAME = "Toolkit";

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
