import { OG_CONTENT_TYPE, OG_SIZE, contentPageOgImage } from "@/lib/og";
import { getAllContentPages, getContentPage } from "@/lib/pages";
import { SITE_NAME } from "@/lib/metadata";

/** Cards for the standalone pages — privacy, terms, about, contact. */
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return getAllContentPages().map((page) => ({ slug: page.slug }));
}

export async function generateImageMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const page = getContentPage(slug);

  return [
    {
      id: "card",
      alt: page ? `${page.title} — ${SITE_NAME}` : SITE_NAME,
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ];
}

export default async function Image(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  return contentPageOgImage(slug);
}
