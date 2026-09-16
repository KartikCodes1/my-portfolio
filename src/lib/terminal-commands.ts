/**
 * The terminal's brain: pure input -> output. No React, no DOM.
 * The Terminal component renders `lines` and applies `effect`.
 */
import { about, approach, links, profile, sections, stack, type SectionId } from "@/content/site";
import { projects } from "@/content/projects";
import { displayUrl } from "@/lib/format";

export type Tone = "default" | "muted" | "accent" | "error";

export type Line = {
  text: string;
  tone?: Tone;
  href?: string;
  /** Fixed-width left column (already padded). Wrapped text hangs under `text`, not under the label. */
  label?: string;
};

export type Effect =
  | { type: "clear" }
  | { type: "close" }
  | { type: "goto"; section: SectionId }
  | { type: "open-project"; id: string }
  | { type: "xray" }
  | { type: "copy"; text: string }
  | { type: "href"; url: string; newTab: boolean; delayMs?: number };

export type Result = { lines: Line[]; effect?: Effect };

export type Context = {
  /** Submitted commands, oldest first, including the one being run. */
  history: readonly string[];
  now: Date;
};

/** Prompt user, e.g. "kartik". */
export const promptUser = profile.handle;

export const welcome: Line[] = [
  { text: `${profile.name} / ${profile.role}` },
  { text: "Type help to list commands. Tab completes, ↑↓ history.", tone: "muted" },
  { text: "" },
];

type Args = {
  /** Lower-cased arguments, for matching. */
  argv: string[];
  /** Everything after the command name, original casing (for echo). */
  rest: string;
};

type Command = {
  /** Shown in help. Commands without a summary are hidden (aliases, easter eggs). */
  usage?: string;
  summary?: string;
  /** Candidates for Tab-completing the first argument. */
  args?: readonly string[];
  run: (args: Args, ctx: Context) => Result;
};

const say = (text: string, tone?: Tone): Result => ({ lines: [{ text, tone }] });
const error = (text: string): Result => say(text, "error");
const pad = (rows: string[]) => Math.max(...rows.map((r) => r.length)) + 2;
const twoDigits = (n: number) => String(n).padStart(2, "0");
const mailto = (subject?: string) =>
  `mailto:${links.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;

const navSections = sections.filter((s) => s.id !== "top");
const sectionIds = navSections.map((s) => s.id);
const projectIds = projects.map((p) => p.id);
const layerIds = stack.layers.map((l) => l.id);

function listProjects(): Result {
  const idWidth = pad(projectIds);
  return {
    lines: [
      ...projects.map((p, i) => ({
        text: `${twoDigits(i + 1)}  ${p.id.padEnd(idWidth)}${p.title}${p.draft ? "  [draft]" : ""}`,
      })),
      { text: "" },
      { text: "Type open <id|number> to read one.", tone: "muted" },
    ],
  };
}

function goTo({ argv }: Args): Result {
  const target = (argv[0] ?? "").replace(/^\.\//, "").replace(/\/$/, "");
  if (["", "..", "~", "/"].includes(target)) return { lines: [], effect: { type: "goto", section: "top" } };
  const section = navSections.find((s) => s.id === target);
  if (!section) return error(`cd: no such section: ${target}. Try ls.`);
  return { lines: [], effect: { type: "goto", section: section.id } };
}

function openLink(url: string, name: string): Result {
  return {
    lines: [
      { text: `Opening ${name} in a new tab…`, tone: "muted" },
      { text: displayUrl(url), href: url },
    ],
    effect: { type: "href", url, newTab: true },
  };
}

const commands: Record<string, Command> = {
  help: {
    usage: "help",
    summary: "List commands",
    run: () => {
      const visible = Object.values(commands).filter((c) => c.summary);
      const width = pad(visible.map((c) => c.usage!));
      return {
        lines: [
          ...visible.map((c) => ({ label: c.usage!.padEnd(width), text: c.summary!, tone: "muted" as const })),
          { text: "" },
          { text: "Tab completes · ↑↓ history · Ctrl+L clears · Esc closes", tone: "muted" },
        ],
      };
    },
  },

  whoami: {
    usage: "whoami",
    summary: "Who runs this console",
    run: () => ({
      lines: [
        { text: profile.name },
        { text: `${profile.role} · ${profile.focus.join(", ")}`, tone: "muted" },
        { text: profile.headline, tone: "muted" },
        ...(profile.availability ? [{ label: "status  ", text: profile.availability, tone: "accent" as const }] : []),
      ],
    }),
  },

  about: {
    usage: "about",
    summary: "The short version",
    run: () => ({
      lines: [
        { text: about.paragraphs[0] },
        { text: "" },
        { label: "off hours  ", text: about.offHours.join(", "), tone: "muted" },
      ],
    }),
  },

  projects: {
    usage: "projects",
    summary: "List case studies",
    run: listProjects,
  },

  open: {
    usage: "open <id|n>",
    summary: "Open a case study",
    args: projectIds,
    run: ({ argv }) => {
      const query = argv[0];
      if (!query) return error("usage: open <id|number>. Type projects to list them.");
      const byNumber = /^\d+$/.test(query) ? projects[Number(query) - 1] : undefined;
      const project = byNumber ?? projects.find((p) => p.id === query);
      if (!project) return error(`open: no case study "${query}". Type projects to list them.`);
      return { lines: [], effect: { type: "open-project", id: project.id } };
    },
  },

  stack: {
    usage: "stack [layer]",
    summary: "Tools by layer",
    args: layerIds,
    run: ({ argv }) => {
      const query = argv[0];
      if (!query) {
        const width = pad(layerIds);
        return {
          lines: [
            ...stack.layers.flatMap((layer) => [
              { label: layer.id.padEnd(width), text: layer.name },
              { label: "".padEnd(width), text: layer.tools.map((t) => t.name).join(" · "), tone: "muted" as const },
            ]),
            { text: "" },
            { text: "Type stack <layer> for notes on each tool.", tone: "muted" },
          ],
        };
      }
      const layer = stack.layers.find((l) => l.id === query);
      if (!layer) return error(`stack: no layer "${query}". Try: ${layerIds.join(", ")}.`);
      return {
        lines: [
          { text: `${layer.name}: ${layer.blurb}` },
          { text: "" },
          ...layer.tools.flatMap((tool) => [
            { text: tool.name },
            { label: "  ", text: tool.note, tone: "muted" as const },
          ]),
        ],
      };
    },
  },

  approach: {
    usage: "approach",
    summary: "How I work",
    run: () => ({
      lines: approach.stages.flatMap((stage, i) => [
        { label: `${twoDigits(i + 1)}  `, text: stage.name },
        { label: "    ", text: stage.question, tone: "muted" as const },
      ]),
    }),
  },

  contact: {
    usage: "contact",
    summary: "Ways to reach me",
    run: () => {
      const rows = [
        { name: "email", text: links.email, href: mailto() },
        { name: "linkedin", text: displayUrl(links.linkedin), href: links.linkedin },
        ...(links.github ? [{ name: "github", text: displayUrl(links.github), href: links.github }] : []),
      ];
      const width = pad(rows.map((r) => r.name));
      return {
        lines: [
          ...rows.map((r) => ({ label: r.name.padEnd(width), text: r.text, href: r.href })),
          ...(profile.responseTime ? [{ text: "" }, { text: profile.responseTime, tone: "muted" as const }] : []),
        ],
      };
    },
  },

  email: {
    usage: "email",
    summary: "Copy my email",
    run: () => ({
      lines: [{ label: "email  ", text: links.email, href: mailto() }],
      effect: { type: "copy", text: links.email },
    }),
  },

  linkedin: {
    usage: "linkedin",
    summary: "Open LinkedIn",
    run: () => openLink(links.linkedin, "LinkedIn"),
  },

  // Listed only when a profile exists; still answers politely otherwise.
  github: {
    ...(links.github ? { usage: "github", summary: "Open GitHub" } : {}),
    run: () => (links.github ? openLink(links.github, "GitHub") : error("github: no public profile listed yet.")),
  },

  ls: {
    usage: "ls",
    summary: "List sections",
    args: ["projects"],
    run: (args) => {
      if (args.argv[0] === "projects") return listProjects();
      if (args.argv[0]) return error(`ls: cannot access '${args.argv[0]}'. Try ls or ls projects.`);
      return say(sectionIds.map((id) => `${id}/`).join("  "));
    },
  },

  cd: {
    usage: "cd <section>",
    summary: "Jump to a section",
    args: sectionIds,
    run: goTo,
  },

  goto: { args: sectionIds, run: goTo },

  xray: {
    usage: "xray",
    summary: "Toggle the layout grid",
    run: () => ({ lines: [], effect: { type: "xray" } }),
  },

  history: {
    usage: "history",
    summary: "Command history",
    run: (_, ctx) => ({
      lines: ctx.history.map((cmd, i) => ({ label: `${String(i + 1).padStart(4)}  `, text: cmd })),
    }),
  },

  date: {
    usage: "date",
    summary: "Print the date",
    run: (_, ctx) => say(ctx.now.toString()),
  },

  echo: {
    usage: "echo <text>",
    summary: "Print text",
    run: ({ rest }) => say(rest),
  },

  clear: {
    usage: "clear",
    summary: "Clear the screen",
    run: () => ({ lines: [], effect: { type: "clear" } }),
  },

  exit: {
    usage: "exit",
    summary: "Close the terminal",
    run: () => ({ lines: [], effect: { type: "close" } }),
  },

  // Easter eggs (hidden from help and completion)

  sudo: {
    run: ({ argv }) => {
      if (argv.join(" ") !== `hire ${promptUser}`) {
        return say(`visitor is not in the sudoers file. This incident will be reported. (Try: sudo hire ${promptUser})`);
      }
      return {
        lines: [
          { text: "[sudo] password for recruiter: ********", tone: "muted" },
          { text: "Access granted. Opening a new email…", tone: "accent" },
        ],
        effect: { type: "href", url: mailto(`Project enquiry via ${profile.name}'s site`), newTab: false, delayMs: 900 },
      };
    },
  },
  rm: { run: () => say("Nice try. This site is immutable infrastructure.") },
  vim: { run: () => say("Opening vim… just kidding, you'd never get out. Type exit instead.") },
  vi: { run: (args, ctx) => commands.vim.run(args, ctx) },
  nano: { run: (args, ctx) => commands.vim.run(args, ctx) },
  ping: { run: () => say("pong, 0 ms (it's a static site)") },
  coffee: { run: () => say("418 I'm a teapot") },
  make: {
    run: (args, ctx) => (args.argv[0] === "coffee" ? commands.coffee.run(args, ctx) : error("command not found: make. Type help.")),
  },
};

export function run(input: string, ctx: Context): Result {
  const trimmed = input.trim();
  if (!trimmed) return { lines: [] };

  const [rawName] = trimmed.split(/\s+/, 1);
  const name = rawName.toLowerCase();
  const rest = trimmed.slice(rawName.length).trim();
  const command = Object.hasOwn(commands, name) ? commands[name] : undefined;
  if (!command) return error(`command not found: ${rawName}. Type help.`);

  return command.run({ argv: rest ? rest.toLowerCase().split(/\s+/) : [], rest }, ctx);
}

/**
 * Tab completion. Completes the command name, or the first argument for
 * commands that take one (sections, project ids, stack layers).
 * `value` is the new input; `options` lists candidates when it's ambiguous.
 */
export function complete(input: string): { value: string; options: string[] } {
  const start = input.trimStart();
  const firstSpace = start.search(/\s/);

  let prefix: string;
  let partial: string;
  let candidates: readonly string[];
  let isCommand = false;

  if (firstSpace === -1) {
    prefix = "";
    partial = start.toLowerCase();
    candidates = Object.keys(commands).filter((name) => commands[name].summary || name === "goto");
    isCommand = true;
  } else {
    const name = start.slice(0, firstSpace).toLowerCase();
    const argText = start.slice(firstSpace).trimStart();
    if (/\s/.test(argText)) return { value: input, options: [] }; // only the first argument completes
    prefix = `${name} `;
    partial = argText.toLowerCase();
    candidates = (Object.hasOwn(commands, name) && commands[name].args) || [];
  }

  const matches = candidates.filter((c) => c.startsWith(partial));
  if (matches.length === 0) return { value: input, options: [] };
  if (matches.length === 1) {
    const command = commands[matches[0]];
    const takesArgs = isCommand && (Boolean(command.args) || /[<[]/.test(command.usage ?? ""));
    return { value: prefix + matches[0] + (takesArgs ? " " : ""), options: [] };
  }

  let common = matches[0];
  for (const m of matches) while (!m.startsWith(common)) common = common.slice(0, -1);
  return { value: common.length > partial.length ? prefix + common : input, options: matches };
}
