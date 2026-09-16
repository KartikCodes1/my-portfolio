"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { profile, sections, type SectionId } from "@/content/site";
import { emit } from "@/lib/ui-events";
import { PaletteKeys } from "@/components/palette-keys";

const navSections = sections.filter((s) => s.id !== "top");

const subscribeScroll = (onChange: () => void) => {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
};
const getScrolled = () => window.scrollY > 8;
const getServerScrolled = () => false;

export function Header() {
  const scrolled = useSyncExternalStore(subscribeScroll, getScrolled, getServerScrolled);
  const [active, setActive] = useState<SectionId | null>(null);
  // Sections only exist on the home page. Bare fragments there keep in-page jumps (even with a ?query);
  // anywhere else (the 404 page) the links have to lead home.
  const base = usePathname() === "/" ? "" : "/";

  useEffect(() => {
    // A thin band just above the middle of the viewport: whichever section crosses it is current.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id as SectionId);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const { id } of sections) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 h-16 border-b transition-[background-color,border-color] duration-300 ease-out-expo ${
        scrolled ? "border-line bg-bg/75 backdrop-blur-md" : "border-transparent"
      }`}
    >
      <div className="shell flex h-full items-center justify-between gap-6">
        <a
          href={`${base}#top`}
          aria-label={`${profile.name}, back to top`}
          className="group flex h-10 min-w-0 items-center gap-2.5 rounded-md"
        >
          <span
            aria-hidden
            className="grid size-7 shrink-0 place-items-center rounded-md border border-line-strong font-mono text-[11px] text-fg transition-colors group-hover:border-fg/40 group-focus-visible:border-fg/40"
          >
            {profile.initials}
          </span>
          <span className="truncate text-sm font-medium text-fg">
            {profile.name}
            <span className="hidden font-normal text-subtle xl:inline"> / {profile.role}</span>
          </span>
        </a>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center">
            {navSections.map((s) => {
              const current = s.id === active;
              return (
                <li key={s.id}>
                  <a
                    href={`${base}#${s.id}`}
                    aria-current={current ? "location" : undefined}
                    className="group relative flex h-10 items-center gap-2 rounded-md px-2.5 lg:px-3"
                  >
                    <span aria-hidden className="hidden font-mono text-[11px] text-subtle lg:inline">
                      {s.index}
                    </span>
                    <span
                      className={`relative text-sm transition-colors ${current ? "text-fg" : "text-muted group-hover:text-fg group-focus-visible:text-fg"}`}
                    >
                      {s.label}
                      <span
                        aria-hidden
                        className={`absolute -bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-accent transition-[opacity,scale] duration-300 ease-out-expo ${
                          current ? "opacity-100" : "scale-0 opacity-0"
                        }`}
                      />
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => emit("ui:palette-open")}
          aria-label="Open command menu"
          aria-haspopup="dialog"
          // The ::after widens the touch target to 44px without changing the 36px visual.
          className="relative flex h-9 shrink-0 items-center gap-2.5 rounded-md border border-line px-2.5 text-muted transition-colors after:absolute after:inset-x-0 after:-inset-y-1 hover:border-line-strong hover:bg-surface hover:text-fg focus-visible:border-line-strong focus-visible:bg-surface focus-visible:text-fg"
        >
          <span aria-hidden className="hidden items-center gap-2.5 md:flex">
            <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <circle cx="7" cy="7" r="4.25" />
              <path d="M10.25 10.25L13.5 13.5" strokeLinecap="round" />
            </svg>
            <PaletteKeys />
          </span>
          <span aria-hidden className="flex items-center gap-2 text-sm md:hidden">
            Menu
            <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M2.5 5.5h11M2.5 10.5h11" strokeLinecap="round" />
            </svg>
          </span>
        </button>
      </div>
    </header>
  );
}
