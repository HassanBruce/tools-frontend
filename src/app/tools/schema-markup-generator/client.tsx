"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Field,
  Note,
  OutputPanel,
  Panel,
  Segmented,
  TextInput,
  Toolbar,
} from "@/components/ui";

type SchemaType = "Article" | "Product" | "FAQPage" | "LocalBusiness" | "Event" | "BreadcrumbList";

type FieldSpec = { key: string; label: string; required?: boolean; hint?: string };

const SPECS: Record<SchemaType, FieldSpec[]> = {
  Article: [
    { key: "headline", label: "Headline", required: true },
    { key: "author", label: "Author name", required: true },
    { key: "datePublished", label: "Published date", required: true, hint: "YYYY-MM-DD" },
    { key: "dateModified", label: "Modified date", hint: "YYYY-MM-DD" },
    { key: "image", label: "Image URL" },
    { key: "publisher", label: "Publisher name" },
    { key: "description", label: "Description" },
  ],
  Product: [
    { key: "name", label: "Product name", required: true },
    { key: "image", label: "Image URL", required: true },
    { key: "description", label: "Description" },
    { key: "brand", label: "Brand" },
    { key: "sku", label: "SKU" },
    { key: "price", label: "Price", required: true, hint: "Numbers only, e.g. 29.99" },
    { key: "priceCurrency", label: "Currency", required: true, hint: "GBP, USD, EUR" },
    { key: "availability", label: "Availability", hint: "InStock, OutOfStock, PreOrder" },
    { key: "ratingValue", label: "Rating value", hint: "1–5" },
    { key: "reviewCount", label: "Review count" },
  ],
  LocalBusiness: [
    { key: "name", label: "Business name", required: true },
    { key: "streetAddress", label: "Street address", required: true },
    { key: "addressLocality", label: "Town or city", required: true },
    { key: "postalCode", label: "Postcode", required: true },
    { key: "addressCountry", label: "Country code", required: true, hint: "GB, US, DE" },
    { key: "telephone", label: "Telephone" },
    { key: "url", label: "Website URL" },
    { key: "priceRange", label: "Price range", hint: "£, ££, £££" },
    { key: "openingHours", label: "Opening hours", hint: "Mo-Fr 09:00-17:00" },
  ],
  Event: [
    { key: "name", label: "Event name", required: true },
    { key: "startDate", label: "Start", required: true, hint: "2026-06-01T19:00" },
    { key: "endDate", label: "End", hint: "2026-06-01T22:00" },
    { key: "locationName", label: "Venue name", required: true },
    { key: "streetAddress", label: "Venue address" },
    { key: "addressLocality", label: "Town or city" },
    { key: "url", label: "Event URL" },
    { key: "price", label: "Ticket price" },
    { key: "priceCurrency", label: "Currency", hint: "GBP" },
  ],
  FAQPage: [],
  BreadcrumbList: [],
};

interface Pair {
  id: number;
  a: string;
  b: string;
}

let nextId = 1;
const makePair = (a = "", b = ""): Pair => ({ id: nextId++, a, b });

function clean(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

/** Drop undefined values so the JSON-LD has no empty keys. */
function prune<T extends Record<string, unknown>>(input: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null || value === "") continue;
    if (typeof value === "object" && !Array.isArray(value)) {
      const nested = prune(value as Record<string, unknown>);
      if (Object.keys(nested).length > 0) out[key] = nested;
      continue;
    }
    out[key] = value;
  }
  return out;
}

export default function Client() {
  const [type, setType] = useState<SchemaType>("Article");
  const [values, setValues] = useState<Record<string, string>>({
    headline: "How to format JSON in your browser",
    author: "Ada Lovelace",
    datePublished: "2026-01-15",
    publisher: "Toolkit",
  });

  const [faqs, setFaqs] = useState<Pair[]>([
    makePair("Is this tool free?", "Yes, completely free with no sign-up required."),
    makePair("Is my data uploaded?", "No, everything runs in your browser."),
  ]);
  const [crumbs, setCrumbs] = useState<Pair[]>([
    makePair("Home", "https://example.com"),
    makePair("Tools", "https://example.com/tools"),
  ]);

  const set = (key: string, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const schema = useMemo(() => {
    const get = (key: string) => clean(values[key] ?? "");

    switch (type) {
      case "FAQPage":
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs
            .filter((pair) => pair.a.trim() && pair.b.trim())
            .map((pair) => ({
              "@type": "Question",
              name: pair.a.trim(),
              acceptedAnswer: { "@type": "Answer", text: pair.b.trim() },
            })),
        };

      case "BreadcrumbList":
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: crumbs
            .filter((pair) => pair.a.trim())
            .map((pair, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: pair.a.trim(),
              item: clean(pair.b),
            })),
        };

      case "Product":
        return prune({
          "@context": "https://schema.org",
          "@type": "Product",
          name: get("name"),
          image: get("image"),
          description: get("description"),
          sku: get("sku"),
          brand: get("brand") ? { "@type": "Brand", name: get("brand") } : undefined,
          offers: {
            "@type": "Offer",
            price: get("price"),
            priceCurrency: get("priceCurrency"),
            availability: get("availability")
              ? `https://schema.org/${get("availability")}`
              : undefined,
          },
          aggregateRating:
            get("ratingValue") && get("reviewCount")
              ? {
                  "@type": "AggregateRating",
                  ratingValue: get("ratingValue"),
                  reviewCount: get("reviewCount"),
                }
              : undefined,
        });

      case "LocalBusiness":
        return prune({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: get("name"),
          telephone: get("telephone"),
          url: get("url"),
          priceRange: get("priceRange"),
          openingHours: get("openingHours"),
          address: {
            "@type": "PostalAddress",
            streetAddress: get("streetAddress"),
            addressLocality: get("addressLocality"),
            postalCode: get("postalCode"),
            addressCountry: get("addressCountry"),
          },
        });

      case "Event":
        return prune({
          "@context": "https://schema.org",
          "@type": "Event",
          name: get("name"),
          startDate: get("startDate"),
          endDate: get("endDate"),
          url: get("url"),
          location: {
            "@type": "Place",
            name: get("locationName"),
            address: {
              "@type": "PostalAddress",
              streetAddress: get("streetAddress"),
              addressLocality: get("addressLocality"),
            },
          },
          offers:
            get("price") !== undefined
              ? { "@type": "Offer", price: get("price"), priceCurrency: get("priceCurrency") }
              : undefined,
        });

      default:
        return prune({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: get("headline"),
          description: get("description"),
          image: get("image"),
          datePublished: get("datePublished"),
          dateModified: get("dateModified") ?? get("datePublished"),
          author: get("author") ? { "@type": "Person", name: get("author") } : undefined,
          publisher: get("publisher")
            ? { "@type": "Organization", name: get("publisher") }
            : undefined,
        });
    }
  }, [type, values, faqs, crumbs]);

  const output = `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;

  const missing = SPECS[type]
    .filter((field) => field.required && !clean(values[field.key] ?? ""))
    .map((field) => field.label);

  const pairs = type === "FAQPage" ? faqs : crumbs;
  const setPairs = type === "FAQPage" ? setFaqs : setCrumbs;
  const usesPairs = type === "FAQPage" || type === "BreadcrumbList";

  return (
    <>
      <Toolbar>
        <Segmented
          label="Schema type"
          value={type}
          onChange={setType}
          options={[
            { value: "Article", label: "Article" },
            { value: "Product", label: "Product" },
            { value: "FAQPage", label: "FAQ" },
            { value: "LocalBusiness", label: "Local business" },
            { value: "Event", label: "Event" },
            { value: "BreadcrumbList", label: "Breadcrumbs" },
          ]}
        />
      </Toolbar>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          label={usesPairs ? (type === "FAQPage" ? "Questions" : "Breadcrumb trail") : "Details"}
          actions={
            usesPairs ? (
              <Button size="sm" onClick={() => setPairs((current) => [...current, makePair()])}>
                Add
              </Button>
            ) : undefined
          }
        >
          {usesPairs ? (
            <div className="divide-y divide-border">
              {pairs.map((pair) => (
                <div key={pair.id} className="grid gap-2 p-3">
                  <TextInput
                    value={pair.a}
                    onChange={(a) =>
                      setPairs((current) =>
                        current.map((item) => (item.id === pair.id ? { ...item, a } : item)),
                      )
                    }
                    placeholder={type === "FAQPage" ? "Question" : "Page name"}
                  />
                  <div className="flex gap-2">
                    <TextInput
                      value={pair.b}
                      onChange={(b) =>
                        setPairs((current) =>
                          current.map((item) => (item.id === pair.id ? { ...item, b } : item)),
                        )
                      }
                      placeholder={type === "FAQPage" ? "Answer" : "https://example.com/page"}
                    />
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        setPairs((current) => current.filter((item) => item.id !== pair.id))
                      }
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-3 p-3">
              {SPECS[type].map((field) => (
                <Field
                  key={field.key}
                  label={`${field.label}${field.required ? " *" : ""}`}
                  hint={field.hint}
                >
                  <TextInput
                    value={values[field.key] ?? ""}
                    onChange={(value) => set(field.key, value)}
                  />
                </Field>
              ))}
            </div>
          )}
        </Panel>

        <OutputPanel
          label="JSON-LD"
          value={output}
          filename="schema.html"
          mime="text/html"
          rows={24}
        />
      </div>

      {missing.length > 0 && (
        <Note tone="warning">
          Required for a valid {type}: {missing.join(", ")}. Google will ignore markup that is
          missing required properties.
        </Note>
      )}

      <Note>
        Paste this into your page head. Validate the result with Google’s Rich Results Test —
        well-formed JSON-LD does not guarantee eligibility for a given rich result.
      </Note>
    </>
  );
}
