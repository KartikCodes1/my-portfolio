import { Hero } from "@/components/hero";
import { Work } from "@/components/work";
import { Approach } from "@/components/approach";
import { Stack } from "@/components/stack";
import { About } from "@/components/about";
import { Contact } from "@/components/contact";

export default function Home() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <Hero />
      <Work />
      <Approach />
      <Stack />
      <About />
      <Contact />
    </main>
  );
}
