import { profile, sections } from "@/content/site";
import { HeroField } from "@/components/hero-field";
import { HeroPaletteHint } from "@/components/hero-palette-hint";
import { HeroReadout } from "@/components/hero-readout";

export function Hero() {
  const index = sections[0];
  // Keep the cursor glued to the last word so it never wraps onto a line of its own.
  const splitAt = profile.headline.lastIndexOf(" ") + 1;
  const headlineHead = profile.headline.slice(0, splitAt);
  const headlineTail = profile.headline.slice(splitAt);

  const readoutRows = [
    ...(profile.availability ? [{ label: "status", value: profile.availability }] : []),
    { label: "focus", value: profile.focus.join(" · ") },
    { label: "core", value: profile.coreStack.join(" / ").toLowerCase() },
  ];

  return (
    <section
      id="top"
      aria-labelledby="top-title"
      tabIndex={-1}
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden outline-none"
    >
      <HeroField />

      <div className="shell relative flex flex-1 flex-col justify-end pt-28 pb-[clamp(3rem,9svh,6rem)] md:pt-32">
        <div className="grid gap-y-8 lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-12">
            <div className="eyebrow flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              {profile.availability && (
                <>
                  <p className="flex items-center gap-2.5 text-muted">
                    <span
                      aria-hidden
                      className="size-1.5 shrink-0 rounded-full bg-accent animate-[pulse-dot_2.4s_ease-out_infinite]"
                    />
                    {profile.availability}
                  </p>
                  <span aria-hidden className="hidden size-[3px] shrink-0 rounded-full bg-subtle sm:block" />
                </>
              )}
              <p className="text-balance">
                {profile.name} / {profile.role}
              </p>
            </div>

            <h1 id="top-title" className="text-display mt-7 max-w-[16ch] md:mt-9">
              {headlineHead}
              <span className="whitespace-nowrap">
                {headlineTail}
                <span
                  aria-hidden
                  className="ml-[0.06em] inline-block h-[0.8em] w-[0.08em] bg-accent animate-[blink_1.1s_steps(1)_infinite]"
                />
              </span>
            </h1>
          </div>

          <div className="lg:col-span-8">
            <p className="text-lede max-w-[56ch]">{profile.lede}</p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#work"
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 font-medium text-accent-ink transition-colors duration-300 ease-out-expo hover:bg-accent/90"
              >
                View selected work
                <svg
                  aria-hidden
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-[3px] group-focus-visible:translate-x-[3px]"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </a>
              <a
                href="#contact"
                className="inline-flex h-11 items-center justify-center rounded-full border border-line-strong px-5 font-medium text-fg transition-colors duration-300 ease-out-expo hover:bg-surface-2 focus-visible:bg-surface-2"
              >
                Get in touch
              </a>
              <HeroPaletteHint />
            </div>
          </div>

          <div className="mt-6 lg:col-span-4 lg:col-start-9 lg:mt-0 lg:self-end">
            <HeroReadout handle={profile.handle} rows={readoutRows} />
          </div>
        </div>
      </div>

      <div aria-hidden className="relative border-t border-line">
        <div className="shell eyebrow flex h-14 items-center justify-between">
          <span className="flex items-center gap-3">
            {/* Reuses the global `reveal` keyframes in reverse: a short segment drips down and fades.
                Under reduced motion the animation collapses and the segment rests at the top. */}
            <span className="relative h-6 w-px overflow-hidden bg-line">
              <span className="absolute inset-x-0 top-0 h-2 bg-muted animate-[reveal_2.4s_ease-in-out_infinite_reverse]" />
            </span>
            scroll
          </span>
          <span>
            {index.index} / {index.label}
          </span>
        </div>
      </div>
    </section>
  );
}
