/**
 * JSON-LD builders.
 *
 * Emitted as a single `@graph` per page rather than several script tags — one
 * document is easier for crawlers to relate, and lets nodes reference each
 * other by `@id`.
 */

import { SITE_NAME, SITE_URL } from "@/lib/metadata";
import { CATEGORIES, TOOLS, type Tool } from "@/lib/tools";

type Node = Record<string, unknown>;

export function graph(nodes: Node[]): string {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": nodes });
}

const WEBSITE_ID = `${SITE_URL}/#website`;
const ORGANISATION_ID = `${SITE_URL}/#organisation`;

export function organisation(): Node {
  return {
    "@type": "Organization",
    "@id": ORGANISATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
  };
}

export function website(): Node {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { "@id": ORGANISATION_ID },
    inLanguage: "en",
  };
}

export function breadcrumbs(trail: { name: string; path: string }[]): Node {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: `${SITE_URL}${entry.path}`,
    })),
  };
}

/**
 * Tool pages are web applications, not articles. `offers` with a zero price is
 * what makes the "Free" annotation eligible in results.
 */
export function softwareApplication(tool: Tool): Node {
  return {
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/tools/${tool.slug}/#app`,
    name: tool.name,
    url: `${SITE_URL}/tools/${tool.slug}`,
    description: tool.description,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any — runs in a web browser",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@id": ORGANISATION_ID },
    featureList: CATEGORIES[tool.category].label,
  };
}

export function faqPage(faq: { q: string; a: string }[]): Node {
  return {
    "@type": "FAQPage",
    mainEntity: faq.map((entry) => ({
      "@type": "Question",
      name: entry.q,
      acceptedAnswer: { "@type": "Answer", text: entry.a },
    })),
  };
}

/** A single blog post. */
export function blogPosting(post: {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
}): Node {
  const url = `${SITE_URL}/blog/${post.slug}`;

  return {
    "@type": "BlogPosting",
    "@id": `${url}/#post`,
    headline: post.title,
    description: post.description,
    url,
    datePublished: post.date || undefined,
    dateModified: post.date || undefined,
    author: { "@type": "Person", name: post.author },
    publisher: { "@id": ORGANISATION_ID },
    keywords: post.tags.join(", "),
    isPartOf: { "@id": WEBSITE_ID },
    mainEntityOfPage: url,
  };
}

/** The blog index: a Blog node listing its posts. */
export function blogListing(posts: { slug: string; title: string; date: string }[]): Node {
  return {
    "@type": "Blog",
    "@id": `${SITE_URL}/blog/#blog`,
    url: `${SITE_URL}/blog`,
    name: `${SITE_NAME} blog`,
    publisher: { "@id": ORGANISATION_ID },
    isPartOf: { "@id": WEBSITE_ID },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${SITE_URL}/blog/${post.slug}`,
      datePublished: post.date || undefined,
    })),
  };
}

/** The tools index: a collection page listing every tool. */
export function toolCollection(): Node {
  return {
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/tools/#collection`,
    url: `${SITE_URL}/tools`,
    name: `All ${TOOLS.length} tools`,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: TOOLS.length,
      itemListElement: TOOLS.map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: tool.name,
        url: `${SITE_URL}/tools/${tool.slug}`,
      })),
    },
  };
}
