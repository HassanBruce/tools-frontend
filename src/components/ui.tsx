"use client";

/**
 * Shared building blocks for the tools.
 *
 * Every tool page composes these, so a change here restyles the whole site.
 * Keep them generic — anything tool-specific belongs in that tool's client.tsx.
 */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------ layout */

export function ToolGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 lg:grid-cols-2">{children}</div>;
}

export function Panel({
  label,
  actions,
  children,
  className = "",
}: {
  label?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface ${className}`}
    >
      {(label || actions) && (
        <header className="flex min-h-11 flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
          <span className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</span>
          <div className="flex flex-wrap items-center gap-1.5">{actions}</div>
        </header>
      )}
      <div className="min-w-0 flex-1">{children}</div>
    </section>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface-muted p-3">
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ inputs */

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25";

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
  mono = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  mono?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={`${inputClass} ${mono ? "font-mono text-[0.8125rem]" : ""} ${className}`}
    />
  );
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  className = "",
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(event) => {
        const next = Number(event.target.value);
        if (Number.isNaN(next)) return;
        onChange(next);
      }}
      className={`${inputClass} ${className}`}
    />
  );
}

export function Select<T extends string>({
  value,
  onChange,
  options,
  className = "",
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as T)}
      className={`${inputClass} ${className}`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-accent"
      />
      <span>{label}</span>
    </label>
  );
}

export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  display,
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label: string;
  display?: string;
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="flex items-center justify-between text-xs font-medium text-muted">
        <span>{label}</span>
        <span className="font-mono text-foreground">{display ?? value}</span>
      </span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-accent"
      />
    </label>
  );
}

/** Mode switcher — the row of pills most tools use to pick a direction. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  label?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {label && <span className="text-xs font-medium text-muted">{label}</span>}
      <div
        role="tablist"
        aria-label={label}
        className="inline-flex flex-wrap gap-1 rounded-lg border border-border bg-surface p-1"
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                active
                  ? "bg-accent text-accent-fg"
                  : "text-muted hover:bg-surface-muted hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- buttons */

export function Button({
  children,
  onClick,
  variant = "default",
  size = "md",
  disabled,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary" | "ghost" | "danger";
  size?: "sm" | "md";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  const variants = {
    default: "border border-border bg-surface hover:bg-surface-muted",
    primary: "bg-accent text-accent-fg hover:opacity-90",
    ghost: "text-muted hover:bg-surface-muted hover:text-foreground",
    danger: "border border-border text-danger hover:bg-surface-muted",
  } as const;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg font-medium transition disabled:pointer-events-none disabled:opacity-45 ${
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-2 text-sm"
      } ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function CopyButton({
  value,
  label = "Copy",
  size = "sm",
}: {
  value: string;
  label?: string;
  size?: "sm" | "md";
}) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard API needs a secure context; fall back to a hidden textarea.
      const area = document.createElement("textarea");
      area.value = value;
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
    setCopied(true);
  }, [value]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <Button onClick={copy} size={size} disabled={!value}>
      {copied ? "Copied" : label}
    </Button>
  );
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Revoke on the next tick so Firefox has time to start the download.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function DownloadButton({
  value,
  filename,
  mime = "text/plain",
  label = "Download",
}: {
  value: string;
  filename: string;
  mime?: string;
  label?: string;
}) {
  return (
    <Button
      size="sm"
      disabled={!value}
      onClick={() => downloadBlob(new Blob([value], { type: mime }), filename)}
    >
      {label}
    </Button>
  );
}

/* ------------------------------------------------------------------- panes */

export function CodeArea({
  value,
  onChange,
  placeholder,
  readOnly = false,
  rows = 16,
  spellCheck = false,
}: {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  rows?: number;
  spellCheck?: boolean;
}) {
  return (
    <textarea
      value={value}
      readOnly={readOnly}
      rows={rows}
      spellCheck={spellCheck}
      placeholder={placeholder}
      onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange?.(event.target.value)}
      className="code-pane block w-full resize-y border-0 bg-transparent px-3 py-2.5 outline-none placeholder:text-muted/60"
    />
  );
}

/** Input pane with a label header. */
export function InputPanel({
  label,
  value,
  onChange,
  placeholder,
  rows,
  actions,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  actions?: ReactNode;
}) {
  return (
    <Panel
      label={label}
      actions={
        <>
          {actions}
          <Button size="sm" variant="ghost" onClick={() => onChange("")} disabled={!value}>
            Clear
          </Button>
        </>
      }
    >
      <CodeArea value={value} onChange={onChange} placeholder={placeholder} rows={rows} />
    </Panel>
  );
}

/** Read-only result pane with copy and optional download. */
export function OutputPanel({
  label,
  value,
  filename,
  mime,
  rows,
  actions,
  placeholder = "Output appears here",
}: {
  label: string;
  value: string;
  filename?: string;
  mime?: string;
  rows?: number;
  actions?: ReactNode;
  placeholder?: string;
}) {
  return (
    <Panel
      label={label}
      actions={
        <>
          {actions}
          {filename && <DownloadButton value={value} filename={filename} mime={mime} />}
          <CopyButton value={value} />
        </>
      }
    >
      <CodeArea value={value} readOnly rows={rows} placeholder={placeholder} />
    </Panel>
  );
}

/* ------------------------------------------------------------- annotations */

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p className="wrap-anywhere mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
      {children}
    </p>
  );
}

export function Note({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "success" | "warning";
}) {
  const tones = {
    muted: "border-border bg-surface-muted text-muted",
    success: "border-success/30 bg-success/10 text-success",
    warning: "border-warning/30 bg-warning/10 text-warning",
  } as const;
  return (
    <p className={`mt-3 rounded-lg border px-3 py-2 text-sm ${tones[tone]}`}>{children}</p>
  );
}

export function StatGrid({
  stats,
}: {
  stats: { label: string; value: ReactNode; hint?: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl border border-border bg-surface p-3">
          <div className="text-xs font-medium text-muted">{stat.label}</div>
          <div className="mt-1 font-mono text-xl font-semibold">{stat.value}</div>
          {stat.hint && <div className="mt-0.5 text-xs text-muted">{stat.hint}</div>}
        </div>
      ))}
    </div>
  );
}

/** Horizontal meter used for pixel-width and strength indicators. */
export function Meter({
  label,
  value,
  max,
  display,
  tone = "accent",
}: {
  label: string;
  value: number;
  max: number;
  display?: string;
  tone?: "accent" | "success" | "warning" | "danger";
}) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0);
  const tones = {
    accent: "bg-accent",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  } as const;
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-muted">{label}</span>
        <span className="font-mono">{display ?? `${Math.round(value)} / ${max}`}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-muted">
        <div className={`h-full rounded-full transition-all ${tones[tone]}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- file input */

export interface DroppedFile {
  file: File;
  id: string;
}

export function FileDrop({
  onFiles,
  accept = "*/*",
  multiple = true,
  hint = "Drag files here, or click to browse",
}: {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  hint?: string;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const files = Array.from(event.dataTransfer.files);
    if (files.length) onFiles(files);
  };

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={hint}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-12 text-center transition ${
        dragging
          ? "border-accent bg-accent-soft"
          : "border-border bg-surface-muted hover:border-accent/60"
      }`}
    >
      <span className="text-2xl" aria-hidden>
        ⬆
      </span>
      <span className="text-sm font-medium">{hint}</span>
      <span className="text-xs text-muted">Files never leave your device</span>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length) onFiles(files);
          // Reset so picking the same file twice still fires a change event.
          event.target.value = "";
        }}
      />
    </div>
  );
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const size = bytes / Math.pow(1024, index);
  return `${size >= 10 || index === 0 ? Math.round(size) : size.toFixed(1)} ${units[index]}`;
}

/* --------------------------------------------------------------- utilities */

/** Debounce a rapidly-changing value — used where a tool does heavy work per keystroke. */
export function useDebounced<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/**
 * Marks the point after hydration. Tools that generate random values or read the
 * clock must not do so during the server render — the server and client would
 * disagree and React would report a hydration mismatch. Gate that work on this.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // A one-shot post-hydration flag is exactly what this needs to be; there is
    // no render-phase equivalent that agrees between server and client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return mounted;
}
