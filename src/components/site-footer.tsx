import Link from "next/link";
import { CATEGORIES, CATEGORY_ORDER, toolsByCategory } from "@/lib/tools";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-surface-muted">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-semibold tracking-tight">
              <span
                aria-hidden
                className="grid size-7 place-items-center rounded-lg bg-accent font-mono text-sm text-accent-fg"
              >
                T
              </span>
              <span>Toolkit</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted">
              Fast, free developer and SEO tools that run entirely in your browser. No accounts, no
              uploads, no tracking.
            </p>
          </div>

          {CATEGORY_ORDER.map((category) => (
            <div key={category}>
              <h2 className="text-sm font-semibold">{CATEGORIES[category].label}</h2>
              <ul className="mt-3 space-y-1.5">
                {toolsByCategory(category)
                  .slice(0, 8)
                  .map((tool) => (
                    <li key={tool.slug}>
                      <Link
                        href={`/tools/${tool.slug}`}
                        className="text-sm text-muted transition hover:text-foreground"
                      >
                        {tool.name}
                      </Link>
                    </li>
                  ))}
                <li>
                  <Link
                    href="/tools"
                    className="text-sm font-medium text-accent transition hover:opacity-80"
                  >
                    See all →
                  </Link>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-10 border-t border-border pt-6 text-sm text-muted">
          © {new Date().getFullYear()} Toolkit. All processing happens locally in your browser.
        </p>
      </div>
    </footer>
  );
}
