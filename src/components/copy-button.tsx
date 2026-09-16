"use client";

import { useEffect, useRef, useState } from "react";
import { copyText } from "@/lib/ui-events";

type CopyState = "idle" | "copied" | "failed";

const RESET_MS = 2000;

const icons: Record<CopyState, React.ReactNode> = {
  idle: (
    <>
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
      <path d="M10.5 5.5v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" />
    </>
  ),
  copied: <path d="M3.5 8.5l3 3 6-7" />,
  failed: <path d="M4.5 4.5l7 7m0-7l-7 7" />,
};

/**
 * Copies `text` to the clipboard.
 * The visible label changes for sighted users; a separate polite status region
 * announces the result, since button text changes aren't reliably read out.
 */
export function CopyButton({ text }: { text: string }) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    const ok = await copyText(text);
    setState(ok ? "copied" : "failed");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), RESET_MS);
  }

  const visible = state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : "Copy";

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className="relative z-10 inline-flex min-h-10 min-w-28 items-center justify-center gap-2 rounded-md border border-line-strong px-3.5 font-mono text-xs text-muted transition-colors duration-200 ease-out-expo hover:border-fg/30 hover:text-fg focus-visible:text-fg data-[state=copied]:text-fg"
        data-state={state}
      >
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`size-3.5 shrink-0 ${state === "copied" ? "text-accent" : ""}`}
        >
          {icons[state]}
        </svg>
        {visible}
        <span className="sr-only"> {text}</span>
      </button>
      <span role="status" className="sr-only">
        {state === "copied" ? `Copied ${text} to clipboard` : state === "failed" ? "Copy failed" : ""}
      </span>
    </>
  );
}
