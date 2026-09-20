"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Route-level error boundary. Must be a Client Component — React needs a
 * component that can hold the reset callback and re-render on retry.
 *
 * Because every tool runs locally, a crash here almost always means a bad input
 * hit an edge case rather than anything being lost, which is what the copy says.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced in the browser console and, in production, in your hosting logs.
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <p className="font-mono text-sm font-semibold tracking-wide text-danger uppercase">
        Something broke
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">This page hit an error</h1>
      <p className="mt-3 text-muted">
        Nothing you entered was sent anywhere — the tools run entirely in your browser, so there is
        no server that received it. Trying again is usually enough; if it is not, the input may be
        hitting an edge case worth reporting.
      </p>

      {error.digest && (
        <p className="mt-4 rounded-lg border border-border bg-surface-muted px-3 py-2 font-mono text-xs text-muted">
          Reference: {error.digest}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-accent px-5 py-2.5 font-medium text-accent-fg transition hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/tools"
          className="rounded-lg border border-border px-5 py-2.5 font-medium transition hover:bg-surface-muted"
        >
          All tools
        </Link>
        <Link
          href="/contact"
          className="rounded-lg border border-border px-5 py-2.5 font-medium transition hover:bg-surface-muted"
        >
          Report it
        </Link>
      </div>
    </div>
  );
}
