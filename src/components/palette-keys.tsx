"use client";

import { useIsApple } from "@/lib/use-platform";

/** ⌘ K on Apple platforms, Ctrl K elsewhere. Both shortcuts work everywhere (see AppShell). */
export function PaletteKeys() {
  const isApple = useIsApple();

  return (
    <span className="flex items-center gap-1">
      <kbd>
        {isApple ? (
          <>
            <span aria-hidden>⌘</span>
            <span className="sr-only">Command</span>
          </>
        ) : (
          "Ctrl"
        )}
      </kbd>
      <kbd>K</kbd>
    </span>
  );
}
