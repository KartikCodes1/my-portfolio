import { about, profile } from "@/content/site";
import { SectionHeading } from "@/components/section-heading";

/** Editor-style line number. Purely visual, so hidden from assistive tech and selection. */
function LineNumber({ n }: { n: number }) {
  return (
    <span aria-hidden className="mr-4 w-5 shrink-0 select-none text-right tabular-nums text-subtle/60">
      {n}
    </span>
  );
}

export function About() {
  const [lead, ...rest] = about.paragraphs;
  const fileName = `~/.config/${profile.handle}.yaml`;
  // Comments get their own line above the key, like hand-written YAML, so they never wrap mid-phrase.
  let line = 0;
  const config = about.config.map((entry) => ({
    ...entry,
    commentLine: entry.comment ? ++line : 0,
    line: ++line,
  }));
  const offHoursLine = line + 1;
  const caretLine = offHoursLine + about.offHours.length + 1;

  return (
    <section id="about" aria-labelledby="about-title" tabIndex={-1} className="border-t border-line py-24 outline-none md:py-36">
      <div className="shell">
        <SectionHeading section="about" title={about.title} />

        {/* gap-x-8 matches SectionHeading's grid so column 4 lines up exactly. */}
        <div className="mt-14 grid gap-y-10 md:mt-20 md:grid-cols-12 md:gap-x-8">
          {/* col-start repeated at lg: a col-span utility resets grid-column-start. */}
          <div className="reveal md:col-span-9 md:col-start-4 lg:col-span-5 lg:col-start-4">
            <div className="space-y-6">
              <p className="text-lg leading-relaxed text-pretty text-fg md:text-xl">{lead}</p>
              {rest.map((paragraph) => (
                <p key={paragraph} className="text-[15px] leading-relaxed text-pretty text-muted">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-12">
              <p id="about-off-hours" className="eyebrow">
                Off hours
              </p>
              <ul role="list" aria-labelledby="about-off-hours" className="mt-4 flex flex-wrap gap-y-1 text-muted">
                {about.offHours.map((item, i) => (
                  <li key={item} className="whitespace-nowrap">
                    {item}
                    {i < about.offHours.length - 1 && (
                      <span aria-hidden className="mx-2.5 text-subtle">
                        /
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <figure className="reveal panel self-start overflow-hidden md:col-span-7 md:col-start-4 lg:col-span-4 lg:col-start-9">
            <figcaption className="flex items-center justify-between gap-4 border-b border-line px-4 py-2.5 font-mono text-xs text-subtle">
              <span className="truncate">{fileName}</span>
              <span aria-hidden>yaml</span>
            </figcaption>

            <div className="p-4 font-mono text-[13px] leading-7">
              <dl>
                {config.map((entry) => (
                  // Grid placement shows the comment above the key while dt/dd stay valid dl children.
                  <div key={entry.key} className="grid grid-cols-[auto_1fr]">
                    <dt className="row-start-2 flex text-muted">
                      <LineNumber n={entry.line} />
                      {entry.key}
                      <span aria-hidden>:</span>
                    </dt>
                    <dd className="contents">
                      {entry.comment && (
                        <span className="col-span-2 row-start-1 flex text-subtle">
                          <LineNumber n={entry.commentLine} />
                          <span aria-hidden>#&nbsp;</span>
                          <span className="min-w-0">{entry.comment}</span>
                        </span>
                      )}
                      <span className="row-start-2 min-w-0 pl-[1ch] text-fg">{entry.value}</span>
                    </dd>
                  </div>
                ))}

                <div>
                  <dt className="flex text-muted">
                    <LineNumber n={offHoursLine} />
                    off_hours
                    <span aria-hidden>:</span>
                  </dt>
                  <dd>
                    <ul role="list">
                      {about.offHours.map((item, i) => (
                        <li key={item} className="flex">
                          <LineNumber n={offHoursLine + 1 + i} />
                          <span className="min-w-0 pl-[2ch] text-fg">
                            <span aria-hidden className="text-subtle">
                              -
                            </span>{" "}
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </dl>

              <div aria-hidden className="flex items-center">
                <LineNumber n={caretLine} />
                <span className="h-4 w-2 animate-[blink_1s_steps(1)_infinite] bg-muted" />
              </div>
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
