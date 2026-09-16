import Link from "next/link";
import { links, profile, sections } from "@/content/site";
import { displayUrl } from "@/lib/format";

const linkClass =
  "inline-flex min-h-8 items-center gap-1.5 text-sm text-muted transition-colors duration-200 hover:text-fg focus-visible:text-fg";

export function Footer() {
  // Evaluated at prerender, so the year updates on the next build or deploy.
  const year = new Date().getFullYear();

  const contactLinks = [
    { label: links.email, href: `mailto:${links.email}`, external: false },
    { label: displayUrl(links.linkedin), href: links.linkedin, external: true },
    ...(links.github ? [{ label: displayUrl(links.github), href: links.github, external: true }] : []),
  ];

  return (
    <footer className="border-t border-line">
      <div className="shell py-14 md:py-20">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <p className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="grid size-7 shrink-0 place-items-center rounded-md border border-line-strong font-mono text-[11px] text-fg"
              >
                {profile.initials}
              </span>
              <span className="text-sm font-medium text-fg">{profile.name}</span>
            </p>
            <p className="mt-2 text-sm text-subtle">{profile.role}</p>
            <p className="mt-6 max-w-[36ch] text-[15px] leading-relaxed text-pretty text-muted">{profile.headline}</p>
          </div>

          {/* "/#id" rather than "#id" so the links also work from the 404 page. */}
          <nav aria-labelledby="footer-sections" className="md:col-span-3 md:col-start-7">
            <p id="footer-sections" className="eyebrow">
              Sections
            </p>
            <ul role="list" className="mt-4 space-y-1">
              {sections
                .filter((s) => s.id !== "top")
                .map((s) => (
                  <li key={s.id}>
                    <Link href={`/#${s.id}`} className={linkClass}>
                      {s.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>

          <div className="md:col-span-3 md:col-start-10">
            <p id="footer-contact" className="eyebrow">
              Contact
            </p>
            <ul role="list" aria-labelledby="footer-contact" className="mt-4 space-y-1">
              {contactLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noreferrer" : undefined}
                    className={`${linkClass} wrap-anywhere`}
                  >
                    {link.label}
                    {link.external && (
                      <>
                        <span aria-hidden className="text-subtle">
                          ↗
                        </span>
                        <span className="sr-only"> (opens in new tab)</span>
                      </>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col-reverse gap-3 border-t border-line pt-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {profile.name}. All rights reserved.
          </p>
          <Link href="/#top" className="inline-flex min-h-8 items-center gap-1.5 transition-colors duration-200 hover:text-fg focus-visible:text-fg">
            Back to top
            <span aria-hidden>↑</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
