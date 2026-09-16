"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type MouseEvent } from "react";
import { complete, promptUser, run, welcome, type Effect, type Line, type Tone } from "@/lib/terminal-commands";
import { copyText, emit, goToSection, openProject } from "@/lib/ui-events";
import { useModalDialog } from "@/lib/use-modal-dialog";

type Entry = { id: number; command: string } | { id: number; line: Line };

const toneClass: Record<Tone, string> = {
  default: "text-fg",
  muted: "text-muted",
  accent: "text-accent",
  // No second colour: error lines already say what went wrong in words.
  error: "text-fg",
};

export function Terminal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(welcome.length);
  const draft = useRef("");

  // State lives as long as the page does, so output and history survive closing the window.
  const [entries, setEntries] = useState<Entry[]>(() => welcome.map((line, id) => ({ id, line })));
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  /** Position in `history` while browsing with ↑↓; null = editing a fresh line. */
  const [cursor, setCursor] = useState<number | null>(null);

  const { close, dialogProps } = useModalDialog(dialogRef, inputRef, open, onClose);

  // Keep the prompt in view. Also runs on open: a closed <dialog> has no layout to scroll.
  useEffect(() => {
    const body = bodyRef.current;
    if (open && body) body.scrollTop = body.scrollHeight;
  }, [entries, open]);

  const print = (lines: Line[], command?: string) => {
    const added: Entry[] = [];
    if (command !== undefined) added.push({ id: nextId.current++, command });
    for (const line of lines) added.push({ id: nextId.current++, line });
    setEntries((prev) => [...prev, ...added]);
  };

  const apply = (effect: Effect) => {
    switch (effect.type) {
      case "clear":
        setEntries([]);
        break;
      case "close":
        close();
        break;
      // Close first so the dialog's focus restoration can't undo the action's scroll/focus.
      case "goto":
        close();
        requestAnimationFrame(() => goToSection(effect.section));
        break;
      case "open-project":
        close();
        requestAnimationFrame(() => openProject(effect.id));
        break;
      case "xray":
        // Closed so the grid isn't hidden behind the modal backdrop.
        close();
        requestAnimationFrame(() => emit("ui:xray-toggle"));
        break;
      case "copy":
        copyText(effect.text).then((ok) =>
          print([
            ok
              ? { text: "Copied to clipboard.", tone: "accent" }
              : { text: "Couldn't reach the clipboard. Copy it from the line above.", tone: "error" },
          ]),
        );
        break;
      case "href":
        setTimeout(() => {
          if (effect.newTab) window.open(effect.url, "_blank", "noopener,noreferrer");
          else location.href = effect.url;
        }, effect.delayMs ?? 0);
        break;
    }
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const command = input.trim();
    const nextHistory = command && history.at(-1) !== command ? [...history, command] : history;
    setHistory(nextHistory);
    setInput("");
    setCursor(null);
    draft.current = "";

    const result = run(command, { history: nextHistory, now: new Date() });
    if (result.effect?.type !== "clear") print(result.lines, command);
    if (result.effect) apply(result.effect);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (e.ctrlKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      setEntries([]);
      return;
    }

    // Tab completes only when there's something to complete; on an empty line it still moves focus.
    if (e.key === "Tab" && !e.shiftKey && input.trim()) {
      e.preventDefault();
      const { value, options } = complete(input);
      setInput(value);
      if (options.length) print([{ text: options.join("  "), tone: "muted" }], input.trim());
      return;
    }

    if ((e.key !== "ArrowUp" && e.key !== "ArrowDown") || history.length === 0) return;
    e.preventDefault();
    if (e.key === "ArrowUp") {
      if (cursor === null) draft.current = input;
      const next = cursor === null ? history.length - 1 : Math.max(cursor - 1, 0);
      setCursor(next);
      setInput(history[next]);
    } else if (cursor !== null) {
      const next = cursor + 1;
      setCursor(next < history.length ? next : null);
      setInput(next < history.length ? history[next] : draft.current);
    }
  };

  const focusInput = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target instanceof Element && e.target.closest("a, button, input")) return;
    if (window.getSelection()?.isCollapsed === false) return; // let people select and copy output
    inputRef.current?.focus({ preventScroll: true });
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label="Terminal"
      {...dialogProps}
      className="m-auto h-[min(560px,calc(100dvh-4rem))] max-h-none w-[min(820px,calc(100vw-2rem))] max-w-none overflow-hidden rounded-xl border border-line-strong bg-bg p-0 font-mono text-[13px] leading-6 text-fg shadow-2xl shadow-black/60 transition-[opacity,scale] duration-150 ease-out-expo backdrop:bg-black/60 backdrop:backdrop-blur-[2px] starting:scale-[0.98] starting:opacity-0"
    >
      <div className="flex h-full flex-col">
        <div className="flex h-10 shrink-0 items-center justify-between gap-4 border-b border-line pl-4">
          <p className="truncate text-subtle">{promptUser}@portfolio: ~</p>
          <div className="flex h-full items-center gap-1">
            <kbd aria-hidden className="hidden sm:inline-block">
              esc
            </kbd>
            <button
              type="button"
              onClick={close}
              aria-label="Close terminal"
              className="grid h-full w-10 place-items-center text-subtle transition-colors hover:bg-surface-2 hover:text-fg focus-visible:-outline-offset-2!"
            >
              <svg aria-hidden viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div ref={bodyRef} onClick={focusInput} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
          <div role="log" aria-live="polite" className="wrap-break-word whitespace-pre-wrap">
            {entries.map((entry) =>
              "command" in entry ? (
                <div key={entry.id} className="min-h-6">
                  <span className="text-subtle">$ </span>
                  <span className="text-fg">{entry.command}</span>
                </div>
              ) : (
                <OutputLine key={entry.id} line={entry.line} />
              ),
            )}
          </div>

          <form onSubmit={submit} className="flex items-baseline">
            <span aria-hidden className="shrink-0 whitespace-pre">
              {/* Host dropped on phones so the input keeps a usable width. */}
              <span className="text-accent">
                {promptUser}
                <span className="hidden sm:inline">@portfolio</span>
              </span>
              <span className="text-subtle">:~$ </span>
            </span>
            <input
              ref={inputRef}
              type="text"
              aria-label="Terminal command"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setCursor(null);
              }}
              onKeyDown={onKeyDown}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="send"
              // 16px on mobile stops iOS from zooming on focus.
              className="min-w-0 flex-1 bg-transparent p-0 text-base text-fg caret-accent outline-none! sm:text-[13px]"
            />
          </form>
        </div>
      </div>
    </dialog>
  );
}

function OutputLine({ line }: { line: Line }) {
  const external = line.href?.startsWith("http");
  const content = line.href ? (
    <a
      href={line.href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      // ::after grows the hit area to 40px tall without changing the 24px line rhythm.
      className="relative text-fg underline decoration-line-strong underline-offset-4 after:absolute after:inset-x-0 after:-inset-y-2 hover:decoration-fg focus-visible:decoration-fg"
    >
      {line.text}
    </a>
  ) : (
    <span className={toneClass[line.tone ?? "default"]}>{line.text}</span>
  );

  if (!line.label) return <div className="min-h-6">{content}</div>;
  return (
    <div className="flex min-h-6">
      <span className="shrink-0 text-fg">{line.label}</span>
      <span className="min-w-0">{content}</span>
    </div>
  );
}
