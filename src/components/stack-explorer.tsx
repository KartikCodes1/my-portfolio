"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { stack } from "@/content/site";
import { openProject } from "@/lib/ui-events";

type Layer = (typeof stack.layers)[number];
type Tool = Layer["tools"][number];
type Selection = { layer: number; tool: number };
type ProjectTitles = Record<string, { title: string; draft: boolean }>;

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function StackExplorer({
  layers,
  projectTitles,
}: {
  layers: readonly Layer[];
  projectTitles: ProjectTitles;
}) {
  // Selection starts on the first tool of the top layer.
  const [selected, setSelected] = useState<Selection>({ layer: 0, tool: 0 });
  const toolCount = layers.reduce((n, layer) => n + layer.tools.length, 0);

  // On mobile the inline inspector moves between bands, which changes the height of
  // everything above the tapped chip. Keep the chip where the user's finger was.
  const anchor = useRef<{ el: HTMLElement; top: number } | null>(null);
  useLayoutEffect(() => {
    const a = anchor.current;
    anchor.current = null;
    if (!a) return;
    const delta = a.el.getBoundingClientRect().top - a.top;
    if (Math.abs(delta) > 1) window.scrollBy({ top: delta, behavior: "instant" });
  }, [selected]);

  const select = (next: Selection, el: HTMLElement) => {
    if (next.layer === selected.layer && next.tool === selected.tool) return;
    anchor.current = { el, top: el.getBoundingClientRect().top };
    setSelected(next);
  };

  const activeLayer = layers[selected.layer];
  const activeTool = activeLayer?.tools[selected.tool];
  if (!activeLayer || !activeTool) return null;

  const inspector = (
    <Inspector
      layer={activeLayer}
      layerIndex={selected.layer}
      tool={activeTool}
      projectTitles={projectTitles}
    />
  );

  return (
    <div className="mt-16 md:mt-24">
      <div className="eyebrow mb-5 flex items-center justify-between gap-4">
        <p>
          {layers.length} layers <span aria-hidden>·</span>
          <span className="sr-only">,</span> {toolCount} tools
        </p>
        <p aria-hidden className="hidden md:block">
          select a tool to inspect
        </p>
      </div>

      {/* One always-mounted live region: the inspector itself moves between bands on mobile,
          and a region inserted with content already in it isn't announced. */}
      <p aria-live="polite" className="sr-only">
        {`${activeTool.name}: ${activeTool.note}`}
      </p>

      <div className="grid gap-8 md:grid-cols-12">
        <ol aria-label="Stack layers, closest to the user first" className="md:col-span-8">
          {layers.map((layer, l) => {
            const isActive = l === selected.layer;
            const isFirst = l === 0;
            const isLast = l === layers.length - 1;
            const headingId = `stack-layer-${layer.id}`;

            return (
              <li
                key={layer.id}
                className={`relative border-t border-line px-4 py-6 transition-colors duration-300 ease-out-expo last:border-b md:pr-6 md:pl-10 ${
                  isActive ? "bg-surface/50" : ""
                }`}
              >
                {/* Selection rail on the band's left edge. */}
                <span
                  aria-hidden
                  className={`absolute inset-y-0 left-0 w-0.5 origin-top bg-accent transition-transform duration-500 ease-out-expo ${
                    isActive ? "scale-y-100" : "scale-y-0"
                  }`}
                />
                {/* System rail: one continuous 1px line through a node per layer (md+). */}
                <span
                  aria-hidden
                  className={`absolute left-5 hidden w-px bg-line-strong md:block ${isFirst ? "top-8" : "top-0"} ${
                    isLast ? "h-8" : "bottom-0"
                  }`}
                />
                <span
                  aria-hidden
                  className={`absolute top-8 left-5 hidden size-[7px] -translate-x-[3px] -translate-y-1/2 rounded-full border transition-colors duration-300 md:block ${
                    isActive ? "border-accent bg-accent" : "border-line-strong bg-bg"
                  }`}
                />

                {/* Side-by-side only where the 8-column list leaves the chips enough room (not at tablet widths). */}
                <div className="grid gap-4 sm:grid-cols-[14rem_1fr] md:grid-cols-1 lg:grid-cols-[14rem_1fr]">
                  <div>
                    <p
                      aria-hidden
                      className={`font-mono text-xs leading-4 tabular-nums transition-colors duration-300 ${
                        isActive ? "text-accent" : "text-subtle"
                      }`}
                    >
                      L{l + 1}
                    </p>
                    <h3 id={headingId} className="mt-3 font-medium text-fg">
                      <span className="sr-only">Layer {l + 1}: </span>
                      {layer.name}
                    </h3>
                    <p className="mt-1 text-sm text-subtle text-pretty">{layer.blurb}</p>
                  </div>

                  <div className="min-w-0">
                    <ul aria-labelledby={headingId} className="flex flex-wrap gap-2">
                      {layer.tools.map((tool, t) => {
                        const pressed = isActive && t === selected.tool;
                        return (
                          <li key={tool.name}>
                            <button
                              type="button"
                              aria-pressed={pressed}
                              onClick={(e) => select({ layer: l, tool: t }, e.currentTarget)}
                              className={`inline-flex min-h-9 items-center gap-2 rounded-md border px-3 py-1.5 text-left font-sans text-sm transition-colors duration-150 ease-out-expo pointer-coarse:min-h-10 ${
                                pressed
                                  ? "border-accent/60 bg-accent-soft text-fg"
                                  : "border-line text-muted hover:border-line-strong hover:text-fg focus-visible:border-line-strong focus-visible:text-fg"
                              }`}
                            >
                              {pressed && <span aria-hidden className="size-[5px] shrink-0 rounded-full bg-accent" />}
                              {tool.name}
                            </button>
                          </li>
                        );
                      })}
                    </ul>

                    {/* Mobile: the result appears where the user tapped. display:none on md+. */}
                    {isActive && <div className="mt-5 md:hidden">{inspector}</div>}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Desktop: sticky side inspector. display:none below md, so only one instance is ever exposed. */}
        <div className="hidden md:sticky md:top-24 md:col-span-4 md:block md:self-start">{inspector}</div>
      </div>
    </div>
  );
}

function Inspector({
  layer,
  layerIndex,
  tool,
  projectTitles,
}: {
  layer: Layer;
  layerIndex: number;
  tool: Tool;
  projectTitles: ProjectTitles;
}) {
  const slug = slugify(tool.name);
  const used = tool.projects.filter((id) => id in projectTitles);

  return (
    <section aria-label="Tool inspector" className="panel overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3 font-mono text-xs">
        <span className="shrink-0 text-muted">inspector</span>
        <span className="min-w-0 truncate text-subtle" title={`stack/${layer.id}/${slug}`}>
          stack/{layer.id}/{slug}
        </span>
      </div>

      <div className="p-5 md:p-6">
        <div key={`${layer.id}/${slug}`} className="motion-safe:animate-[reveal_350ms_var(--ease-out-expo)_both]">
          <p className="eyebrow">
            L{layerIndex + 1} <span aria-hidden>·</span> {layer.name}
          </p>
          <p className="text-title mt-3 text-fg">{tool.name}</p>
          <p className="mt-4 text-[15px] leading-relaxed text-pretty text-muted">{tool.note}</p>

          <p className="eyebrow mt-8">Used in</p>
          {used.length > 0 ? (
            <ul className="mt-3 border-t border-line">
              {used.map((id) => (
                <li key={id} className="border-b border-line">
                  <button
                    type="button"
                    onClick={() => openProject(id)}
                    className="group flex min-h-11 w-full items-center justify-between gap-4 py-2.5 text-left text-sm text-muted transition-colors duration-150 hover:text-fg focus-visible:text-fg"
                  >
                    <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <span>
                        <span className="sr-only">Open case study: </span>
                        {projectTitles[id].title}
                      </span>
                      {projectTitles[id].draft && (
                        <span
                          title="Placeholder content"
                          className="rounded border border-line-strong px-1.5 font-mono text-[10px] leading-4 tracking-[0.08em] text-subtle uppercase"
                        >
                          Draft<span className="sr-only"> (placeholder content)</span>
                        </span>
                      )}
                    </span>
                    <span
                      aria-hidden
                      className="shrink-0 text-subtle transition-[color,translate] duration-300 ease-out-expo group-hover:translate-x-1 group-hover:text-fg group-focus-visible:translate-x-1 group-focus-visible:text-fg"
                    >
                      →
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-subtle">General practice, not tied to a single case study.</p>
          )}
        </div>
      </div>
    </section>
  );
}
