"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  CopyButton,
  Field,
  Note,
  NumberInput,
  Panel,
  Segmented,
  Select,
  Slider,
  Toolbar,
} from "@/components/ui";
import { PASSPHRASE_WORDS, WORD_ENTROPY_BITS } from "@/lib/wordlist";

type Kind = "password" | "passphrase";

const SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?",
};

/** Characters that are easy to confuse in a rendered password. */
const AMBIGUOUS = /[il1LoO0]/g;

/** Unbiased random integer in [0, max) — modulo alone would skew the tail. */
function randomInt(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max;
  const buffer = new Uint32Array(1);
  let value = 0;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);
  return value % max;
}

function pick<T>(items: readonly T[]): T {
  return items[randomInt(items.length)];
}

/** Fisher-Yates, so the guaranteed characters are not stuck at the front. */
function shuffle(items: string[]): string[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const swap = randomInt(index + 1);
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

export default function Client() {
  const [kind, setKind] = useState<Kind>("password");
  const [length, setLength] = useState(20);
  const [useLower, setUseLower] = useState(true);
  const [useUpper, setUseUpper] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(false);

  const [wordCount, setWordCount] = useState(5);
  const [wordSeparator, setWordSeparator] = useState("-");
  const [capitalise, setCapitalise] = useState(false);
  const [appendNumber, setAppendNumber] = useState(false);

  const [value, setValue] = useState("");
  const [entropy, setEntropy] = useState(0);

  const generate = useCallback(() => {
    if (kind === "passphrase") {
      const words = Array.from({ length: wordCount }, () => pick(PASSPHRASE_WORDS)).map((word) =>
        capitalise ? word.charAt(0).toUpperCase() + word.slice(1) : word,
      );

      let phrase = words.join(wordSeparator);
      let bits = wordCount * WORD_ENTROPY_BITS;

      if (appendNumber) {
        phrase += wordSeparator + randomInt(10000).toString().padStart(4, "0");
        bits += Math.log2(10000);
      }

      setValue(phrase);
      setEntropy(bits);
      return;
    }

    const selected: string[] = [];
    if (useLower) selected.push(SETS.lower);
    if (useUpper) selected.push(SETS.upper);
    if (useDigits) selected.push(SETS.digits);
    if (useSymbols) selected.push(SETS.symbols);

    const pools = selected.map((pool) => (avoidAmbiguous ? pool.replace(AMBIGUOUS, "") : pool));
    if (pools.length === 0) {
      setValue("");
      setEntropy(0);
      return;
    }

    const alphabet = pools.join("");

    // Guarantee at least one character from every selected set, then fill.
    const required = pools.map((pool) => pick([...pool]));
    const remaining = Array.from({ length: Math.max(0, length - required.length) }, () =>
      pick([...alphabet]),
    );

    setValue(shuffle([...required, ...remaining]).join("").slice(0, Math.max(length, pools.length)));
    setEntropy(length * Math.log2(alphabet.length));
  }, [
    kind, length, useLower, useUpper, useDigits, useSymbols, avoidAmbiguous,
    wordCount, wordSeparator, capitalise, appendNumber,
  ]);

  useEffect(() => {
    // Generated from crypto.getRandomValues(), which must not run during the
    // server render or hydration would mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    generate();
  }, [generate]);

  const noSetsSelected =
    kind === "password" && !useLower && !useUpper && !useDigits && !useSymbols;

  const strength =
    entropy >= 100
      ? { label: "Excellent", tone: "success" as const }
      : entropy >= 75
        ? { label: "Strong", tone: "success" as const }
        : entropy >= 50
          ? { label: "Reasonable", tone: "warning" as const }
          : { label: "Weak", tone: "warning" as const };

  return (
    <>
      <Toolbar>
        <Segmented
          label="Type"
          value={kind}
          onChange={setKind}
          options={[
            { value: "password", label: "Password" },
            { value: "passphrase", label: "Passphrase" },
          ]}
        />

        {kind === "password" ? (
          <>
            <div className="min-w-48 flex-1">
              <Slider label="Length" value={length} onChange={setLength} min={6} max={64} />
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 pb-1">
              <Checkbox checked={useLower} onChange={setUseLower} label="a–z" />
              <Checkbox checked={useUpper} onChange={setUseUpper} label="A–Z" />
              <Checkbox checked={useDigits} onChange={setUseDigits} label="0–9" />
              <Checkbox checked={useSymbols} onChange={setUseSymbols} label="Symbols" />
              <Checkbox
                checked={avoidAmbiguous}
                onChange={setAvoidAmbiguous}
                label="No look-alikes"
              />
            </div>
          </>
        ) : (
          <>
            <Field label="Words" className="w-24">
              <NumberInput value={wordCount} onChange={setWordCount} min={3} max={12} />
            </Field>
            <Field label="Separator" className="w-32">
              <Select
                value={wordSeparator}
                onChange={setWordSeparator}
                options={[
                  { value: "-", label: "Hyphen" },
                  { value: ".", label: "Dot" },
                  { value: "_", label: "Underscore" },
                  { value: " ", label: "Space" },
                ]}
              />
            </Field>
            <div className="flex flex-col gap-1 pb-1.5">
              <Checkbox checked={capitalise} onChange={setCapitalise} label="Capitalise" />
              <Checkbox checked={appendNumber} onChange={setAppendNumber} label="Add digits" />
            </div>
          </>
        )}

        <Button variant="primary" onClick={generate} className="mb-0.5">
          Regenerate
        </Button>
      </Toolbar>

      <Panel label="Generated" actions={<CopyButton value={value} />}>
        <p className="code-pane wrap-anywhere px-4 py-6 text-center text-lg select-all">
          {value || "—"}
        </p>
      </Panel>

      {noSetsSelected ? (
        <Note tone="warning">Select at least one character set.</Note>
      ) : (
        <Note tone={strength.tone}>
          {strength.label} — roughly {Math.round(entropy)} bits of entropy.
          {entropy < 75 &&
            (kind === "password"
              ? " Increase the length or add another character set."
              : " Add another word.")}
        </Note>
      )}
    </>
  );
}
