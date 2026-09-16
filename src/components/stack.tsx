import { stack } from "@/content/site";
import { projects } from "@/content/projects";
import { SectionHeading } from "@/components/section-heading";
import { StackExplorer } from "@/components/stack-explorer";

export function Stack() {
  // Only titles and draft flags cross the client boundary, not whole case studies.
  const projectTitles = Object.fromEntries(projects.map((p) => [p.id, { title: p.title, draft: p.draft }]));

  return (
    <section
      id="stack"
      aria-labelledby="stack-title"
      tabIndex={-1}
      className="border-t border-line py-24 outline-none md:py-36"
    >
      <div className="shell">
        <SectionHeading section="stack" title={stack.title} intro={stack.intro} />
        <StackExplorer layers={stack.layers} projectTitles={projectTitles} />
      </div>
    </section>
  );
}
