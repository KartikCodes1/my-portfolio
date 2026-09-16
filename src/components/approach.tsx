import { approach } from "@/content/site";
import { SectionHeading } from "@/components/section-heading";
import { ApproachPipeline } from "@/components/approach-pipeline";

export function Approach() {
  return (
    <section
      id="approach"
      aria-labelledby="approach-title"
      tabIndex={-1}
      className="border-t border-line py-24 outline-none md:py-36"
    >
      <div className="shell">
        <SectionHeading section="approach" title={approach.title} intro={approach.intro} />
        <ApproachPipeline stages={approach.stages} />
      </div>
    </section>
  );
}
