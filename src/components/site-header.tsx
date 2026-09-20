import Link from "next/link";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/tools";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span
            aria-hidden
            className="grid size-7 place-items-center rounded-lg bg-accent font-mono text-sm text-accent-fg"
          >
            T
          </span>
          <span>Toolkit</span>
        </Link>

        <nav aria-label="Categories" className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
          {CATEGORY_ORDER.map((category) => (
            <Link
              key={category}
              href={`/tools#${category}`}
              className="text-muted transition hover:text-foreground"
            >
              {CATEGORIES[category].label}
            </Link>
          ))}
          <Link href="/blog" className="text-muted transition hover:text-foreground">
            Blog
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/tools"
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-surface-muted"
          >
            All tools
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
