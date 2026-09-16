import type { Metadata } from "next";
import { ToolSearch } from "@/components/tool-search";
import { TOOL_COUNT } from "@/lib/tools";
import { SITE_URL } from "@/lib/metadata";

export const metadata: Metadata = {
  title: `All ${TOOL_COUNT} Tools`,
  description:
    "Browse every developer and SEO tool — formatters, converters, generators, image batch processing and content analysis. All free, all in your browser.",
  alternates: { canonical: `${SITE_URL}/tools` },
};

export default function ToolsIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">All tools</h1>
        <p className="mt-2 max-w-2xl text-muted">
          {TOOL_COUNT} tools, every one running locally in your browser. Nothing is uploaded.
        </p>
      </header>
      <ToolSearch />
    </div>
  );
}
