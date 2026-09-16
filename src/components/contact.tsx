import { contact, links, profile, sections } from "@/content/site";
import { CopyButton } from "@/components/copy-button";
import { displayUrl } from "@/lib/format";

type Channel = { name: string; protocol: string; href: string; value: string; external: boolean };

export function Contact() {
  const meta = sections.find((s) => s.id === "contact")!;
  const channels: Channel[] = [
    { name: "Email", protocol: "mailto", href: `mailto:${links.email}`, value: links.email, external: false },
    { name: "LinkedIn", protocol: "https", href: links.linkedin, value: displayUrl(links.linkedin), external: true },
  ];
  if (links.github) {
    channels.push({ name: "GitHub", protocol: "https", href: links.github, value: displayUrl(links.github), external: true });
  }
  const status = [profile.availability, profile.responseTime].filter(Boolean);

  return (
    <section id="contact" aria-labelledby="contact-title" tabIndex={-1} className="border-t border-line py-28 outline-none md:py-44">
      <div className="shell">
        <header className="reveal">
          <p className="eyebrow flex items-center gap-3">
            <span className="text-fg">{meta.index}</span>
            <span aria-hidden className="size-[3px] shrink-0 rounded-full bg-subtle" />
            <span>{meta.label}</span>
          </p>
          <h2 id="contact-title" className="text-display mt-8 max-w-[14ch] md:mt-10">
            {contact.title}
          </h2>
          <p className="text-lede mt-8 max-w-[52ch]">{contact.body}</p>
        </header>

        <ul role="list" className="reveal mt-14 border-t border-line md:mt-20">
          {channels.map((channel) => (
            <li
              key={channel.name}
              className="group relative isolate grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-b border-line py-5 md:grid-cols-12 md:gap-x-8 md:py-7"
            >
              {/* Hover band bleeds slightly past the hairlines; -z-10 keeps it under the text (li is isolated). */}
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-x-4 inset-y-0 -z-10 bg-surface/50 opacity-0 transition-opacity duration-300 ease-out-expo group-focus-within:opacity-100 group-hover:opacity-100 md:-inset-x-6"
              />

              <p className="col-start-1 flex items-center gap-3 md:col-span-3">
                <span aria-hidden className="font-mono text-xs text-subtle/70">
                  {channel.protocol}
                </span>
                <span aria-hidden className="size-[3px] shrink-0 rounded-full bg-subtle" />
                <span className="eyebrow">{channel.name}</span>
              </p>

              {/* The link's ::after stretches over the whole row, so the row is the hit target.
                  Full row width on mobile (action sits on the label row) so addresses don't break mid-word. */}
              <a
                href={channel.href}
                target={channel.external ? "_blank" : undefined}
                rel={channel.external ? "noreferrer" : undefined}
                className="col-span-2 col-start-1 justify-self-start text-[clamp(1.5rem,3.2vw,2.5rem)] leading-tight font-medium tracking-tight wrap-anywhere text-fg after:absolute after:-inset-x-4 after:inset-y-0 md:col-span-7 md:col-start-4 md:after:-inset-x-6"
              >
                {channel.value}
                {channel.external && <span className="sr-only"> (opens in new tab)</span>}
              </a>

              <div className="col-start-2 row-start-1 justify-self-end md:col-span-2 md:col-start-11">
                {channel.external ? (
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-6 text-subtle transition duration-300 ease-out-expo group-focus-within:translate-x-[3px] group-focus-within:-translate-y-[3px] group-focus-within:text-fg group-hover:translate-x-[3px] group-hover:-translate-y-[3px] group-hover:text-fg"
                  >
                    <path d="M7 17 17 7M8 7h9v9" />
                  </svg>
                ) : (
                  <CopyButton text={links.email} />
                )}
              </div>
            </li>
          ))}
        </ul>

        {status.length > 0 && (
          <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs text-subtle md:mt-10">
            <span aria-hidden className="size-1.5 rounded-full bg-accent" />
            {status.map((item, i) => (
              <span key={item} className="flex items-center gap-3">
                {i > 0 && <span aria-hidden>·</span>}
                {item}
              </span>
            ))}
          </p>
        )}
      </div>
    </section>
  );
}
