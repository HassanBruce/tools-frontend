"use client";

import { useCallback, useEffect, useState } from "react";
import Script from "next/script";
import Link from "next/link";

/**
 * ============================================================================
 *  DO NOT DELETE THIS FILE — it looks unused, and it is not.
 * ============================================================================
 *
 * Right now this component renders NOTHING. That is correct and intentional.
 *
 * It is dormant because `NEXT_PUBLIC_ADSENSE_CLIENT` is not set. The moment
 * that variable is given a publisher id, this becomes the consent gate that
 * stands between your visitors and an advertising cookie — which in the EU and
 * UK is a legal requirement, not a nicety.
 *
 * If you delete this "dead code" and later switch AdSense on, the ad script
 * will load for everyone with no consent step at all. That is the failure this
 * file exists to prevent, and it fails silently.
 *
 * To enable ads later:
 *   1. Put your publisher id in .env.local:
 *        NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
 *   2. Rebuild. The banner appears automatically; nothing else to wire up.
 *
 * ---------------------------------------------------------------------------
 * Two deliberate design decisions, both worth preserving:
 *
 * 1. The banner only appears when an ad client is actually configured. A site
 *    that sets no cookies has nothing to ask consent for, and showing a banner
 *    anyway is theatre that trains people to dismiss them.
 *
 * 2. The AdSense script is not loaded until consent is given. Loading it first
 *    and asking afterwards sets the cookie before the answer, which is exactly
 *    what the consent requirement exists to prevent.
 */

const STORAGE_KEY = "cookie-consent";
const OPEN_EVENT = "cookie-settings:open";

/** Set NEXT_PUBLIC_ADSENSE_CLIENT (e.g. "ca-pub-0000000000000000") to enable. */
const AD_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

type Consent = "granted" | "denied" | null;

export function CookieConsent() {
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // localStorage is browser-only; reading it during render would not match
    // the server-rendered markup.
    let stored: Consent = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === "granted" || raw === "denied") stored = raw;
    } catch {
      // Private mode or blocked storage — behave as if no choice was made.
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsent(stored);
    setReady(true);
  }, []);

  const decide = useCallback((value: Exclude<Consent, null>) => {
    setConsent(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Not being able to remember the choice is survivable; asking again is
      // better than assuming consent.
    }
  }, []);

  // Let a "Cookie settings" control anywhere on the page reopen this.
  useEffect(() => {
    const reopen = () => setConsent(null);
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  // Nothing to consent to.
  if (!AD_CLIENT) return null;

  return (
    <>
      {consent === "granted" && (
        <Script
          async
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`}
        />
      )}

      {ready && consent === null && (
        <div
          role="dialog"
          aria-label="Cookie consent"
          className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 backdrop-blur"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
            <p className="flex-1 text-sm text-muted">
              We use cookies from Google to show ads. The tools themselves never send your data
              anywhere and work exactly the same either way. See our{" "}
              <Link href="/privacy" className="text-accent underline underline-offset-2">
                privacy policy
              </Link>
              .
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => decide("denied")}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-surface-muted"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={() => decide("granted")}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition hover:opacity-90"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Footer control that reopens the banner, so consent can be withdrawn — a
 * requirement under GDPR, not a nicety. Renders nothing when ads are disabled.
 */
export function CookieSettingsButton() {
  if (!AD_CLIENT) return null;

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      className="text-sm text-muted underline-offset-2 transition hover:text-foreground hover:underline"
    >
      Cookie settings
    </button>
  );
}
