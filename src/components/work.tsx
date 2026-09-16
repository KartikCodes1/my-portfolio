import { projects } from "@/content/projects";
import { work } from "@/content/site";
import { ProjectList } from "@/components/project-list";
import { SectionHeading } from "@/components/section-heading";

export function Work() {
  return (
    <section id="work" aria-labelledby="work-title" tabIndex={-1} className="border-t border-line py-24 outline-none md:py-36">
      <div className="shell">
        <SectionHeading section="work" title={work.title} intro={work.intro} />
        <ProjectList projects={projects} />
      </div>
    </section>
  );
}
