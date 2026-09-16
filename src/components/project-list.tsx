"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Project } from "@/content/projects";
import { TraceDiagram } from "@/components/trace-diagram";

const HASH_PREFIX = "#project-";

export function ProjectList({ projects }: { projects: Project[] }) {
  // The first case study starts open so its depth is visible with zero interaction.
  const [openIds, setOpenIds] = useState<string[]>(() => projects.slice(0, 1).map((p) => p.id));

  const toggle = (id: string) =>
    setOpenIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  // Deep links: the command palette and terminal set #project-<id> (see openProject in lib/ui-events).
  useEffect(() => {
    const openFromHash = (smooth: boolean) => {
      const hash = location.hash;
      // No decodeURIComponent: ids are ASCII slugs, and it throws on malformed hashes like #project-%.
      const id = hash.startsWith(HASH_PREFIX) ? hash.slice(HASH_PREFIX.length) : "";
      if (!projects.some((p) => p.id === id)) return;

      setOpenIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
      const button = document.getElementById(`project-${id}-button`);
      if (!button) return;
      const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
      // "instant", not "auto": auto would inherit html's CSS smooth scrolling.
      button.scrollIntoView({ block: "start", behavior: smooth && !reduceMotion ? "smooth" : "instant" });
      button.focus({ preventScroll: true });
    };

    // Landing on a deep link jumps like a normal anchor; in-page navigation scrolls smoothly.
    const onHashChange = () => openFromHash(true);
    openFromHash(false);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [projects]);

  return (
    <ol className="mt-16 border-b border-line md:mt-24">
      {projects.map((project, i) => (
        <ProjectItem
          key={project.id}
          project={project}
          number={String(i + 1).padStart(2, "0")}
          open={openIds.includes(project.id)}
          onToggle={() => toggle(project.id)}
        />
      ))}
    </ol>
  );
}

function ProjectItem({
  project,
  number,
  open,
  onToggle,
}: {
  project: Project;
  number: string;
  open: boolean;
  onToggle: () => void;
}) {
  const id = `project-${project.id}`;
  // Name the button (and region) by the title alone; kicker, draft state and summary become its description.
  const describedBy = [`${id}-kicker`, project.draft && `${id}-draft`, `${id}-summary`].filter(Boolean).join(" ");

  return (
    <li className="border-t border-line">
      <h3>
        <button
          type="button"
          id={`${id}-button`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          aria-labelledby={`${id}-title`}
          aria-describedby={describedBy}
          onClick={onToggle}
          // Button bleeds into the gutter so the hover band and focus ring frame the row,
          // while its padding keeps the inner 12-col grid aligned with the section heading.
          className="group relative -mx-3 grid w-[calc(100%+1.5rem)] cursor-pointer grid-cols-[1fr_auto] items-start gap-x-6 gap-y-4 px-3 py-7 text-left transition-colors duration-300 ease-out-expo hover:bg-surface/60 focus-visible:-outline-offset-2! focus-visible:bg-surface/60 md:-mx-6 md:w-[calc(100%+3rem)] md:grid-cols-12 md:gap-x-8 md:px-6 md:py-9"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 bg-accent transition-transform duration-500 ease-out-expo group-hover:scale-y-100 group-focus-visible:scale-y-100"
          />

          <span className="col-start-1 row-start-1 flex flex-wrap items-center gap-x-3 gap-y-1.5 self-center md:col-span-3 md:flex-col md:items-start md:gap-y-2 md:self-start md:pt-2">
            <span
              aria-hidden
              className="font-mono text-xs leading-4 tabular-nums text-subtle transition-colors duration-300 group-aria-expanded:text-accent"
            >
              {number}
            </span>
            <span id={`${id}-kicker`} className="eyebrow">
              {project.kicker}
            </span>
            {project.draft && (
              <span
                id={`${id}-draft`}
                title="Placeholder content"
                className="rounded border border-line-strong px-1.5 font-mono text-[10px] leading-4 tracking-[0.08em] text-subtle uppercase"
              >
                Draft<span className="sr-only"> (placeholder content)</span>
              </span>
            )}
          </span>

          <span className="col-span-2 row-start-2 block md:col-span-7 md:col-start-4 md:row-start-1">
            <span
              id={`${id}-title`}
              className="text-title block text-pretty text-fg transition-transform duration-500 ease-out-expo group-hover:translate-x-1 group-focus-visible:translate-x-1"
            >
              {project.title}
            </span>
            <span id={`${id}-summary`} className="mt-3 block max-w-[60ch] text-[15px] leading-relaxed text-pretty text-muted">
              {project.summary}
            </span>
          </span>

          <span
            aria-hidden
            className="col-start-2 row-start-1 grid size-9 place-items-center justify-self-end rounded-full border border-line-strong text-muted transition-colors duration-300 ease-out-expo group-hover:border-accent group-hover:text-accent group-focus-visible:border-accent group-focus-visible:text-accent group-aria-expanded:border-accent group-aria-expanded:text-accent md:col-span-2 md:col-start-11 md:-mt-0.5"
          >
            <span className="col-start-1 row-start-1 h-[1.5px] w-3 rounded-full bg-current" />
            <span className="col-start-1 row-start-1 h-3 w-[1.5px] rounded-full bg-current transition-transform duration-500 ease-out-expo group-aria-expanded:rotate-90 group-aria-expanded:scale-y-0" />
          </span>
        </button>
      </h3>

      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-title`}
        inert={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out-expo ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        {/* Bleeds into the gutter like the button so link focus rings aren't clipped by overflow-hidden. */}
        <div className="-mx-3 min-h-0 overflow-hidden px-3 md:-mx-6 md:px-6">
          <div className="grid pt-1 pb-12 md:grid-cols-12 md:gap-x-8 md:pb-16">
            <div className="flex flex-col gap-12 md:col-span-9 md:col-start-4 md:gap-14">
              <ProjectMeta project={project} />

              {/* Trace, decisions and stack are optional: a case study still waiting on details simply omits them. */}
              {project.trace.length > 0 && (
                <TraceDiagram nodes={project.trace} caption={`fig. ${number} · request trace`} active={open} />
              )}

              <div className="grid gap-12 md:grid-cols-9 md:gap-8">
                <div className="md:col-span-4">
                  <h4 className="eyebrow">The problem</h4>
                  <p className="mt-5 text-[15px] leading-relaxed text-pretty text-muted">{project.problem}</p>
                </div>
                <div className="md:col-span-5">
                  <h4 className="eyebrow">What I did</h4>
                  <ul className="mt-5 space-y-3">
                    {project.contribution.map((item) => (
                      <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-fg/90">
                        <span aria-hidden className="mt-2.5 size-1 shrink-0 rounded-full bg-subtle" />
                        <span className="text-pretty">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {project.decisions.length > 0 && (
                <div>
                  <h4 className="eyebrow">Decisions that mattered</h4>
                  <ol className="mt-5 grid gap-3 lg:grid-cols-3">
                    {project.decisions.map((d, i) => (
                      <li key={d.decision} className="panel p-5">
                        <span aria-hidden className="font-mono text-xs text-subtle">
                          D{i + 1}
                        </span>
                        <p className="mt-4 text-[15px] leading-snug font-medium text-pretty text-fg">{d.decision}</p>
                        <p className="mt-2 text-sm leading-relaxed text-pretty text-muted">{d.why}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {project.stack.length > 0 && (
                <div>
                  <h4 className="eyebrow">Stack</h4>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {project.stack.map((tool) => (
                      <li
                        key={tool}
                        className="rounded-md border border-line px-2 py-1 font-mono text-xs text-muted"
                      >
                        {tool}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

const hasValue = (value: string) => value.trim() !== "";

/** Period / Role / Links. Empty fields are hidden so drafts don't show a row of dashes. */
function ProjectMeta({ project }: { project: Project }) {
  const showPeriod = hasValue(project.period);
  const showRole = hasValue(project.role);
  const showLinks = project.links.length > 0 || Boolean(project.note);
  if (!showPeriod && !showRole && !showLinks) return null;

  return (
    <dl className="grid gap-3 md:grid-cols-3 md:gap-8">
      {showPeriod && <MetaItem term="Period">{project.period}</MetaItem>}
      {showRole && <MetaItem term="Role">{project.role}</MetaItem>}
      {showLinks && (
        <MetaItem term="Links">
          {project.links.length > 0 ? (
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {project.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-10 items-center gap-1 text-fg underline decoration-line-strong underline-offset-4 transition-colors duration-300 hover:decoration-fg focus-visible:decoration-fg"
                  >
                    {link.label}
                    <span aria-hidden className="text-subtle">
                      ↗
                    </span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-subtle">{project.note}</span>
          )}
        </MetaItem>
      )}
    </dl>
  );
}

function MetaItem({ term, children }: { term: string; children: ReactNode }) {
  return (
    // Label beside value on small screens, stacked columns from md.
    <div className="grid grid-cols-[5.5rem_1fr] items-baseline gap-x-4 md:block">
      <dt className="eyebrow">{term}</dt>
      <dd className="text-sm leading-relaxed text-fg md:mt-2">{children}</dd>
    </div>
  );
}
