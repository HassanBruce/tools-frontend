import { OG_CONTENT_TYPE, OG_SIZE, toolOgImage } from "@/lib/og";
import { TOOLS, getTool } from "@/lib/tools";
import { SITE_NAME } from "@/lib/metadata";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** Prerender one card per tool at build time, matching the page route. */
export function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }));
}

/**
 * `alt` cannot be a function, so per-tool alt text comes from
 * generateImageMetadata instead of a static export.
 */
export async function generateImageMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const tool = getTool(slug);

  return [
    {
      id: "card",
      alt: tool ? `${tool.name} — free online tool` : `${SITE_NAME} — free browser tools`,
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ];
}

export default async function Image(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  return toolOgImage(slug);
}
