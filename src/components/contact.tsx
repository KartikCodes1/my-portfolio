import { contact, links, profile, sections } from "@/content/site";
import { ContactForm } from "@/components/contact-form";
import { CopyButton } from "@/components/copy-button";
import { displayUrl } from "@/lib/format";

export function Contact() {
  const meta = sections.find((s) => s.id === "contact")!;
  const profiles = [
    { name: "LinkedIn", href: links.linkedin },
    ...(links.github ? [{ name: "GitHub", href: links.github }] : []),
  ];
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

        <div className="mt-14 grid gap-12 md:mt-20 lg:grid-cols-12 lg:gap-8">
          <div className="reveal lg:col-span-8">
            <ContactForm />
          </div>

          <aside aria-labelledby="contact-direct" className="reveal lg:col-span-4 lg:pt-2">
            <h3 id="contact-direct" className="eyebrow">
              Prefer email?
            </h3>
            <a
              href={`mailto:${links.email}`}
              className="mt-4 block text-[clamp(1.25rem,1.8vw,1.5rem)] leading-snug font-medium tracking-tight wrap-anywhere text-fg underline decoration-line-strong underline-offset-[6px] transition-colors duration-200 hover:decoration-fg focus-visible:decoration-fg"
            >
              {links.email}
            </a>
            <div className="mt-4">
              <CopyButton text={links.email} />
            </div>

            <ul role="list" className="mt-10 border-t border-line">
              {profiles.map((p) => (
                <li key={p.name} className="border-b border-line">
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex min-h-14 items-center justify-between gap-4 text-sm transition-colors duration-200"
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="eyebrow">{p.name}</span>
                      <span className="mt-1 truncate text-muted transition-colors group-hover:text-fg group-focus-visible:text-fg">
                        {displayUrl(p.href)}
                      </span>
                    </span>
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-5 shrink-0 text-subtle transition duration-300 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-fg group-focus-visible:text-fg"
                    >
                      <path d="M7 17 17 7M8 7h9v9" />
                    </svg>
                    <span className="sr-only"> (opens in new tab)</span>
                  </a>
                </li>
              ))}
            </ul>

            {status.length > 0 && (
              <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs text-subtle">
                <span aria-hidden className="size-1.5 rounded-full bg-accent" />
                {status.map((item, i) => (
                  <span key={item} className="flex items-center gap-3">
                    {i > 0 && <span aria-hidden>·</span>}
                    {item}
                  </span>
                ))}
              </p>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
