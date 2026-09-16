"use client";

import { PaletteKeys } from "@/components/palette-keys";
import { emit } from "@/lib/ui-events";
import { useIsApple } from "@/lib/use-platform";

/** Quiet "or press ⌘K" hint next to the hero CTAs. */
export function HeroPaletteHint() {
  const apple = useIsApple();

  return (
    <button
      type="button"
      onClick={() => emit("ui:palette-open")}
      aria-keyshortcuts={apple ? "Meta+K" : "Control+K"}
      className="hidden h-11 items-center gap-2 rounded-full px-3 text-sm text-subtle transition-colors duration-300 ease-out-expo hover:text-fg focus-visible:text-fg md:inline-flex"
    >
      or press
      <PaletteKeys />
      <span className="sr-only">to open the command palette</span>
    </button>
  );
}
