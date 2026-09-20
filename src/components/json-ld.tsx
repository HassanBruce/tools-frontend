/**
 * Renders a JSON-LD document. Server-only, so the markup is present in the
 * initial HTML where crawlers will actually see it.
 */
export function JsonLd({ json }: { json: string }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
