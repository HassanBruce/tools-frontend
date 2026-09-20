"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

/**
 * ============================================================================
 *  DO NOT DELETE — dormant until an analytics provider is configured.
 * ============================================================================
 *
 * Renders nothing today. Set one of the environment variables below and it
 * wires itself up; nothing else needs changing.
 *
 * Two providers are supported, and the difference matters legally:
 *
 *   NEXT_PUBLIC_PLAUSIBLE_DOMAIN   Cookieless. No personal data, no consent
 *                                  banner required. Loads immediately.
 *                                  (Umami and Fathom work the same way — swap
 *                                  the script src below.)
 *
 *   NEXT_PUBLIC_GA_ID              Google Analytics 4. Sets cookies, so under
 *                                  GDPR it needs consent. Gated behind the same
 *                                  consent state as AdSense — it will not load
 *                                  until the visitor accepts.
 *
 * Given the site's whole pitch is that it does not track you, cookieless
 * analytics is the coherent choice. GA is here because AdSense reporting is
 * easier alongside it.
 */

const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/** Same key the consent banner writes — see components/cookie-consent.tsx. */
const CONSENT_KEY = "cookie-consent";

export function Analytics() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    // GA is the only provider here that needs this; skip the work otherwise.
    if (!GA_ID) return;

    const read = () => {
      try {
        setConsented(window.localStorage.getItem(CONSENT_KEY) === "granted");
      } catch {
        setConsented(false);
      }
    };

    read();
    // Pick up a decision made in this tab or another one.
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, []);

  return (
    <>
      {PLAUSIBLE_DOMAIN && (
        <Script
          defer
          strategy="afterInteractive"
          data-domain={PLAUSIBLE_DOMAIN}
          src="https://plausible.io/js/script.js"
        />
      )}

      {GA_ID && consented && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}
    </>
  );
}
