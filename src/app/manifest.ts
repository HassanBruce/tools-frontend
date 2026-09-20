import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/metadata";
import { TOOL_COUNT } from "@/lib/tools";

/** Web app manifest — lets the site be installed and fixes Android icons. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — ${TOOL_COUNT} Free Developer & SEO Tools`,
    short_name: SITE_NAME,
    description:
      "Free developer and SEO tools that run entirely in your browser. No accounts, no uploads, no tracking.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#4f46e5",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
