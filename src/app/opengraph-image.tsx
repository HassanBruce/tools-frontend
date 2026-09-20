import { siteOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { TOOL_COUNT } from "@/lib/tools";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Free developer and SEO tools that run in your browser";

export default function Image() {
  return siteOgImage(
    `${TOOL_COUNT} tools that run in your browser`,
    "Format, convert, generate and analyse — instantly. Your data never leaves your device.",
  );
}
