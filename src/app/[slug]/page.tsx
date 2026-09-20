import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata } from "@/lib/metadata";
import { renderMarkdown } from "@/lib/markdown";
import { getAllContentPages, getContentPage } from "@/lib/pages";
import { breadcrumbs, graph } from "@/lib/schema";

/**
 * Standalone pages from `content/pages/*.md` — privacy, terms, about, contact.
 *
 * This is a root-level dynamic segment, but static routes always win in Next's
 * matcher, so `/tools` and `/blog` are unaffected. `dynamicParams = false`
 * means only the markdown files that exist resolve; anything else is a 404.
 */
export function generateStaticParams() {
  return getAllContentPages().map((page) => ({ slug: page.slug }));
}

export const dynamicParams = false;

export async function generateMetadata(props: PageProps<"/[slug]">) {
  const { slug } = await props.params;
  const page = getContentPage(slug);
  if (!page) return {};

  return pageMetadata({
    title: page.title,
    description: page.description,
    path: `/${page.slug}`,
  });
}

export default async function ContentPageRoute(props: PageProps<"/[slug]">) {
  const { slug } = await props.params;
  const page = getContentPage(slug);
  if (!page) notFound();

  const schema = graph([
    breadcrumbs([
      { name: "Home", path: "/" },
      { name: page.title, path: `/${page.slug}` },
    ]),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted"
      >
        <Link href="/" className="transition hover:text-foreground">
          Home
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">{page.title}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{page.title}</h1>
        {page.updated && (
          <p className="mt-2 text-sm text-muted">Last updated: {page.updated}</p>
        )}
      </header>

      <div
        className="prose"
        // First-party markdown from content/pages, rendered at build time.
        dangerouslySetInnerHTML={{ __html: renderMarkdown(page.body) }}
      />

      <JsonLd json={schema} />
    </div>
  );
}
