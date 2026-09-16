"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  Button,
  ErrorNote,
  Field,
  Note,
  Panel,
  Segmented,
  Select,
  Slider,
  TextInput,
  Toolbar,
  downloadBlob,
} from "@/components/ui";

type ContentType = "url" | "text" | "wifi" | "vcard" | "email" | "sms";

const LEVELS = [
  { value: "L", label: "L — 7% recovery" },
  { value: "M", label: "M — 15% (default)" },
  { value: "Q", label: "Q — 25%" },
  { value: "H", label: "H — 30%" },
] as const;

/** Escape the characters that are structural in a WIFI: payload. */
const wifiEscape = (value: string) => value.replace(/([\\;,:"])/g, "\\$1");

export default function Client() {
  const [type, setType] = useState<ContentType>("url");
  const [url, setUrl] = useState("https://example.com");
  const [text, setText] = useState("Hello from a QR code");

  const [ssid, setSsid] = useState("MyNetwork");
  const [wifiPassword, setWifiPassword] = useState("supersecret");
  const [encryption, setEncryption] = useState("WPA");

  const [name, setName] = useState("Ada Lovelace");
  const [org, setOrg] = useState("Analytical Engines Ltd");
  const [phone, setPhone] = useState("+44 20 7946 0958");
  const [email, setEmail] = useState("ada@example.com");

  const [subject, setSubject] = useState("Hello");
  const [body, setBody] = useState("Just getting in touch.");

  const [size, setSize] = useState(320);
  const [margin, setMargin] = useState(2);
  const [level, setLevel] = useState<(typeof LEVELS)[number]["value"]>("M");
  const [dark, setDark] = useState("#000000");
  const [light, setLight] = useState("#ffffff");

  const [png, setPng] = useState("");
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);

  const payload = useMemo(() => {
    switch (type) {
      case "url":
        return url.trim();
      case "wifi":
        return `WIFI:T:${encryption};S:${wifiEscape(ssid)};P:${wifiEscape(wifiPassword)};;`;
      case "vcard":
        return [
          "BEGIN:VCARD",
          "VERSION:3.0",
          `FN:${name}`,
          org ? `ORG:${org}` : "",
          phone ? `TEL;TYPE=CELL:${phone}` : "",
          email ? `EMAIL:${email}` : "",
          "END:VCARD",
        ]
          .filter(Boolean)
          .join("\n");
      case "email":
        return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      case "sms":
        return `SMSTO:${phone}:${body}`;
      default:
        return text;
    }
  }, [type, url, text, ssid, wifiPassword, encryption, name, org, phone, email, subject, body]);

  useEffect(() => {
    if (!payload) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPng("");
      setSvg("");
      setError(null);
      return;
    }

    let cancelled = false;
    const options = {
      width: size,
      margin,
      errorCorrectionLevel: level,
      color: { dark, light },
    } as const;

    // Rendering is async and canvas-based, so it cannot run during render.
    Promise.all([QRCode.toDataURL(payload, options), QRCode.toString(payload, { ...options, type: "svg" })])
      .then(([dataUrl, svgMarkup]) => {
        if (cancelled) return;
        setPng(dataUrl);
        setSvg(svgMarkup);
        setError(null);
      })
      .catch((caught: unknown) => {
        if (cancelled) return;
        setPng("");
        setSvg("");
        setError(
          caught instanceof Error
            ? caught.message
            : "Could not generate a QR code from this content.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [payload, size, margin, level, dark, light]);

  return (
    <>
      <Toolbar>
        <Segmented
          label="Content"
          value={type}
          onChange={setType}
          options={[
            { value: "url", label: "URL" },
            { value: "text", label: "Text" },
            { value: "wifi", label: "WiFi" },
            { value: "vcard", label: "Contact" },
            { value: "email", label: "Email" },
            { value: "sms", label: "SMS" },
          ]}
        />
      </Toolbar>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-3">
          <Panel label="Content">
            <div className="grid gap-3 p-3">
              {type === "url" && (
                <Field label="URL">
                  <TextInput value={url} onChange={setUrl} mono />
                </Field>
              )}
              {type === "text" && (
                <Field label="Text">
                  <TextInput value={text} onChange={setText} />
                </Field>
              )}
              {type === "wifi" && (
                <>
                  <Field label="Network name (SSID)">
                    <TextInput value={ssid} onChange={setSsid} />
                  </Field>
                  <Field label="Password">
                    <TextInput value={wifiPassword} onChange={setWifiPassword} />
                  </Field>
                  <Field label="Security">
                    <Select
                      value={encryption}
                      onChange={setEncryption}
                      options={[
                        { value: "WPA", label: "WPA / WPA2 / WPA3" },
                        { value: "WEP", label: "WEP" },
                        { value: "nopass", label: "Open — no password" },
                      ]}
                    />
                  </Field>
                </>
              )}
              {type === "vcard" && (
                <>
                  <Field label="Full name">
                    <TextInput value={name} onChange={setName} />
                  </Field>
                  <Field label="Organisation">
                    <TextInput value={org} onChange={setOrg} />
                  </Field>
                  <Field label="Phone">
                    <TextInput value={phone} onChange={setPhone} />
                  </Field>
                  <Field label="Email">
                    <TextInput value={email} onChange={setEmail} />
                  </Field>
                </>
              )}
              {type === "email" && (
                <>
                  <Field label="To">
                    <TextInput value={email} onChange={setEmail} mono />
                  </Field>
                  <Field label="Subject">
                    <TextInput value={subject} onChange={setSubject} />
                  </Field>
                  <Field label="Body">
                    <TextInput value={body} onChange={setBody} />
                  </Field>
                </>
              )}
              {type === "sms" && (
                <>
                  <Field label="Phone number">
                    <TextInput value={phone} onChange={setPhone} mono />
                  </Field>
                  <Field label="Message">
                    <TextInput value={body} onChange={setBody} />
                  </Field>
                </>
              )}
            </div>
          </Panel>

          <Panel label="Appearance">
            <div className="grid gap-3 p-3">
              <Slider label="Size" value={size} onChange={setSize} min={128} max={1024} step={32} display={`${size} px`} />
              <Slider label="Quiet zone" value={margin} onChange={setMargin} min={0} max={8} />
              <Field label="Error correction">
                <Select value={level} onChange={setLevel} options={LEVELS} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Foreground">
                  <input
                    type="color"
                    value={dark}
                    onChange={(event) => setDark(event.target.value)}
                    className="h-9.5 w-full cursor-pointer rounded-lg border border-border bg-surface p-1"
                  />
                </Field>
                <Field label="Background">
                  <input
                    type="color"
                    value={light}
                    onChange={(event) => setLight(event.target.value)}
                    className="h-9.5 w-full cursor-pointer rounded-lg border border-border bg-surface p-1"
                  />
                </Field>
              </div>
            </div>
          </Panel>
        </div>

        <Panel
          label="QR code"
          actions={
            <>
              <Button
                size="sm"
                disabled={!svg}
                onClick={() => downloadBlob(new Blob([svg], { type: "image/svg+xml" }), "qr-code.svg")}
              >
                SVG
              </Button>
              <Button
                size="sm"
                disabled={!png}
                onClick={async () => {
                  const blob = await (await fetch(png)).blob();
                  downloadBlob(blob, "qr-code.png");
                }}
              >
                PNG
              </Button>
            </>
          }
        >
          <div className="flex items-center justify-center p-6">
            {png ? (
              // A data: URL of a locally generated canvas — next/image would add
              // no value here and cannot optimise it.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={png}
                alt="Generated QR code"
                className="h-auto max-w-full rounded-lg"
                style={{ width: Math.min(size, 360) }}
              />
            ) : (
              <p className="py-16 text-sm text-muted">Enter some content to generate a code.</p>
            )}
          </div>
        </Panel>
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      <Note>
        {level === "L" || level === "M"
          ? "Raise the error correction to Q or H if the code will be printed small, curved, or overlaid with a logo."
          : "Higher error correction makes the code denser but far more tolerant of damage and overlays."}{" "}
        The data is embedded directly in the image — there is no redirect, so the code never expires.
      </Note>
    </>
  );
}
