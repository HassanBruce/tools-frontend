import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CookieConsent } from "@/components/cookie-consent";
import { Analytics } from "@/components/analytics";
import { THEME_SCRIPT } from "@/components/theme-toggle";
import { SITE_NAME, SITE_URL } from "@/lib/metadata";
import { TOOL_COUNT } from "@/lib/tools";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${TOOL_COUNT} Free Developer & SEO Tools`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "A fast, free collection of developer and SEO tools that run entirely in your browser. No accounts, no uploads, no tracking.",
  // Lets feed readers and browsers discover the RSS feed automatically.
  alternates: {
    types: { "application/rss+xml": [{ url: "/feed.xml", title: `${SITE_NAME} Blog` }] },
  },
  /*
   * Search engine ownership verification.
   *
   * Both are optional and omitted entirely when unset, so nothing is emitted
   * until you paste a token into .env. Use the "HTML tag" method in each tool
   * and copy only the content value, not the whole <meta> element:
   *
   *   Google — Search Console → Add property → HTML tag
   *     NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=xxxxxxxxxxxxxxxxxxxxxxxx
   *
   *   Bing — Webmaster Tools → Add site → Option 1, HTML meta tag
   *     NEXT_PUBLIC_BING_SITE_VERIFICATION=XXXXXXXXXXXXXXXXXXXX
   *
   * Leave them in place after verifying — both services re-check periodically
   * and will drop the property if the tag disappears.
   */
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // Light is the default. The inline script below may change this to "dark"
      // before paint, which React must not treat as a hydration mismatch.
      data-theme="light"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/*
          Runs synchronously before anything paints, so a returning visitor who
          chose dark never sees a white flash first. Must stay inline and
          blocking — moving it to an external file reintroduces the flash.
        */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        {/*
          Renders nothing today — NEXT_PUBLIC_ADSENSE_CLIENT is unset, so there
          are no cookies to consent to. KEEP IT MOUNTED. It is the consent gate
          that activates the moment ads are switched on; removing it means the
          ad script would load with no consent step. See components/cookie-consent.tsx.
        */}
        <CookieConsent />
        {/* Dormant until an analytics provider is configured. See components/analytics.tsx. */}
        <Analytics />
      </body>
    </html>
  );
}
