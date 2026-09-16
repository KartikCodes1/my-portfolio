"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { links, sections } from "@/content/site";
import { projects } from "@/content/projects";
import { toast } from "@/lib/toast";
import { displayUrl } from "@/lib/format";
import { copyText, emit, goToSection, openProject } from "@/lib/ui-events";
import { useModalDialog } from "@/lib/use-modal-dialog";

type Group = "Navigate" | "Case studies" | "Contact" | "System";

type Item = {
  id: string;
  group: Group;
  /** Short mono glyph in the left gutter. */
  glyph: string;
  label: string;
  description?: string;
  /** Extra search terms, never shown. */
  keywords?: string;
  /** Mono section index on the right, e.g. "01". */
  index?: string;
  /** Keyboard shortcut on the right (hidden on touch-sized screens). */
  shortcut?: string;
  draft?: boolean;
  run: () => void;
};

const openInNewTab = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

const items: Item[] = [
  ...sections.map(
    (s): Item => ({
      id: `section-${s.id}`,
      group: "Navigate",
      glyph: "#",
      label: s.label,
      description: s.id === "top" ? "Back to top" : undefined,
      keywords: `go jump scroll section ${s.id}`,
      index: s.index,
      run: () => goToSection(s.id),
    }),
  ),
  ...projects.map(
    (p): Item => ({
      id: `project-${p.id}`,
      group: "Case studies",
      glyph: "→",
      label: p.title,
      description: p.kicker,
      keywords: `case study project work ${p.id} ${p.stack.join(" ")}`,
      draft: p.draft,
      run: () => openProject(p.id),
    }),
  ),
  {
    id: "copy-email",
    group: "Contact",
    glyph: "@",
    label: "Copy email",
    description: links.email,
    keywords: "clipboard mail address",
    run: async () => toast((await copyText(links.email)) ? "Email copied" : `Couldn't copy. Email: ${links.email}`),
  },
  {
    id: "write-email",
    group: "Contact",
    glyph: "@",
    label: "Write an email",
    description: "Opens your mail app",
    keywords: "mailto message hire",
    run: () => {
      location.href = `mailto:${links.email}`;
    },
  },
  {
    id: "linkedin",
    group: "Contact",
    glyph: "↗",
    label: "Open LinkedIn",
    description: displayUrl(links.linkedin),
    keywords: "profile social",
    run: () => openInNewTab(links.linkedin),
  },
  ...(links.github
    ? [
        {
          id: "github",
          group: "Contact",
          glyph: "↗",
          label: "Open GitHub",
          description: displayUrl(links.github),
          keywords: "code profile repositories",
          run: () => openInNewTab(links.github!),
        } satisfies Item,
      ]
    : []),
  {
    id: "terminal",
    group: "System",
    glyph: "›_",
    label: "Open terminal",
    keywords: "console shell cli command line",
    shortcut: "Ctrl `",
    run: () => emit("ui:terminal-open"),
  },
  {
    id: "xray",
    group: "System",
    glyph: "::",
    label: "Toggle x-ray mode",
    keywords: "grid layout outline debug konami",
    shortcut: "↑↑↓↓←→←→BA",
    run: () => emit("ui:xray-toggle"),
  },
];

/** Every query token must appear somewhere; label-prefix matches rank first. Groups stay contiguous. */
function search(query: string): Item[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  const tokens = q.split(/\s+/);
  const ranked = items
    .filter((item) => {
      const haystack = `${item.label} ${item.group} ${item.description ?? ""} ${item.keywords ?? ""}`.toLowerCase();
      return tokens.every((t) => haystack.includes(t));
    })
    .sort((a, b) => Number(!a.label.toLowerCase().startsWith(q)) - Number(!b.label.toLowerCase().startsWith(q)));
  const groupOrder = [...new Set(ranked.map((item) => item.group))];
  return groupOrder.flatMap((group) => ranked.filter((item) => item.group === group));
}

const optionId = (item: Item) => `palette-option-${item.id}`;
const groupId = (group: Group) => `palette-group-${group.toLowerCase().replace(/\s+/g, "-")}`;

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const { close, dialogProps } = useModalDialog(
    dialogRef,
    inputRef,
    open,
    () => {
      setQuery("");
      setActive(0);
      onClose();
    },
  );

  const results = useMemo(() => search(query), [query]);
  const activeItem = results[active];
  const groups = [...new Set(results.map((item) => item.group))];

  useEffect(() => {
    if (!open || !activeItem) return;
    // For the first option, scroll fully to the top so its group header is visible too.
    if (active === 0) listRef.current?.scrollTo({ top: 0 });
    else document.getElementById(optionId(activeItem))?.scrollIntoView({ block: "nearest" });
  }, [open, active, activeItem]);

  const select = (item: Item) => {
    // Close first: the dialog restores focus synchronously, then the action is free to
    // scroll and move focus (goToSection) without the restoration undoing it.
    close();
    requestAnimationFrame(() => item.run());
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    const count = results.length;
    switch (e.key) {
      case "ArrowDown":
        if (count) setActive((active + 1) % count);
        break;
      case "ArrowUp":
        if (count) setActive((active - 1 + count) % count);
        break;
      case "Home":
        setActive(0);
        break;
      case "End":
        setActive(Math.max(count - 1, 0));
        break;
      case "Enter":
        if (activeItem) select(activeItem);
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label="Command menu"
      {...dialogProps}
      className="panel fixed top-[14vh] right-auto bottom-auto left-1/2 m-0 max-h-none w-[min(640px,calc(100vw-2rem))] max-w-none -translate-x-1/2 overflow-hidden p-0 text-fg shadow-2xl shadow-black/60 transition-[opacity,scale] duration-150 ease-out-expo backdrop:bg-black/60 backdrop:backdrop-blur-[2px] starting:scale-[0.98] starting:opacity-0"
    >
      <div className="flex items-center border-b border-line pr-2">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-activedescendant={activeItem ? optionId(activeItem) : undefined}
          aria-autocomplete="list"
          aria-label="Search commands"
          placeholder="Type a command or search…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          enterKeyHint="go"
          // 16px on mobile stops iOS from zooming on focus.
          className="h-14 min-w-0 flex-1 bg-transparent px-4 text-base text-fg outline-none! placeholder:text-subtle sm:text-[15px]"
        />
        <button
          type="button"
          onClick={close}
          aria-label="Close command menu"
          className="flex h-10 shrink-0 items-center rounded-md px-2 transition-colors hover:bg-surface-2 focus-visible:bg-surface-2"
        >
          <kbd aria-hidden>esc</kbd>
        </button>
      </div>

      <div
        ref={listRef}
        id="palette-list"
        role="listbox"
        aria-label="Commands"
        className="max-h-[min(420px,60vh)] overflow-y-auto overscroll-contain p-2 empty:hidden"
      >
        {groups.map((group) => (
          <div key={group} role="group" aria-labelledby={groupId(group)}>
            <div id={groupId(group)} aria-hidden className="eyebrow px-3 py-2">
              {group}
            </div>
            {results.map((item, i) => {
              if (item.group !== group) return null;
              const selected = i === active;
              return (
                <div
                  key={item.id}
                  id={optionId(item)}
                  role="option"
                  aria-selected={selected}
                  onPointerMove={() => i !== active && setActive(i)}
                  // Keep focus (and the caret) in the input.
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => select(item)}
                  className={`relative flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 select-none ${
                    selected ? "bg-surface-2 text-fg" : "text-muted"
                  }`}
                >
                  {selected && <span aria-hidden className="absolute inset-y-2.5 left-0 w-0.5 rounded-full bg-accent" />}
                  <span aria-hidden className="w-4 shrink-0 text-center font-mono text-[11px] text-subtle">
                    {item.glyph}
                  </span>
                  <span className="flex min-w-0 flex-1 items-baseline gap-2.5">
                    {/* Wraps on phones (no room for the description); truncates beside it from sm. */}
                    <span className="min-w-0 text-sm sm:max-w-full sm:shrink-0 sm:truncate">{item.label}</span>
                    {item.description && (
                      <span className="hidden min-w-0 truncate text-[13px] text-subtle sm:block">{item.description}</span>
                    )}
                  </span>
                  {item.draft && (
                    <span className="shrink-0 rounded border border-line-strong px-1.5 font-mono text-[10px] leading-4 tracking-[0.08em] text-subtle uppercase">
                      Draft
                    </span>
                  )}
                  {item.index && <span className="shrink-0 font-mono text-[11px] text-subtle">{item.index}</span>}
                  {item.shortcut && (
                    <kbd aria-hidden className="hidden shrink-0 sm:inline-block">
                      {item.shortcut}
                    </kbd>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <p className="px-4 py-10 text-center text-sm text-balance text-muted">
          No results for “{query.trim()}”. Try the terminal: press <kbd>Ctrl</kbd> <kbd>`</kbd>
        </p>
      )}
      <p className="sr-only" aria-live="polite">
        {query.trim() && `${results.length} ${results.length === 1 ? "result" : "results"}`}
      </p>

      <div
        aria-hidden
        className="flex items-center justify-between gap-4 border-t border-line px-4 py-2.5 font-mono text-[11px] text-subtle"
      >
        <p className="flex gap-4">
          <span>
            <span className="text-muted">↑↓</span> navigate
          </span>
          <span>
            <span className="text-muted">↵</span> select
          </span>
          <span>
            <span className="text-muted">esc</span> close
          </span>
        </p>
        <p className="hidden sm:block">
          <span className="text-muted">ctrl `</span> terminal
        </p>
      </div>
    </dialog>
  );
}
