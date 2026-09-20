import { OG_CONTENT_TYPE, OG_SIZE, tagOgImage } from "@/lib/og";
import { getAllTags } from "@/lib/posts";
import { SITE_NAME } from "@/lib/metadata";

/**
 * Tag archives need their own card: the opengraph-image convention applies to
 * the segment it sits in and does NOT cascade down from /blog, so without this
 * every topic page shares as a bare link.
 */
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return getAllTags().map((entry) => ({ tag: entry.slug }));
}

export async function generateImageMetadata(props: { params: Promise<{ tag: string }> }) {
  const { tag } = await props.params;
  const entry = getAllTags().find((item) => item.slug === tag);

  return [
    {
      id: "card",
      alt: entry ? `Articles tagged ${entry.tag}` : `${SITE_NAME} blog topics`,
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ];
}

export default async function Image(props: { params: Promise<{ tag: string }> }) {
  const { tag } = await props.params;
  return tagOgImage(tag);
}
