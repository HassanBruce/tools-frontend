"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * Maps a tool slug to its interactive component, and renders the right one.
 *
 * The `"use client"` at the top of this file is load-bearing, not incidental.
 * Next only code-splits `next/dynamic` imports when they are made from a Client
 * Component; doing the same thing from the Server Component in
 * `app/tools/[slug]/page.tsx` bundles every tool into one shared chunk and
 * roughly doubles the JavaScript on every page (measured: 607 KB -> 1343 KB
 * average). Keep this boundary here.
 *
 * Add a tool to the registry in `lib/tools.ts` and add its entry below.
 */
const TOOL_CLIENTS: Record<string, ComponentType> = {
  "json-formatter": dynamic(() => import("@/tools/json-formatter")),
  "json-csv-converter": dynamic(() => import("@/tools/json-csv-converter")),
  "yaml-json-converter": dynamic(() => import("@/tools/yaml-json-converter")),
  "xml-formatter": dynamic(() => import("@/tools/xml-formatter")),
  "base64-encoder": dynamic(() => import("@/tools/base64-encoder")),
  "url-encoder": dynamic(() => import("@/tools/url-encoder")),
  "jwt-decoder": dynamic(() => import("@/tools/jwt-decoder")),
  "uuid-generator": dynamic(() => import("@/tools/uuid-generator")),
  "regex-tester": dynamic(() => import("@/tools/regex-tester")),
  "cron-expression-generator": dynamic(() => import("@/tools/cron-expression-generator")),
  "unix-timestamp-converter": dynamic(() => import("@/tools/unix-timestamp-converter")),
  "sql-formatter": dynamic(() => import("@/tools/sql-formatter")),
  "html-formatter": dynamic(() => import("@/tools/html-formatter")),
  "css-js-minifier": dynamic(() => import("@/tools/css-js-minifier")),
  "markdown-html-converter": dynamic(() => import("@/tools/markdown-html-converter")),
  "env-file-generator": dynamic(() => import("@/tools/env-file-generator")),
  "color-converter": dynamic(() => import("@/tools/color-converter")),
  "hash-generator": dynamic(() => import("@/tools/hash-generator")),
  "qr-code-generator": dynamic(() => import("@/tools/qr-code-generator")),
  "password-generator": dynamic(() => import("@/tools/password-generator")),
  "diff-checker": dynamic(() => import("@/tools/diff-checker")),
  "lorem-ipsum-generator": dynamic(() => import("@/tools/lorem-ipsum-generator")),
  "text-case-converter": dynamic(() => import("@/tools/text-case-converter")),
  "meta-tag-generator": dynamic(() => import("@/tools/meta-tag-generator")),
  "open-graph-generator": dynamic(() => import("@/tools/open-graph-generator")),
  "schema-markup-generator": dynamic(() => import("@/tools/schema-markup-generator")),
  "robots-txt-generator": dynamic(() => import("@/tools/robots-txt-generator")),
  "utm-link-builder": dynamic(() => import("@/tools/utm-link-builder")),
  "keyword-density-checker": dynamic(() => import("@/tools/keyword-density-checker")),
  "readability-checker": dynamic(() => import("@/tools/readability-checker")),
  "word-counter": dynamic(() => import("@/tools/word-counter")),
  "hashtag-generator": dynamic(() => import("@/tools/hashtag-generator")),
  "slug-generator": dynamic(() => import("@/tools/slug-generator")),
  "image-compressor": dynamic(() => import("@/tools/image-compressor")),
  "image-converter": dynamic(() => import("@/tools/image-converter")),
  "favicon-generator": dynamic(() => import("@/tools/favicon-generator")),
  "bulk-qr-generator": dynamic(() => import("@/tools/bulk-qr-generator")),
};

export function ToolMount({ slug }: { slug: string }) {
  const Client = TOOL_CLIENTS[slug];
  return Client ? <Client /> : null;
}
