import Link from "next/link";

export default function NotFound() {
  return (
    // id="main" keeps the layout's "Skip to content" link working on this page too.
    <main id="main" tabIndex={-1} className="shell outline-none grid min-h-[80svh] place-items-center py-24">
      <div className="w-full max-w-xl">
        <p className="eyebrow flex items-center gap-3">
          <span className="text-fg">404</span>
          <span aria-hidden className="size-[3px] shrink-0 rounded-full bg-subtle" />
          <span>Route not found</span>
        </p>

        <h1 className="text-heading mt-6">This path isn&apos;t deployed.</h1>
        <p className="text-lede mt-6">The link may be broken, or the page may have moved. Everything that exists is on the index.</p>

        {/* Flavour only; the heading above already says it all. */}
        <div aria-hidden className="panel mt-10 px-5 py-4 font-mono text-[0.8125rem] leading-6">
          <p className="whitespace-nowrap text-fg">
            <span className="select-none text-subtle">$ </span>curl -I /this-page
          </p>
          <p className="whitespace-nowrap text-muted">HTTP/2 404</p>
          <p className="flex items-center whitespace-nowrap">
            <span className="select-none text-subtle">$&nbsp;</span>
            <span className="inline-block h-4 w-2 animate-[blink_1s_steps(1)_infinite] bg-accent" />
          </p>
        </div>

        <Link
          href="/"
          className="group mt-10 inline-flex h-11 items-center gap-2 rounded-full bg-accent pl-4 pr-5 text-sm font-medium text-accent-ink transition-opacity duration-300 ease-out-expo hover:opacity-90"
        >
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className="size-4 transition-transform duration-300 ease-out-expo group-hover:-translate-x-0.5 group-focus-visible:-translate-x-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 8H3M7 4 3 8l4 4" />
          </svg>
          Back to index
        </Link>
      </div>
    </main>
  );
}
