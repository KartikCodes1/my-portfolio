import { Fragment, type ReactNode } from "react";
import type { TraceKind, TraceNode } from "@/content/projects";

/** One packet crosses every connector once per loop, whatever the node count. */
const LOOP_SECONDS = 2.4;

const GLYPHS: Record<TraceKind, ReactNode> = {
  client: <circle cx="5" cy="5" r="3.9" />,
  service: <rect x="1.1" y="1.1" width="7.8" height="7.8" rx="1" />,
  ai: <path d="M5 .6 9.4 5 5 9.4.6 5Z" fill="currentColor" stroke="none" />,
  queue: <path d="M1 2.25h8M1 5h8M1 7.75h8" />,
  store: (
    <>
      <ellipse cx="5" cy="2.6" rx="3.6" ry="1.6" />
      <path d="M1.4 2.6v4.8c0 .9 1.6 1.6 3.6 1.6s3.6-.7 3.6-1.6V2.6" />
    </>
  ),
  infra: <path d="M5 .8 8.8 3v4.4L5 9.6 1.2 7.4V3Z" />,
};

function KindGlyph({ kind }: { kind: TraceKind }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      className="size-2.5 shrink-0 text-subtle"
    >
      {GLYPHS[kind]}
    </svg>
  );
}

/**
 * Keyframe percentages depend on the segment count (each packet owns 1/segments of the loop),
 * so the CSS is generated per count. Connectors run vertically below `lg` and horizontally above.
 */
function packetCss(segments: number) {
  const at = (fraction: number) => `${((100 / segments) * fraction).toFixed(3)}%`;
  const frames = (axis: "X" | "Y") =>
    `@keyframes trace-${axis}-${segments}{0%{transform:translate${axis}(0);opacity:0}` +
    `${at(0.2)},${at(0.8)}{opacity:1}${at(1)},100%{transform:translate${axis}(100%);opacity:0}}`;
  const packet = `.trace-packet-${segments}`;
  return (
    frames("Y") +
    frames("X") +
    `${packet}{animation:trace-Y-${segments} ${LOOP_SECONDS}s cubic-bezier(.65,0,.35,1) infinite}` +
    `@media (min-width: 64rem){${packet}{animation-name:trace-X-${segments}}}` +
    `@media (prefers-reduced-motion: reduce){${packet}{display:none}}`
  );
}

/**
 * Request trace figure: nodes left → right (stacked on small screens).
 * `active` runs the packet animation; pass the disclosure's open state so it only runs while visible.
 */
export function TraceDiagram({ nodes, caption, active }: { nodes: TraceNode[]; caption: string; active: boolean }) {
  const segments = nodes.length - 1;
  const kinds = [...new Set(nodes.map((node) => node.kind))];
  const description = nodes.map((node) => (node.detail ? `${node.label} (${node.detail})` : node.label)).join(", then ");

  return (
    <figure className="rounded-xl border border-line">
      <figcaption className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2.5 border-b border-line px-4 py-3 md:px-5">
        <span className="eyebrow">{caption}</span>
        <span className="sr-only">{`. Flow: ${description}.`}</span>
        <span aria-hidden className="flex flex-wrap gap-x-4 gap-y-1.5">
          {kinds.map((kind) => (
            <span key={kind} className="flex items-center gap-1.5 font-mono text-[11px] leading-4 text-subtle">
              <KindGlyph kind={kind} />
              {kind}
            </span>
          ))}
        </span>
      </figcaption>

      {/* Visual only; the figcaption carries the text equivalent. */}
      <div aria-hidden className="flex flex-col p-4 md:p-5 lg:flex-row">
        {nodes.map((node, i) => (
          <Fragment key={`${i}-${node.label}`}>
            {i > 0 && (
              // Vertical: 1px line centred under the glyph (1px border + 12px padding + 5px half-glyph).
              <div className="relative ml-[17.5px] h-5 w-px shrink-0 bg-line-strong lg:ml-0 lg:h-px lg:w-6 lg:self-center xl:w-8">
                {active && (
                  <span
                    className={`trace-packet-${segments} absolute inset-0 opacity-0`}
                    style={{ animationDelay: `${((i - 1) * LOOP_SECONDS) / segments}s` }}
                  >
                    <span className="absolute left-1/2 top-0 size-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent lg:left-0 lg:top-1/2" />
                  </span>
                )}
              </div>
            )}
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-0.5 rounded-lg border border-line bg-surface px-3 py-2.5 lg:flex-1 lg:basis-0 lg:flex-col lg:flex-nowrap lg:items-start lg:justify-start">
              <span className="flex min-w-0 items-center gap-2">
                <KindGlyph kind={node.kind} />
                <span className="text-sm leading-5 break-words text-fg">{node.label}</span>
              </span>
              {node.detail && (
                <span className="ml-auto font-mono text-[11px] leading-4 break-words text-subtle lg:ml-0 lg:pl-[18px] lg:text-pretty">
                  {node.detail}
                </span>
              )}
            </div>
          </Fragment>
        ))}
      </div>

      {segments > 0 && (
        // React 19 hoists this into <head> and dedupes it by href across every figure.
        <style href={`trace-packet-${segments}`} precedence="default">
          {packetCss(segments)}
        </style>
      )}
    </figure>
  );
}
