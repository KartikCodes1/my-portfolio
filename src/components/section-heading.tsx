import { sections, type SectionId } from "@/content/site";

/** Standard section header: mono index label, heading, optional intro. */
export function SectionHeading({ section, title, intro }: { section: SectionId; title: string; intro?: string }) {
  const meta = sections.find((s) => s.id === section)!;
  return (
    <header className="reveal grid gap-6 md:grid-cols-12 md:gap-8">
      <p className="eyebrow flex items-center gap-3 md:col-span-3 md:self-start md:pt-5">
        <span className="text-fg">{meta.index}</span>
        <span aria-hidden className="size-[3px] shrink-0 rounded-full bg-subtle" />
        <span>{meta.label}</span>
      </p>
      <div className="md:col-span-9">
        <h2 id={`${section}-title`} className="text-heading max-w-[20ch]">
          {title}
        </h2>
        {intro && <p className="text-lede mt-6 max-w-[62ch]">{intro}</p>}
      </div>
    </header>
  );
}
