"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Field,
  NumberInput,
  OutputPanel,
  Segmented,
  Select,
  Toolbar,
} from "@/components/ui";

type Unit = "paragraphs" | "sentences" | "words";
type Format = "text" | "html";

const CLASSIC = "lorem ipsum dolor sit amet consectetur adipiscing elit";

const WORDS = `sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim
veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute
irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint
occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum
perspiciatis unde omnis iste natus error voluptatem accusantium doloremque laudantium totam rem
aperiam eaque ipsa quae ab illo inventore veritatis quasi architecto beatae vitae dicta explicabo
nemo ipsam voluptas aspernatur aut odit fugit sequi nesciunt neque porro quisquam est dolorem
adipisci numquam eius modi tempora incidunt magnam quaerat`
  .split(/\s+/)
  .filter(Boolean);

const randomInt = (max: number) => Math.floor(Math.random() * max);
const word = () => WORDS[randomInt(WORDS.length)];

function sentence(): string {
  const length = 8 + randomInt(10);
  const words = Array.from({ length }, word);
  // Sprinkle in a comma so sentences do not all read identically.
  if (length > 10) words.splice(4 + randomInt(3), 0, `${word()},`);
  const text = words.join(" ");
  return text.charAt(0).toUpperCase() + text.slice(1) + ".";
}

function paragraph(sentenceCount: number): string {
  return Array.from({ length: sentenceCount }, sentence).join(" ");
}

export default function Client() {
  const [unit, setUnit] = useState<Unit>("paragraphs");
  const [count, setCount] = useState(3);
  const [format, setFormat] = useState<Format>("text");
  const [startClassic, setStartClassic] = useState(true);
  const [output, setOutput] = useState("");

  const generate = useCallback(() => {
    const total = Math.min(Math.max(count, 1), 200);
    let blocks: string[];

    if (unit === "words") {
      const words = Array.from({ length: total }, word);
      if (startClassic) {
        words.splice(0, Math.min(total, 8), ...CLASSIC.split(" ").slice(0, Math.min(total, 8)));
      }
      const text = words.join(" ");
      blocks = [text.charAt(0).toUpperCase() + text.slice(1) + "."];
    } else if (unit === "sentences") {
      blocks = [Array.from({ length: total }, sentence).join(" ")];
      if (startClassic) {
        blocks[0] = `${CLASSIC.charAt(0).toUpperCase() + CLASSIC.slice(1)}. ${blocks[0]}`;
      }
    } else {
      blocks = Array.from({ length: total }, () => paragraph(3 + randomInt(3)));
      if (startClassic) {
        blocks[0] = `${CLASSIC.charAt(0).toUpperCase() + CLASSIC.slice(1)}, ${blocks[0].charAt(0).toLowerCase()}${blocks[0].slice(1)}`;
      }
    }

    setOutput(
      format === "html" ? blocks.map((block) => `<p>${block}</p>`).join("\n\n") : blocks.join("\n\n"),
    );
  }, [unit, count, format, startClassic]);

  useEffect(() => {
    // The text is randomised, so it must be produced on the client, not in SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    generate();
  }, [generate]);

  return (
    <>
      <Toolbar>
        <Segmented
          label="Generate"
          value={unit}
          onChange={setUnit}
          options={[
            { value: "paragraphs", label: "Paragraphs" },
            { value: "sentences", label: "Sentences" },
            { value: "words", label: "Words" },
          ]}
        />
        <Field label="How many" className="w-28">
          <NumberInput value={count} onChange={setCount} min={1} max={200} />
        </Field>
        <Field label="Output" className="w-36">
          <Select
            value={format}
            onChange={setFormat}
            options={[
              { value: "text", label: "Plain text" },
              { value: "html", label: "HTML" },
            ]}
          />
        </Field>
        <div className="pb-2">
          <Checkbox
            checked={startClassic}
            onChange={setStartClassic}
            label="Start with “Lorem ipsum”"
          />
        </div>
        <Button variant="primary" onClick={generate} className="mb-0.5">
          Regenerate
        </Button>
      </Toolbar>

      <OutputPanel
        label="Placeholder text"
        value={output}
        filename={format === "html" ? "lorem.html" : "lorem.txt"}
        mime={format === "html" ? "text/html" : "text/plain"}
        rows={18}
      />
    </>
  );
}
