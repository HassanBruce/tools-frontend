"use client";

import { useEffect, useState } from "react";

/**
 * Light/dark switch.
 *
 * Light is the default — a visitor with nothing stored gets light regardless of
 * their OS setting. Toggling writes to localStorage, so the choice survives
 * reloads and new visits.
 *
 * The attribute is applied by an inline script in the layout before first paint
 * (see THEME_SCRIPT below), so there is never a flash of the wrong theme. This
 * component only renders the control and keeps it in sync.
 */

export const THEME_KEY = "theme";

/**
 * Runs before the page paints. Deliberately tiny, dependency-free, and
 * defensive: if localStorage is unavailable (private mode, blocked storage)
 * it falls back to light rather than throwing and leaving the page unstyled.
 */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");document.documentElement.setAttribute("data-theme",t==="dark"?"dark":"light")}catch(e){document.documentElement.setAttribute("data-theme","light")}})();`;

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read what the inline script already applied, so the button starts correct.
    const current = document.documentElement.getAttribute("data-theme");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(current === "dark" ? "dark" : "light");
    setMounted(true);
  }, []);

  // Keep other tabs in step.
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== THEME_KEY) return;
      const next: Theme = event.newValue === "dark" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      setTheme(next);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const toggle = () => {
    // Read the live attribute rather than component state. Event handlers are
    // attached during hydration but the mount effect above runs *after* it, so
    // for a brief window `theme` still holds its initial value while the DOM
    // already shows the stored one. Clicking in that window would otherwise set
    // the theme it is already on, and appear to do nothing.
    const current = document.documentElement.getAttribute("data-theme");
    const next: Theme = current === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", next);
    setTheme(next);
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      // Not being able to persist is survivable — the page still switches.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      // Until mounted the label would be a guess, so describe it generically.
      aria-label={mounted ? `Switch to ${theme === "dark" ? "light" : "dark"} mode` : "Toggle theme"}
      title={mounted ? `Switch to ${theme === "dark" ? "light" : "dark"} mode` : "Toggle theme"}
      className="grid size-9 shrink-0 place-items-center rounded-lg border border-border transition hover:bg-surface-muted"
    >
      {/* Both icons are always in the DOM; CSS picks one. That keeps the button
          identical between server and client render, avoiding a hydration
          mismatch without hiding the control until JS loads. */}
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="size-4 dark:hidden"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="hidden size-4 dark:block"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    </button>
  );
}
