import { OG_CONTENT_TYPE, OG_SIZE, postOgImage } from "@/lib/og";
import { getAllPosts, getPost } from "@/lib/posts";
import { SITE_NAME } from "@/lib/metadata";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

/** `alt` cannot be a function, so per-post alt text comes from here. */
export async function generateImageMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const post = getPost(slug);

  return [
    {
      id: "card",
      alt: post ? post.title : `${SITE_NAME} blog`,
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ];
}

export default async function Image(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  return postOgImage(slug);
}
