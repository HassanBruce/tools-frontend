import { OG_CONTENT_TYPE, OG_SIZE, siteOgImage } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Toolkit blog — notes on SEO, performance and developer tooling";

export default function Image() {
  return siteOgImage(
    "Blog",
    "Working notes on search, performance and developer tooling.",
  );
}
