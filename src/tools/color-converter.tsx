"use client";

import { useMemo, useState } from "react";
import { CopyButton, ErrorNote, Field, Note, Panel, TextInput, Toolbar } from "@/components/ui";
import {
  BLACK,
  WHITE,
  contrastVerdict,
  parseColor,
  rgbToHsl,
  toHex,
  toHslString,
  toRgbString,
} from "@/lib/color";

function Swatch({ label, pass }: { label: string; pass: boolean }) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-xs font-medium ${
        pass ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
      }`}
    >
      {label} {pass ? "pass" : "fail"}
    </span>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2.5 last:border-0">
      <span className="text-xs font-medium text-muted">{label}</span>
      <span className="flex items-center gap-2">
        <span className="code-pane">{value}</span>
        <CopyButton value={value} />
      </span>
    </div>
  );
}

export default function Client() {
  const [input, setInput] = useState("#4f46e5");

  const color = useMemo(() => parseColor(input), [input]);
  const hsl = useMemo(() => (color ? rgbToHsl(color) : null), [color]);

  const onWhite = color ? contrastVerdict(color, WHITE) : null;
  const onBlack = color ? contrastVerdict(color, BLACK) : null;

  // The native picker only understands 6-digit hex.
  const pickerValue = color ? toHex(color, false) : "#000000";

  return (
    <>
      <Toolbar>
        <Field label="Colour" className="min-w-56 flex-1">
          <TextInput value={input} onChange={setInput} placeholder="#4f46e5, rgb(79 70 229), hsl(...)" mono />
        </Field>
        <Field label="Picker" className="w-24">
          <input
            type="color"
            value={pickerValue}
            onChange={(event) => setInput(event.target.value)}
            className="h-9.5 w-full cursor-pointer rounded-lg border border-border bg-surface p-1"
          />
        </Field>
      </Toolbar>

      {!color && input.trim() ? (
        <ErrorNote>
          Could not parse that colour. Try a hex value like #4f46e5, rgb(79, 70, 229) or hsl(243,
          75%, 59%).
        </ErrorNote>
      ) : null}

      {color && hsl && (
        <>
          <div
            className="mb-4 flex h-32 items-end rounded-xl border border-border p-4"
            style={{ backgroundColor: toRgbString(color) }}
          >
            <span
              className="rounded px-2 py-1 text-sm font-medium"
              style={{
                backgroundColor: (onWhite?.ratio ?? 0) > (onBlack?.ratio ?? 0) ? "#fff" : "#000",
                color: toRgbString(color),
              }}
            >
              {toHex(color, true)}
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel label="Formats">
              <Row label="HEX" value={toHex(color, false)} />
              {color.a < 1 && <Row label="HEX + alpha" value={toHex(color, true)} />}
              <Row label="RGB" value={toRgbString(color)} />
              <Row label="HSL" value={toHslString(color)} />
              <Row label="CSS variables" value={`--color: ${toHex(color, false)};`} />
              <Row label="Components" value={`R ${color.r}  G ${color.g}  B ${color.b}`} />
              <Row label="HSL components" value={`H ${hsl.h}°  S ${hsl.s}%  L ${hsl.l}%`} />
            </Panel>

            <Panel label="WCAG contrast">
              <div className="space-y-3 p-3">
                <div className="rounded-lg border border-border bg-white p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium" style={{ color: toRgbString(color) }}>
                      Text on white
                    </span>
                    <span className="code-pane text-black">{onWhite?.ratio.toFixed(2)}:1</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Swatch label="AA" pass={!!onWhite?.aaNormal} />
                    <Swatch label="AA large" pass={!!onWhite?.aaLarge} />
                    <Swatch label="AAA" pass={!!onWhite?.aaaNormal} />
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-black p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium" style={{ color: toRgbString(color) }}>
                      Text on black
                    </span>
                    <span className="code-pane text-white">{onBlack?.ratio.toFixed(2)}:1</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Swatch label="AA" pass={!!onBlack?.aaNormal} />
                    <Swatch label="AA large" pass={!!onBlack?.aaLarge} />
                    <Swatch label="AAA" pass={!!onBlack?.aaaNormal} />
                  </div>
                </div>
              </div>
            </Panel>
          </div>

          <Note>
            AA needs 4.5:1 for body text and 3:1 for large text (18pt, or 14pt bold). AAA raises
            those to 7:1 and 4.5:1.
          </Note>
        </>
      )}
    </>
  );
}
