import { notFound } from "next/navigation";
import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import { ToolMount } from "@/components/tool-mount";
import { TOOLS, getTool } from "@/lib/tools";

/**
 * One route for every tool. `generateStaticParams` prerenders all of them at
 * build time, so each URL is still a static HTML file — identical output to the
 * folder-per-tool layout this replaced, without the boilerplate.
 */
export function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }));
}

/** Any slug not in the registry is a 404 rather than an on-demand render. */
export const dynamicParams = false;

export async function generateMetadata(props: PageProps<"/tools/[slug]">) {
  const { slug } = await props.params;
  return toolMetadata(slug);
}

export default async function Page(props: PageProps<"/tools/[slug]">) {
  const { slug } = await props.params;

  const tool = getTool(slug);

  // A registry entry with no component (or vice versa) is a wiring mistake,
  // not a missing page — but 404 is still the right response.
  if (!tool) notFound();

  return (
    <ToolPage slug={slug}>
      <ToolMount slug={slug} />
    </ToolPage>
  );
}
