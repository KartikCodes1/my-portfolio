"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { CommandPalette } from "@/components/command-palette";
import { Terminal } from "@/components/terminal";
import { TOAST_EVENT } from "@/lib/toast";
import { emit } from "@/lib/ui-events";

type Panel = "palette" | "terminal" | null;
type Toast = { id: number; message: string };

const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
const TOAST_MS = 2800;

const isEditable = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || target.matches("input, textarea, select"));

/** Global keyboard shortcuts, x-ray mode, and toasts. Rendered once, in the root layout. */
export function AppShell() {
  const [panel, setPanel] = useState<Panel>(null);
  const [xray, setXray] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    let recentKeys: string[] = [];
    let toastId = 0;

    const showToast = (message: string) => setToast({ id: ++toastId, message });

    const toggleXray = () => {
      // The DOM attribute is the source of truth; state only drives the overlay.
      const root = document.documentElement;
      const on = !("xray" in root.dataset);
      if (on) root.dataset.xray = "";
      else delete root.dataset.xray;
      setXray(on);
      showToast(on ? "X-ray on." : "X-ray off.");
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // Shortcuts always carry a modifier (WCAG 2.1.4), so they also work from inside the dialogs' inputs.
      if ((e.metaKey || e.ctrlKey) && !e.altKey && key === "k") {
        e.preventDefault();
        if (!e.repeat) setPanel((p) => (p === "palette" ? null : "palette"));
        return;
      }
      // Ctrl on every platform: macOS reserves Cmd+` for switching windows.
      if (e.ctrlKey && !e.metaKey && !e.altKey && key === "`") {
        e.preventDefault();
        if (!e.repeat) setPanel((p) => (p === "terminal" ? null : "terminal"));
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented || isEditable(e.target)) return;
      if (key === "shift" || key === "capslock") return; // so "B A" typed as capitals still counts

      // Rolling window instead of a step counter: extra leading presses (↑↑↑…) still match.
      recentKeys = [...recentKeys, key].slice(-KONAMI.length);
      if (recentKeys.join() === KONAMI.join()) {
        recentKeys = [];
        toggleXray();
      }
    };

    const openPalette = () => setPanel("palette");
    const openTerminal = () => setPanel("terminal");
    const onToast = (e: Event) => showToast((e as CustomEvent<string>).detail);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("ui:palette-open", openPalette);
    window.addEventListener("ui:terminal-open", openTerminal);
    window.addEventListener("ui:xray-toggle", toggleXray);
    window.addEventListener(TOAST_EVENT, onToast);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("ui:palette-open", openPalette);
      window.removeEventListener("ui:terminal-open", openTerminal);
      window.removeEventListener("ui:xray-toggle", toggleXray);
      window.removeEventListener(TOAST_EVENT, onToast);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  // A dialog reports its own close (Escape, backdrop, action). Only clear the panel if it's
  // still the one showing: a close can land after the user already switched to the other.
  const closePalette = useCallback(() => setPanel((p) => (p === "palette" ? null : p)), []);
  const closeTerminal = useCallback(() => setPanel((p) => (p === "terminal" ? null : p)), []);

  return (
    <>
      <CommandPalette open={panel === "palette"} onClose={closePalette} />
      <Terminal open={panel === "terminal"} onClose={closeTerminal} />

      {xray && <XrayOverlay />}

      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed inset-x-0 z-[70] flex justify-center px-4 ${
          xray ? "bottom-20" : "bottom-6"
        }`}
      >
        {toast && (
          <p
            key={toast.id}
            className="panel px-4 py-2.5 font-mono text-xs text-fg shadow-lg shadow-black/40 transition-[opacity,translate] duration-300 ease-out-expo starting:translate-y-2 starting:opacity-0"
          >
            {toast.message}
          </p>
        )}
      </div>
    </>
  );
}

const subscribeResize = (onChange: () => void) => {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
};
const getViewport = () => `${window.innerWidth}×${window.innerHeight}`;
const getServerViewport = () => "";
// Mirrors the md breakpoint (48rem) used by `shell` and `md:grid-cols-12`.
const getColumns = () => (window.matchMedia("(width >= 48rem)").matches ? 12 : 4);
const getServerColumns = () => 12;

function XrayOverlay() {
  const viewport = useSyncExternalStore(subscribeResize, getViewport, getServerViewport);
  const columns = useSyncExternalStore(subscribeResize, getColumns, getServerColumns);

  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[60]">
        <div className="shell grid h-full grid-cols-4 gap-x-5 md:grid-cols-12 md:gap-x-8">
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className={`h-full border-x border-accent/15 bg-accent/[0.035] ${i >= 4 ? "hidden md:block" : ""}`}
            />
          ))}
        </div>
      </div>

      <div className="panel fixed bottom-4 left-4 z-[60] flex h-10 items-center overflow-hidden font-mono text-[11px] text-muted shadow-lg shadow-black/40">
        <p className="flex items-center gap-2 px-3">
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          <span>
            x-ray · {columns}-col grid · <span className="tabular-nums">{viewport}</span>
          </span>
        </p>
        <button
          type="button"
          onClick={() => {
            // This button unmounts with the overlay; park focus on <main> so it doesn't fall to <body>.
            document.getElementById("main")?.focus({ preventScroll: true });
            emit("ui:xray-toggle");
          }}
          className="h-full border-l border-line px-3 text-fg transition-colors hover:bg-surface-2 focus-visible:-outline-offset-2!"
        >
          exit<span className="sr-only"> x-ray mode</span>
        </button>
      </div>
    </>
  );
}
