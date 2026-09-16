# Kartik Parmar's portfolio

Single-page personal site for Kartik Parmar, Forward Deployed Engineer. It is designed as the operations console for one engineer's work: case studies, approach, toolbox, about, and contact, with a command palette and a small terminal for keyboard-first navigation.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack), React 19, TypeScript
- Tailwind CSS v4 (tokens defined in CSS, no `tailwind.config`)
- Geist Sans and Geist Mono via `next/font`
- [Vercel Web Analytics](https://vercel.com/docs/analytics) (`@vercel/analytics`) and [Speed Insights](https://vercel.com/docs/speed-insights) (`@vercel/speed-insights`): cookieless page views and real-user Core Web Vitals, active only when deployed on Vercel
- No animation or icon libraries

## Run locally

Requires Node.js 20.9 or newer and [pnpm](https://pnpm.io) 10 (the exact version is pinned in `packageManager` in `package.json`).

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # production build
pnpm lint     # ESLint
```

## Customise

All copy lives in `src/content/`. Components never hard-code personal facts, so editing these two files is enough to make the site yours. Search for `TODO` to find every placeholder.

**`src/content/site.ts`**

| Export     | What it controls                                                                  |
| ---------- | --------------------------------------------------------------------------------- |
| `profile`  | Name, handle, role, location, headline, lede, social description, `availability` and `responseTime` (both `null` until you set them; `null` hides them) |
| `seo`      | Search result title and description (keep it around 150 characters) and keywords used in the meta tags and JSON-LD |
| `links`    | Email, LinkedIn, GitHub (`null` hides it)                                          |
| `sections` | Section ids, index labels and names used by the header, palette and terminal     |
| `work`     | Title and intro of the Selected work section                                      |
| `approach` | The five delivery stages                                                          |
| `stack`    | Toolbox layers; each tool's `projects` lists project ids it links to              |
| `about`    | Bio paragraphs, the config card, off-hours interests                              |
| `contact`  | Contact section title and body                                                    |
| `contactForm` | Topic options and field length limits for the contact form (see [Contact form](#contact-form)) |

**`src/content/projects.ts`**

Case studies from real projects. Company and client names are intentionally left out. `draft: true` renders a visible "Draft" marker for anything still placeholder. Empty `period` or `role` fields are hidden. Keep `id`s stable, or update the matching ids in `stack` in `site.ts`.

### Site URL

Set `NEXT_PUBLIC_SITE_URL` to the deployed origin (no trailing slash). It is used for the canonical URL, Open Graph and Twitter cards, JSON-LD, `robots.txt` and `sitemap.xml` (see `src/lib/site-url.ts`). On Vercel it falls back to the production domain (`VERCEL_PROJECT_PRODUCTION_URL`); anywhere else it falls back to `http://localhost:3000`, so it is required on other hosts.

```bash
# .env.local
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Contact form

The form in the Contact section posts to `src/app/api/contact/route.ts`, which emails each message to `links.email` through [Resend](https://resend.com). The visitor's address is set as Reply-To, so replying from your inbox goes straight back to them. Until `RESEND_API_KEY` is set, submitting the form opens the visitor's email app with the message filled in.

1. Create a Resend account and add your domain (`kartikcodes.io`) under **Domains**.
2. Add the DNS records Resend shows (DKIM plus an SPF record and MX record on a `send` subdomain) in your DNS provider. They don't touch the records for your existing mailbox.
3. Once the domain shows as verified, create an API key with **Sending access** only.
4. Add the key to Vercel for Production (and Preview, if you want previews to send email). The CLI prompts for the value, so it never lands in your shell history:
   ```bash
   vercel env add RESEND_API_KEY production --sensitive
   ```
   For local testing, put it in `.env.local` (gitignored) as `RESEND_API_KEY=...`.
5. Redeploy, send yourself a test message from the live site, and check it arrives.

Emails are sent from `contact@<your email domain>`. Set `CONTACT_FROM` (for example `Kartik Parmar <hello@kartikcodes.io>`) to use another verified address.

Spam protection is a hidden honeypot field, server-side validation (lengths, email format, topic list) and a same-origin check. There's no rate limiting; if spam gets through, add a rate limit rule for `/api/contact` in Vercel Firewall. Topic options and field length limits live in `contactForm` in `site.ts`.

## Interactive features

| Shortcut                      | Action                                                           |
| ----------------------------- | ---------------------------------------------------------------- |
| <kbd>Cmd/Ctrl</kbd>+<kbd>K</kbd>  | Open the command palette to jump to a section or case study |
| <kbd>Ctrl</kbd>+<kbd>&#96;</kbd> (backquote) | Open the terminal. Type `help` to list its commands. Ctrl on every platform, since macOS reserves Cmd+&#96; |
| Konami code (↑ ↑ ↓ ↓ ← → ← → B A) | Toggle x-ray mode, which outlines every element of the layout |

The terminal is a keyboard-driven way to navigate sections, open case studies and toggle x-ray mode; `help` prints the full command list. X-ray mode can also be toggled from the palette.

Case studies open from the Selected work section and are deep-linkable via `#project-<id>`.

## Project structure

```
src/
├── app/
│   ├── layout.tsx            # fonts, metadata, JSON-LD, header/footer/app shell
│   ├── page.tsx              # section order
│   ├── globals.css           # design tokens (@theme), utilities, keyframes
│   ├── not-found.tsx         # 404
│   ├── icon.svg              # favicon
│   ├── apple-icon.tsx        # generated 180×180 touch icon
│   ├── opengraph-image.tsx   # generated 1200×630 social card
│   ├── robots.ts
│   └── sitemap.ts
├── components/               # one kebab-case file per section or interactive island
├── content/
│   ├── site.ts               # all personal copy
│   └── projects.ts           # case studies
└── lib/
    ├── ui-events.ts          # window-event bus between client islands, navigation helpers
    ├── terminal-commands.ts  # terminal commands and easter eggs (pure input -> output)
    ├── use-modal-dialog.ts   # native <dialog> as a modal: focus, Escape, backdrop close
    ├── use-platform.ts       # Apple vs other platform, for ⌘ / Ctrl hints
    ├── toast.ts              # fire a toast from any client island
    ├── format.ts             # display helpers shared by server and client code
    └── site-url.ts           # absolute site origin for metadata, robots and sitemap
```

Components are Server Components by default; `"use client"` is limited to the smallest interactive pieces (palette, terminal, tabs, explorers). Client islands talk through window events in `ui-events.ts` rather than a shared React context.

## Design tokens

Tokens are CSS variables in the `@theme` block at the top of `src/app/globals.css`. Tailwind generates utilities from them (`bg-surface`, `text-muted`, `border-line`, `bg-accent`, and so on). The same file defines the layout and type utilities (`shell`, `eyebrow`, `text-display`, `text-heading`, `text-title`, `text-lede`, `panel`).

The accent (`#c9ef6e`) is reserved for live state: selection, focus, status, and the primary action.

### Changing the accent colour

1. Update `--color-accent` and `--color-accent-soft` in the `@theme` block of `globals.css`. Check that `--color-accent-ink` still has enough contrast on top of it.
2. Update the `rgb(201 239 110 / …)` literals further down `globals.css`: the `pulse-dot` keyframes and the `html[data-xray]` outline. Keyframes and that selector use literal copies of the accent.
3. Update the hex literals in `src/app/icon.svg`, `src/app/apple-icon.tsx` and `src/app/opengraph-image.tsx`. Image generation can't read CSS variables.
4. Update `ACCENT_RGB` in `src/components/hero-field.tsx` (the hero canvas paints with literal RGB values; `BASE_RGB` there mirrors `--color-fg`).

## Accessibility and motion

- Semantic landmarks and headings, a skip link, and visible focus rings on every interactive element.
- Everything is reachable by keyboard. Approach tabs use roving tabindex with arrow keys; the command palette is a combobox with `aria-activedescendant`; Toolbox tools are `aria-pressed` toggle buttons; disclosures expose `aria-expanded` and `aria-controls`.
- State is never shown by colour alone, and touch targets are at least 40px.
- Section navigation moves focus to the target section so screen readers follow along.
- Motion is limited to short CSS transitions on transform, opacity and colour. Scroll reveals use CSS scroll-driven animations as progressive enhancement.
- With `prefers-reduced-motion: reduce`, animations and transitions are effectively disabled and any JavaScript animation renders a single static frame. JavaScript animation loops also pause when offscreen or when the tab is hidden.

## Deploy

Works on [Vercel](https://vercel.com) with no configuration, or on any Node.js host (set `NEXT_PUBLIC_SITE_URL` there):

```bash
pnpm build
pnpm start
```

Set `NEXT_PUBLIC_SITE_URL` in the host's environment before building; it is inlined at build time.
