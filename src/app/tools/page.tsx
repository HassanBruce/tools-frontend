import { ToolSearch } from "@/components/tool-search";
import { JsonLd } from "@/components/json-ld";
import { TOOL_COUNT } from "@/lib/tools";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbs, graph, toolCollection } from "@/lib/schema";

export const metadata = pageMetadata({
  title: `All ${TOOL_COUNT} Tools`,
  description:
    "Browse every developer and SEO tool — formatters, converters, generators, image batch processing and content analysis. All free, all in your browser.",
  path: "/tools",
});

export default function ToolsIndexPage() {
  const schema = graph([
    toolCollection(),
    breadcrumbs([
      { name: "Home", path: "/" },
      { name: "Tools", path: "/tools" },
    ]),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">All tools</h1>
        <p className="mt-2 max-w-2xl text-muted">
          {TOOL_COUNT} tools, every one running locally in your browser. Nothing is uploaded.
        </p>
      </header>
      <ToolSearch />
      <JsonLd json={schema} />
    </div>
  );
}
