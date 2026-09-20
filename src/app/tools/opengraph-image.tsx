import { siteOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { TOOL_COUNT } from "@/lib/tools";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Browse every free developer and SEO tool";

export default function Image() {
  return siteOgImage(
    "All tools",
    `Browse ${TOOL_COUNT} developer, SEO and bulk image tools — every one running locally in your browser.`,
  );
}
