import Link from "next/link";
import type { Tool } from "@/lib/tools";

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex flex-col rounded-xl border border-border bg-surface p-4 transition hover:border-accent hover:shadow-sm"
    >
      <h3 className="font-semibold tracking-tight transition group-hover:text-accent">
        {tool.name}
      </h3>
      <p className="mt-1.5 text-sm text-muted">{tool.tagline}</p>
    </Link>
  );
}
