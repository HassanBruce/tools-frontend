"use client";

import { useEffect, useMemo, useState } from "react";
import { ErrorNote, InputPanel, Note, OutputPanel, Panel, ToolGrid } from "@/components/ui";

const SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSBMb3ZlbGFjZSIsImFkbWluIjp0cnVlLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTc2NzIyNTYwMH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

function decodeSegment(segment: string): unknown {
  const normalised = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalised + "=".repeat((4 - (normalised.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

/** Claims that carry a NumericDate value, per RFC 7519. */
const DATE_CLAIMS = new Set(["iat", "exp", "nbf", "auth_time", "updated_at"]);

const CLAIM_NAMES: Record<string, string> = {
  iss: "Issuer",
  sub: "Subject",
  aud: "Audience",
  exp: "Expires at",
  nbf: "Not valid before",
  iat: "Issued at",
  jti: "JWT ID",
};

export default function Client() {
  const [token, setToken] = useState(SAMPLE);

  const decoded = useMemo(() => {
    const trimmed = token.trim();
    if (!trimmed) return null;

    const parts = trimmed.split(".");
    if (parts.length < 2) {
      return { error: "A JWT has three dot-separated parts: header.payload.signature." };
    }

    try {
      const header = decodeSegment(parts[0]);
      const payload = decodeSegment(parts[1]);
      return { header, payload, signature: parts[2] ?? "", error: null as string | null };
    } catch {
      return { error: "Could not decode this token — the header or payload is not valid Base64URL JSON." };
    }
  }, [token]);

  const claims = useMemo(() => {
    if (!decoded || decoded.error || typeof decoded.payload !== "object" || !decoded.payload) {
      return [];
    }
    return Object.entries(decoded.payload as Record<string, unknown>);
  }, [decoded]);

  // Reading the clock during render would differ between server and client, so
  // `now` is captured after hydration and the badge appears once it is known.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see above.
    setNow(Date.now());
  }, [token]);

  const expiry = useMemo(() => {
    const payload = decoded && !decoded.error ? (decoded.payload as Record<string, unknown>) : null;
    const exp = payload?.["exp"];
    if (typeof exp !== "number" || now === null) return null;

    const expiresAt = new Date(exp * 1000);
    return { expiresAt, expired: expiresAt.getTime() < now };
  }, [decoded, now]);

  return (
    <>
      <ToolGrid>
        <InputPanel
          share
          openFile
          label="JSON Web Token"
          value={token}
          onChange={setToken}
          placeholder="eyJhbGciOi..."
          rows={10}
        />
        <div className="grid gap-4">
          <OutputPanel
          language="json"
            label="Header"
            value={decoded && !decoded.error ? JSON.stringify(decoded.header, null, 2) : ""}
            rows={6}
          />
          <OutputPanel
          language="json"
            label="Payload"
            value={decoded && !decoded.error ? JSON.stringify(decoded.payload, null, 2) : ""}
            rows={10}
          />
        </div>
      </ToolGrid>

      {decoded?.error && <ErrorNote>{decoded.error}</ErrorNote>}

      {expiry && (
        <Note tone={expiry.expired ? "warning" : "success"}>
          {expiry.expired
            ? `Expired on ${expiry.expiresAt.toLocaleString()}.`
            : `Valid until ${expiry.expiresAt.toLocaleString()}.`}
        </Note>
      )}

      {claims.length > 0 && (
        <Panel label="Claims" className="mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted uppercase">
                <th className="px-3 py-2 font-medium">Claim</th>
                <th className="px-3 py-2 font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {claims.map(([key, value]) => (
                <tr key={key} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 align-top font-mono text-xs">
                    {key}
                    {CLAIM_NAMES[key] && (
                      <span className="ml-2 font-sans text-muted">{CLAIM_NAMES[key]}</span>
                    )}
                  </td>
                  <td className="wrap-anywhere px-3 py-2 font-mono text-xs text-muted">
                    {DATE_CLAIMS.has(key) && typeof value === "number"
                      ? `${value} — ${new Date(value * 1000).toLocaleString()}`
                      : typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      <Note tone="warning">
        The signature is <strong>not</strong> verified — that would require your secret or public
        key. Decoding proves nothing about authenticity, so never trust an unverified token in code.
      </Note>
    </>
  );
}
