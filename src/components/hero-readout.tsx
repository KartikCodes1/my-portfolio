"use client";

import { useEffect, useRef, useState } from "react";

const toUnit = (value: number) => Math.min(1, Math.max(0, value)).toFixed(2);

/** Status panel in the hero. Static rows come from the server; the cursor row tracks the pointer. */
export function HeroReadout({ handle, rows }: { handle: string; rows: { label: string; value: string }[] }) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Formatted strings, so React skips renders when the rounded value hasn't changed.
  const [x, setX] = useState<string | null>(null);
  const [y, setY] = useState<string | null>(null);

  useEffect(() => {
    const section = panelRef.current?.closest("section");
    if (!section) return;

    let raf = 0;
    let clientX = 0;
    let clientY = 0;

    const update = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      setX(toUnit((clientX - rect.left) / rect.width));
      setY(toUnit((clientY - rect.top) / rect.height));
    };
    const onPointer = (event: PointerEvent) => {
      clientX = event.clientX;
      clientY = event.clientY;
      if (!raf) raf = requestAnimationFrame(update);
    };

    section.addEventListener("pointermove", onPointer, { passive: true });
    section.addEventListener("pointerdown", onPointer, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      section.removeEventListener("pointermove", onPointer);
      section.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  return (
    <div ref={panelRef} className="panel bg-surface/70 font-mono text-xs backdrop-blur-md">
      <div aria-hidden className="flex h-10 items-center justify-between gap-4 border-b border-line px-4">
        <span className="flex min-w-0 items-center gap-2 text-muted">
          <span className="size-1.5 shrink-0 rounded-full bg-accent" />
          <span className="truncate">{handle}@control-plane</span>
        </span>
        <span className="text-subtle">live</span>
      </div>
      <dl className="grid gap-2.5 p-4 leading-5">
        {rows.map((row) => (
          <div key={row.label} className="flex gap-4">
            <dt className="w-14 shrink-0 text-subtle">{row.label}</dt>
            <dd className="min-w-0 text-fg">{row.value}</dd>
          </div>
        ))}
        {/* Live coordinates are noise for screen readers: the whole row is hidden from the a11y tree. */}
        <div aria-hidden className="flex gap-4">
          <dt className="w-14 shrink-0 text-subtle">cursor</dt>
          <dd className="flex gap-3 text-fg tabular-nums">
            {x === null ? (
              <span className="text-subtle">idle</span>
            ) : (
              <>
                <span className="min-w-[6ch]">x {x}</span>
                <span>y {y}</span>
              </>
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}
