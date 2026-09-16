import { profile } from "@/content/site";
import { PaletteKeys } from "@/components/palette-keys";

export function Footer() {
  // ponytail: evaluated at prerender, so it refreshes on the next build/deploy.
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line">
      <div className="shell flex flex-col gap-4 py-8 font-mono text-xs text-subtle md:flex-row md:items-center md:justify-between">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>
            © {year} {profile.name}
          </span>
          <span aria-hidden>·</span>
          <span>Built with Next.js &amp; Tailwind CSS</span>
        </p>

        {/* Keyboard hints are noise on touch-sized screens; the header Menu covers navigation there. */}
        <div className="hidden flex-wrap items-center gap-x-6 gap-y-3 md:flex">
          <p className="flex items-center gap-2">
            <PaletteKeys />
            palette
          </p>
          <p className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <kbd>Ctrl</kbd>
              <kbd>`</kbd>
            </span>
            terminal
          </p>
          <span aria-hidden title="psst" className="tracking-widest text-subtle">
            ↑↑↓↓←→←→BA
          </span>
        </div>
      </div>
    </footer>
  );
}
