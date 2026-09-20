"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Shareable links: put the tool's input in the URL so it can be sent to someone.
 *
 * Deliberately OPT-IN — pressing "Copy link" builds the URL, and nothing is
 * written to the address bar while you type. Auto-syncing would push every
 * keystroke into browser history and leak the content through the Referer
 * header on any outbound click, which is exactly the behaviour this site's
 * whole premise argues against. Making it a button keeps the decision with the
 * person who knows whether the content is shareable.
 */

/** Query parameter carrying the encoded input. */
const PARAM = "i";

/**
 * Practical ceiling. The HTTP spec sets no limit, but proxies, older servers
 * and some chat clients truncate beyond roughly this length.
 */
const MAX_URL_LENGTH = 8000;

function encode(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decode(encoded: string): string | null {
  try {
    let normalised = encoded.replace(/-/g, "+").replace(/_/g, "/");
    while (normalised.length % 4 !== 0) normalised += "=";
    const binary = atob(normalised);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

/**
 * Restores a shared value into a tool on load.
 *
 * Called by InputPanel, so every tool with `share` gets this without any change
 * of its own. Tools with two inputs (the diff checker) pass distinct keys so
 * both sides travel in the link independently.
 */
export function useRestoreShared(
  enabled: boolean,
  key: string,
  apply: (value: string) => void,
) {
  const applied = useRef(false);

  useEffect(() => {
    // Read after mount, not during render: the server has no URL search string,
    // so reading it earlier would produce a hydration mismatch.
    if (!enabled || applied.current) return;

    const encoded = new URLSearchParams(window.location.search).get(key);
    if (!encoded) return;

    const shared = decode(encoded);
    if (shared === null) return;

    applied.current = true;
    apply(shared);
    // `apply` is a fresh closure each render; depending on it would re-run this
    // and stamp over whatever the visitor has typed since.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, key]);
}

/** Builds the shareable URL for a value, or null when it will not fit. */
export function buildShareUrl(value: string, key: string = PARAM): string | null {
  if (typeof window === "undefined" || !value) return null;

  const url = new URL(window.location.href);
  // Preserve any other tool's share key already in the URL (two-input tools).
  url.searchParams.set(key, encode(value));
  url.hash = "";

  return url.toString().length > MAX_URL_LENGTH ? null : url.toString();
}

export function ShareButton({ value, shareKey = PARAM }: { value: string; shareKey?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "too-long">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const timer = window.setTimeout(() => setState("idle"), 2400);
    return () => window.clearTimeout(timer);
  }, [state]);

  const share = useCallback(async () => {
    const url = buildShareUrl(value, shareKey);
    if (!url) {
      setState("too-long");
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const area = document.createElement("textarea");
      area.value = url;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy");
      } finally {
        document.body.removeChild(area);
      }
    }
    setState("copied");
  }, [value, shareKey]);

  const label =
    state === "copied" ? "Link copied" : state === "too-long" ? "Too long to share" : "Copy link";

  return (
    <button
      type="button"
      onClick={share}
      disabled={!value}
      title="Copy a link that opens this tool with the current input"
      className={`inline-flex shrink-0 items-center rounded-lg border px-2.5 py-1 text-xs font-medium transition disabled:pointer-events-none disabled:opacity-45 ${
        state === "too-long"
          ? "border-warning/40 text-warning"
          : "border-border bg-surface hover:bg-surface-muted"
      }`}
    >
      {label}
    </button>
  );
}

/** Small notice shown when the page was opened from a shared link. */
export function SharedNotice({ restored }: { restored: boolean }) {
  if (!restored) return null;
  return (
    <p className="mt-3 rounded-lg border border-accent/30 bg-accent-soft px-3 py-2 text-sm text-accent">
      Loaded from a shared link. Nothing was uploaded — the content travelled in the URL itself.
    </p>
  );
}
