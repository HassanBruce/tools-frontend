import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { markdownToPlainText } from "@/lib/markdown";

/**
 * Standalone content pages — privacy, terms, about, contact.
 *
 * Markdown files in `content/pages/`, read at build time. Server-only.
 * Add a `.md` file there and it becomes a page at `/<filename>`.
 */

export interface ContentPage {
  slug: string;
  title: string;
  description: string;
  /** Shown as "Last updated" where present. */
  updated: string;
  body: string;
}

const PAGES_DIR = join(process.cwd(), "content", "pages");

function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) return { data: {}, body: raw };

  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) data[key] = value;
  }

  return { data, body: match[2] };
}

function toPage(filename: string): ContentPage | null {
  const raw = readFileSync(join(PAGES_DIR, filename), "utf8");
  const { data, body } = parseFrontmatter(raw);
  if (!data.title) return null;

  return {
    slug: filename.replace(/\.md$/, ""),
    title: data.title,
    description: data.description || markdownToPlainText(body, 155),
    updated: data.updated || "",
    body,
  };
}

export function getAllContentPages(): ContentPage[] {
  if (!existsSync(PAGES_DIR)) return [];

  return readdirSync(PAGES_DIR)
    .filter((name) => name.endsWith(".md"))
    .map(toPage)
    .filter((page): page is ContentPage => page !== null)
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export function getContentPage(slug: string): ContentPage | undefined {
  const file = `${slug}.md`;
  if (!existsSync(join(PAGES_DIR, file))) return undefined;
  return toPage(file) ?? undefined;
}
