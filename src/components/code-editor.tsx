"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { highlight, type Language } from "@/lib/highlight";

/**
 * A textarea with a syntax-highlighted layer behind it.
 *
 * The technique: render the highlighted HTML into an absolutely positioned
 * <pre>, then lay a transparent textarea on top. The user types into the real
 * textarea — so selection, undo, spellcheck, IME and accessibility all behave
 * natively — while the colours come from the layer beneath.
 *
 * The two elements MUST lay text out identically or the colours drift away from
 * the caret. Both use `.code-pane` for font metrics and identical padding and
 * wrapping rules; see `.editor-stack` in globals.css.
 */
export function CodeEditor({
  value,
  onChange,
  language = "plain",
  placeholder,
  readOnly = false,
  rows = 16,
}: {
  value: string;
  onChange?: (value: string) => void;
  language?: Language;
  placeholder?: string;
  readOnly?: boolean;
  rows?: number;
}) {
  const preRef = useRef<HTMLPreElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  // Keep the coloured layer scrolled in step with the textarea.
  const syncScroll = useCallback(() => {
    const area = areaRef.current;
    const pre = preRef.current;
    if (!area || !pre) return;
    pre.scrollTop = area.scrollTop;
    pre.scrollLeft = area.scrollLeft;
  }, []);

  useEffect(() => {
    syncScroll();
  }, [value, syncScroll]);

  // A trailing newline is not rendered by <pre>, so the last line would lose
  // its highlight row. Appending a space keeps the layers the same height.
  const painted = highlight(value.endsWith("\n") ? `${value} ` : value, language);

  const shared = "code-pane px-3 py-2.5";

  if (language === "plain") {
    // Nothing to paint — skip the overlay entirely rather than pay for it.
    return (
      <textarea
        ref={areaRef}
        value={value}
        readOnly={readOnly}
        rows={rows}
        spellCheck={false}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
        className={`${shared} block w-full resize-y border-0 bg-transparent outline-none placeholder:text-muted/60`}
      />
    );
  }

  return (
    <div className="editor-stack">
      <pre ref={preRef} aria-hidden className={`${shared} ${"text-foreground"}`}>
        {/* Output of `highlight`, which escapes its input and emits only its
            own <span class="tok-*"> wrappers. */}
        <code dangerouslySetInnerHTML={{ __html: painted }} />
      </pre>
      <textarea
        ref={areaRef}
        value={value}
        readOnly={readOnly}
        rows={rows}
        spellCheck={false}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
        onScroll={syncScroll}
        className={`${shared} block w-full outline-none placeholder:text-muted/60`}
      />
    </div>
  );
}

/**
 * "Open file" control. Reads a text file straight into the input — every text
 * tool gets this, not just the image ones.
 */
export function OpenFileButton({
  onText,
  accept = ".txt,.json,.csv,.xml,.yaml,.yml,.html,.css,.js,.sql,.md,.env,text/*",
  maxBytes = 5 * 1024 * 1024,
}: {
  onText: (text: string, filename: string) => void;
  accept?: string;
  maxBytes?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => setError(null), 4000);
    return () => window.clearTimeout(timer);
  }, [error]);

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        title={error ?? "Open a file from your device"}
        className={`inline-flex shrink-0 items-center rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
          error
            ? "border-danger/40 text-danger"
            : "border-border bg-surface hover:bg-surface-muted"
        }`}
      >
        {error ?? "Open file"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = ""; // allow re-picking the same file
          if (!file) return;

          if (file.size > maxBytes) {
            setError(`Too large (max ${Math.round(maxBytes / 1024 / 1024)} MB)`);
            return;
          }
          try {
            onText(await file.text(), file.name);
          } catch {
            setError("Could not read that file");
          }
        }}
      />
    </>
  );
}
