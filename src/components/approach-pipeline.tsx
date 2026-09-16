"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import type { approach } from "@/content/site";

type Stage = (typeof approach.stages)[number];

const PANEL_ID = "approach-panel";
const tabId = (stage: Stage) => `approach-tab-${stage.id}`;
const pad = (n: number) => String(n).padStart(2, "0");

// Entrance for re-mounted panel content. @starting-style (Tailwind `starting:`) gives the
// exact 8px / 450ms offset without a new keyframe; reduced motion is zeroed globally.
const ENTER =
  "transition-[opacity,translate] duration-450 ease-out-expo starting:translate-y-2 starting:opacity-0";

export function ApproachPipeline({ stages }: { stages: readonly Stage[] }) {
  const [active, setActive] = useState(0);
  // Announced only for Previous/Next; arrow keys already announce the focused tab.
  const [announcement, setAnnouncement] = useState("");

  const last = stages.length - 1;
  const stage = stages[active];
  const isLast = active === last;

  function choose(index: number) {
    setActive(index);
    // Clear, so a later Previous/Next to the same stage changes the text and is announced again.
    setAnnouncement("");
  }

  function selectTab(index: number) {
    choose(index);
    document.getElementById(tabId(stages[index]))?.focus();
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const keyTargets: Record<string, number> = {
      ArrowRight: active === last ? 0 : active + 1,
      ArrowLeft: active === 0 ? last : active - 1,
      Home: 0,
      End: last,
    };
    const next = keyTargets[event.key];
    if (next === undefined) return;
    event.preventDefault();
    selectTab(next);
  }

  function step(index: number) {
    setActive(index);
    setAnnouncement(`Stage ${index + 1} of ${stages.length}: ${stages[index].name}`);
  }

  return (
    <div className="mt-16 md:mt-24">
      <div className="relative">
        {/* Base track and progress fill run from the first node's centre to the last's. */}
        <div aria-hidden className="absolute inset-x-[10%] top-[18.5px] h-px bg-line-strong" />
        <div
          aria-hidden
          className="absolute inset-x-[10%] top-[18.5px] h-px origin-left bg-accent transition-transform duration-600 ease-out-expo"
          style={{ transform: `scaleX(${last === 0 ? 0 : active / last})` }}
        />
        {/* Dotted continuation from the last node to the loop glyph. */}
        <div aria-hidden className="absolute top-3 right-0 left-[90%] hidden h-3.5 items-center md:flex">
          <span className="h-0 flex-1 border-t-2 border-dotted border-line-strong" />
          <span title={`Loops back to ${stages[0].name}`} className="pl-2 font-mono text-sm leading-none text-subtle">
            ↺
          </span>
        </div>

        <div
          role="tablist"
          aria-label="Approach stages"
          aria-orientation="horizontal"
          onKeyDown={onTabKeyDown}
          className="relative grid grid-cols-5"
        >
          {stages.map((s, i) => {
            const selected = i === active;
            const index = pad(i + 1);
            return (
              <button
                key={s.id}
                id={tabId(s)}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={PANEL_ID}
                aria-label={`${index} ${s.name}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => choose(i)}
                className="group flex min-h-11 flex-col items-center gap-3 rounded-md pt-3 pb-2"
              >
                <span
                  aria-hidden
                  className={`size-3.5 rounded-full border transition-colors duration-300 ${
                    selected
                      ? "border-accent bg-accent"
                      : i < active
                        ? "border-muted bg-muted group-hover:border-fg group-hover:bg-fg group-focus-visible:border-fg group-focus-visible:bg-fg"
                        : "border-line-strong bg-bg group-hover:border-muted group-focus-visible:border-muted"
                  }`}
                />
                <span className="flex flex-col items-center gap-1">
                  <span
                    className={`font-mono text-xs tabular-nums transition-colors duration-300 ${
                      selected ? "text-accent" : "text-subtle"
                    }`}
                  >
                    {index}
                  </span>
                  <span
                    className={`sr-only text-sm transition-colors duration-300 sm:not-sr-only ${
                      selected ? "text-fg" : "text-muted group-hover:text-fg group-focus-visible:text-fg"
                    }`}
                  >
                    {s.name}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        id={PANEL_ID}
        role="tabpanel"
        aria-labelledby={tabId(stage)}
        tabIndex={0}
        className="panel mt-10 grid gap-8 p-6 md:mt-14 md:grid-cols-12 md:grid-rows-[auto_1fr] md:p-10"
      >
        {/* Keyed blocks re-mount per stage so the entrance plays; the controls stay mounted to keep focus. */}
        <div key={`${stage.id}-intro`} className={`md:col-span-5 md:col-start-1 md:row-start-1 ${ENTER}`}>
          <p className="eyebrow">
            <span aria-hidden>
              <span className="text-fg">{pad(active + 1)}</span> / {pad(stages.length)}
            </span>
            <span className="sr-only">
              Stage {active + 1} of {stages.length}
            </span>
          </p>
          <h3 className="text-title mt-4">
            {stage.name}
          </h3>
          <p className="text-lede mt-4 max-w-[42ch]">{stage.summary}</p>
        </div>

        <div key={`${stage.id}-detail`} className={`flex flex-col gap-6 md:col-span-7 md:col-start-6 md:row-span-2 md:row-start-1 ${ENTER}`}>
          <div>
            <h4 className="eyebrow">What I do</h4>
            <ul className="mt-4 space-y-3">
              {stage.doing.map((item) => (
                <li key={item} className="flex gap-3 text-[15px] leading-6 text-fg/90">
                  <span aria-hidden className="mt-2.5 size-1 shrink-0 rounded-full bg-subtle" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-line pt-6">
            <h4 className="eyebrow">What you get</h4>
            <ul className="mt-4 flex flex-wrap gap-2">
              {stage.output.map((item) => (
                <li
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-1 font-mono text-xs text-muted"
                >
                  <FileGlyph />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-line pt-6">
            <h4 className="eyebrow">The question I keep asking</h4>
            <blockquote className="mt-4 border-l-2 border-line-strong pl-5 text-xl leading-snug text-pretty text-fg">
              <p>&ldquo;{stage.question}&rdquo;</p>
            </blockquote>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-line pt-6 md:col-span-5 md:col-start-1 md:row-start-2 md:self-end md:border-0 md:pt-0">
          <StepButton disabled={active === 0} onClick={() => step(active - 1)}>
            <span aria-hidden>←</span> Previous
          </StepButton>
          <StepButton onClick={() => step(isLast ? 0 : active + 1)}>
            {isLast ? (
              <>
                <span aria-hidden>↺</span> Back to {stages[0].name}
              </>
            ) : (
              <>
                Next <span aria-hidden>→</span>
              </>
            )}
          </StepButton>
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}

/**
 * aria-disabled instead of `disabled`: a natively disabled button drops keyboard focus
 * the moment Previous reaches the first stage.
 */
function StepButton({
  disabled = false,
  onClick,
  children,
}: {
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className="inline-flex h-10 items-center gap-2 rounded-md border border-line-strong px-3 font-mono text-xs whitespace-nowrap text-muted transition-colors duration-200 ease-out-expo hover:border-muted hover:text-fg focus-visible:border-muted focus-visible:text-fg aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:border-line-strong aria-disabled:hover:text-muted aria-disabled:focus-visible:border-line-strong aria-disabled:focus-visible:text-muted"
    >
      {children}
    </button>
  );
}

function FileGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-3 shrink-0 text-subtle">
      <path d="M3 1.5h3.75L9.5 4.25V10.5h-6.5z" strokeLinejoin="round" />
      <path d="M6.75 1.5v2.75H9.5" strokeLinejoin="round" />
    </svg>
  );
}
