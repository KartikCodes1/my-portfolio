/**
 * Everything personal on the site lives in this folder.
 * Edit freely. Components read from here and never hard-code copy.
 * Anything marked `TODO` is a placeholder waiting for real information.
 */

export const profile = {
  name: "Kartik Parmar",
  initials: "KP",
  // Lower-case short name used in technical flavour text: terminal prompt, config filename, hero readout.
  handle: "kartik",
  role: "Forward Deployed Engineer",
  location: { city: "Ahmedabad", country: "India", countryCode: "IN" },
  headline: "I build AI products and backend systems that make it past the demo.",
  lede: "Forward deployed engineer with 5+ years in backend systems and DevOps, now building RAG pipelines, agentic AI workflows and the Python services behind them. I work close to the problem, design the system and ship it to production on AWS, GCP, Azure or wherever it needs to run.",
  // Short description used for social cards.
  description:
    "Kartik Parmar, Forward Deployed Engineer, building AI products, RAG pipelines, agentic AI workflows and Python/FastAPI backends on AWS, GCP and Azure.",
  // TODO: set to what's true right now (e.g. "Open to new projects") to show the live status dot; null hides it.
  availability: null as string | null,
  // TODO: set a response time you can keep (e.g. "Usually replies within 2 business days"); null hides it.
  responseTime: null as string | null,
  focus: ["AI products", "Backend systems", "DevOps"],
  coreStack: ["Python", "FastAPI", "PostgreSQL", "LangChain", "AWS", "GCP", "Azure"],
};

/**
 * Search engine copy. The title and description are what Google shows in results;
 * keep the description around 150 characters. Keywords only feed the meta keywords tag
 * (Google ignores it); JSON-LD knowsAbout is built from `stack` in layout.tsx.
 * Update `updated` whenever the content changes: it feeds the sitemap and JSON-LD dateModified.
 */
export const seo = {
  updated: "2026-09-17",
  title: "Kartik Parmar | Forward Deployed AI Engineer, Ahmedabad",
  description:
    "Forward Deployed Engineer in Ahmedabad, India. 5+ years in backend and DevOps, now building RAG, agentic AI and FastAPI services on AWS, GCP and Azure.",
  keywords: [
    "Kartik Parmar",
    "Forward Deployed Engineer",
    "AI Engineer",
    "Generative AI Engineer",
    "LLM Engineer",
    "RAG pipelines",
    "Agentic AI",
    "AI agents",
    "LangChain",
    "LlamaIndex",
    "LangGraph",
    "CrewAI",
    "LlamaParse",
    "FastAPI developer",
    "Python backend engineer",
    "PostgreSQL",
    "pgvector",
    "Celery",
    "AWS",
    "GCP",
    "Azure",
    "Healthcare AI",
    "Pharmacovigilance AI",
    "Freelance AI engineer",
    "Ahmedabad",
    "India",
  ],
};

export const work = {
  title: "Systems designed, built and kept running.",
  intro:
    "Case studies from real projects. Each one covers the problem, what I owned and the engineering decisions that mattered. Company and client names are left out on purpose.",
};

export const links = {
  email: "hello@kartikcodes.io",
  // Profile URLs use the /in/ path. Adjust if yours differs.
  linkedin: "https://www.linkedin.com/in/kartikindian",
  // Set to null to hide GitHub from the footer, contact section, palette, terminal and JSON-LD.
  github: "https://github.com/KartikCodes1" as string | null,
};

/** In-page sections, in order. `id` is the DOM id; `index` is the mono label. */
export const sections = [
  { id: "top", index: "00", label: "Index" },
  { id: "work", index: "01", label: "Selected work" },
  { id: "approach", index: "02", label: "Approach" },
  { id: "stack", index: "03", label: "Toolbox" },
  { id: "about", index: "04", label: "About" },
  { id: "contact", index: "05", label: "Contact" },
] as const;

export type SectionId = (typeof sections)[number]["id"];

export const approach = {
  title: "Understand the problem before touching the keyboard.",
  intro:
    "Most failed projects were well built and aimed at the wrong thing. I run every engagement as a loop: get the problem right, pick the simplest architecture that survives production, ship, then let real usage decide what's next.",
  stages: [
    {
      id: "understand",
      name: "Understand",
      summary: "Sit with the people who have the problem. Map the workflow, the data and the constraints nobody wrote down.",
      doing: [
        "Shadow the current workflow and find where time actually goes",
        "Audit the data that exists, and the data that doesn't",
        "Agree on what success means in numbers the business already tracks",
      ],
      output: ["Problem brief", "Constraints & risks", "Success criteria"],
      question: "If this works perfectly, what changes for whom?",
    },
    {
      id: "design",
      name: "Design",
      summary: "Choose the simplest architecture that can handle real traffic, real data and real failure.",
      doing: [
        "Sketch the system: services, queues, stores, boundaries",
        "Define API contracts and the data model before implementation",
        "Decide where an LLM helps and where plain code is better",
      ],
      output: ["Architecture sketch", "API contract (OpenAPI)", "Data model"],
      question: "What's the least clever design that still works at 10×?",
    },
    {
      id: "build",
      name: "Build",
      summary: "Typed, tested, boring code. Validation at every boundary, especially around model output.",
      doing: [
        "Ship a thin vertical slice end-to-end first",
        "Treat LLM output as untrusted input: schemas, retries, fallbacks",
        "Test the edges: auth, idempotency, bad data, timeouts",
      ],
      output: ["Working vertical slice", "Tests at the boundaries", "Docs someone else can follow"],
      question: "Could someone else maintain this in six months?",
    },
    {
      id: "deploy",
      name: "Deploy",
      summary: "Infrastructure as code, repeatable pipelines and a rollback plan before the first release.",
      doing: [
        "Containerise and promote one image through every environment",
        "Automate CI/CD, secrets and infrastructure in code",
        "Wire up logs, metrics and alerts on what users actually feel",
      ],
      output: ["IaC + CI/CD pipeline", "Observability dashboards", "Runbook"],
      question: "How do we roll this back at 2am?",
    },
    {
      id: "improve",
      name: "Improve",
      summary: "Measure real usage, evaluate model quality and iterate on what matters, not what's fun.",
      doing: [
        "Run evaluation sets on every prompt or model change",
        "Watch latency, cost and failure modes in production",
        "Feed what users actually do back into the backlog",
      ],
      output: ["Evaluation reports", "Cost & latency tracking", "Prioritised backlog"],
      question: "What are users doing that we didn't expect?",
    },
  ],
};

/**
 * Toolbox, organised as layers of a system (top = closest to the user).
 * Only tools from Kartik's resume and project notes. `projects` lists project ids
 * from ./projects.ts that used the tool; selecting a tool highlights those case studies.
 */
export const stack = {
  title: "A toolbox organised like a system, not a logo wall.",
  intro: "Each layer is part of how a production system comes together. Pick any tool to see what I use it for and where it shows up in my work.",
  layers: [
    {
      id: "ai",
      name: "AI & LLM Engineering",
      blurb: "Turning models into features people can trust.",
      tools: [
        { name: "LLMs & OpenAI", note: "OpenAI and other LLM APIs behind typed Python services, for generation, chat and extraction.", projects: ["cliniwise-ai", "blogbuster"] },
        { name: "RAG pipelines", note: "Retrieval-augmented generation over vector search, so answers are grounded in the right documents.", projects: [] },
        { name: "AI orchestration", note: "Coordinating AI agents, generation and job queues, including a new orchestration layer that improved generation and queuing.", projects: ["covigilai"] },
        { name: "Agentic AI", note: "Multi-agent workflows with LangGraph, CrewAI and AutoGen, cutting manual orchestration effort by about 30%. AutoGen's successor is now Microsoft Agent Framework.", projects: [] },
        { name: "LangChain & LlamaIndex", note: "Frameworks for connecting LLMs to data: loading, indexing, retrieval and agent tooling.", projects: [] },
        { name: "Document parsing", note: "LlamaParse for accurate extraction, after starting with a custom PyMuPDF extractor.", projects: ["amplify-ingestion"] },
        { name: "Multimodal pipelines", note: "Processing text, images and voice to improve conversational AI agents.", projects: [] },
        { name: "LLM fine-tuning", note: "Adapting models to a domain when prompting and retrieval aren't enough.", projects: [] },
      ],
    },
    {
      id: "backend",
      name: "Backend & APIs",
      blurb: "The contracts everything else depends on.",
      tools: [
        { name: "Python", note: "Primary language for services, background workers and AI pipelines.", projects: ["cliniwise-ai", "amplify-ingestion", "blogbuster", "auth-module"] },
        { name: "FastAPI", note: "Async APIs for microservices and AI backends.", projects: ["cliniwise-ai", "amplify-ingestion", "blogbuster"] },
        { name: "Microservices", note: "Distributed backends split into services that deploy and scale independently.", projects: ["cliniwise-ai"] },
        { name: "Celery", note: "Background workers for long-running AI jobs and scheduled work.", projects: ["cliniwise-ai", "blogbuster"] },
        { name: "Pydantic", note: "Schema validation for requests and for data extracted from documents.", projects: ["amplify-ingestion"] },
        { name: "OpenID Connect & OAuth 2.0", note: "Standards-based authentication with security tests and production configuration.", projects: ["auth-module"] },
        { name: "Flask", note: "Lightweight Python web services.", projects: [] },
      ],
    },
    {
      id: "data",
      name: "Databases & Systems",
      blurb: "Where correctness actually lives.",
      tools: [
        { name: "PostgreSQL", note: "The system of record for services, jobs and application data.", projects: ["cliniwise-ai", "amplify-ingestion", "blogbuster"] },
        { name: "pgvector", note: "Vector search inside PostgreSQL, next to the relational data it belongs to.", projects: [] },
        { name: "Vector databases", note: "Similarity search over embeddings for RAG.", projects: [] },
        { name: "MySQL", note: "Relational storage for backend services and application data.", projects: [] },
      ],
    },
    {
      id: "cloud",
      name: "Cloud & Infrastructure",
      blurb: "Running it for real, not just locally.",
      tools: [
        { name: "AWS", note: "ECS and Lambda for the BlogBuster backend in production. As a technical lead I also optimised AWS deployments to cut infrastructure spend.", projects: ["blogbuster", "cliniwise-ai"] },
        { name: "Azure", note: "About 2 years in production, plus an isolated deployment in private subnets for a client with strict data privacy requirements.", projects: ["cliniwise-ai", "amplify-ingestion"] },
        { name: "GCP", note: "Part of multi-cloud deployments alongside AWS and Azure.", projects: ["cliniwise-ai"] },
        { name: "Docker", note: "Containerised services that run the same way in every environment.", projects: ["amplify-ingestion"] },
        { name: "Kubernetes", note: "Orchestrating containerised services.", projects: [] },
      ],
    },
    {
      id: "delivery",
      name: "Delivery & Leadership",
      blurb: "Shipping it, safely and quickly.",
      tools: [
        { name: "pytest", note: "Test suites that include security testing, not just the happy path.", projects: ["auth-module"] },
        { name: "Rapid AI MVPs", note: "MVPs built on AI agents, shipped within 3 days so clients can validate ideas early.", projects: [] },
        { name: "HIPAA-aware delivery", note: "Healthcare data handling that meets regulatory standards on med-tech work.", projects: [] },
        { name: "Technical leadership", note: "Leading several concurrent AI projects and mentoring junior engineers on scalable FastAPI backends.", projects: [] },
      ],
    },
  ],
};

export const about = {
  title: "The part after the demo is where I do my best work.",
  paragraphs: [
    "I'm Kartik, a forward deployed AI engineer based in Ahmedabad, India. For 5+ years I've built backend systems and the infrastructure under them, and today most of that work is AI: RAG pipelines, agentic workflows and the Python services that keep them running in production.",
    "As a senior software engineer, I designed and owned the backend of a clinical trial AI platform, cutting narration time from 3 hours to 5 minutes. I also delivered RAG systems that reached 95% retrieval accuracy and RAG MVPs that halved client onboarding time. Now I work as a technical lead on AI projects, including a med-tech initiative built to HIPAA standards, and take on freelance engagements where I can own a problem end to end.",
    "Away from the keyboard I'm usually on a motorcycle, in the gym, deep in a game or tinkering with some piece of creative tech that has no business plan at all.",
  ],
  // Rendered as a small YAML-style config card.
  config: [
    { key: "role", value: "forward deployed engineer" },
    { key: "now", value: "technical lead + freelance" },
    { key: "experience", value: "5+ years", comment: "backend & devops, mostly ai today" },
    { key: "cloud", value: "[aws, gcp, azure]", comment: "~2y azure in prod" },
    { key: "location", value: "Ahmedabad, India" },
    { key: "previously", value: "senior software engineer" },
  ],
  offHours: ["motorcycles", "gaming", "fitness", "creative tech", "building things"],
};

export const contact = {
  title: "Have a problem that needs to reach production?",
  body: "Tell me what's slow, manual or stuck at prototype. I'll give you an honest read on whether I can help, and what the simplest version looks like.",
};

/**
 * Contact form. Messages are emailed to `links.email` through Resend by src/app/api/contact/route.ts.
 * Setup: README > "Contact form". Until RESEND_API_KEY is set, the form opens the visitor's email app instead.
 */
export const contactForm = {
  topics: ["AI product or LLM feature", "Backend system or API", "Cloud, DevOps or infrastructure", "Full-time role", "Something else"],
  // Enforced by the API route; the form mirrors them as maxLength.
  limits: { name: 100, email: 254, company: 120, message: 5000 },
};
