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
  headline: "I build AI products and backend systems that make it past the demo.",
  lede: "Forward deployed engineer with 5+ years in backend and DevOps. I work close to the problem, design the system, and ship it to production on Azure, AWS, or wherever it needs to run.",
  // Short descriptions used for SEO / social cards.
  description:
    "Kartik Parmar, Forward Deployed Engineer, building practical AI products and reliable backend systems with Python, FastAPI, PostgreSQL, Azure and AWS.",
  // TODO: set to what's true right now (e.g. "Open to new projects") to show the live status dot; null hides it.
  availability: null as string | null,
  // TODO: set a response time you can keep (e.g. "Usually replies within 2 business days"); null hides it.
  responseTime: null as string | null,
  focus: ["AI products", "Backend systems", "DevOps"],
  coreStack: ["Python", "FastAPI", "PostgreSQL", "LLMs", "Azure", "AWS", "Docker"],
};

export const work = {
  title: "Systems designed, built, and kept running.",
  intro:
    "Representative case studies. Each one covers the problem, what I owned, and the engineering decisions that mattered. That's the part a list of technologies leaves out.",
};

export const links = {
  email: "hello@kartikcodes.io",
  // Profile URLs use the /in/ path. Adjust if yours differs.
  linkedin: "https://www.linkedin.com/in/kartikindian",
  // TODO: add your GitHub profile URL to show it on the site, e.g. "https://github.com/username".
  github: null as string | null,
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
      summary: "Sit with the people who have the problem. Map the workflow, the data, and the constraints nobody wrote down.",
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
      summary: "Choose the simplest architecture that can handle real traffic, real data, and real failure.",
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
      summary: "Infrastructure as code, repeatable pipelines, and a rollback plan before the first release.",
      doing: [
        "Containerise and promote one image through every environment",
        "Automate CI/CD, secrets, and infrastructure in code",
        "Wire up logs, metrics, and alerts on what users actually feel",
      ],
      output: ["IaC + CI/CD pipeline", "Observability dashboards", "Runbook"],
      question: "How do we roll this back at 2am?",
    },
    {
      id: "improve",
      name: "Improve",
      summary: "Measure real usage, evaluate model quality, and iterate on what matters, not what's fun.",
      doing: [
        "Run evaluation sets on every prompt or model change",
        "Watch latency, cost, and failure modes in production",
        "Feed what users actually do back into the backlog",
      ],
      output: ["Evaluation reports", "Cost & latency tracking", "Prioritised backlog"],
      question: "What are users doing that we didn't expect?",
    },
  ],
};

/**
 * Toolbox, organised as layers of a system (top = closest to the user).
 * `projects` lists project ids from ./projects.ts that used the tool.
 * Selecting a tool on the site highlights those case studies.
 * TODO: prune or extend to match what you actually use.
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
        { name: "OpenAI / Azure OpenAI", note: "Chat, embeddings, and structured outputs behind typed service layers.", projects: ["doc-intelligence", "knowledge-assistant"] },
        { name: "RAG pipelines", note: "Chunking, retrieval, and re-ranking with citations back to the source.", projects: ["knowledge-assistant"] },
        { name: "Structured outputs", note: "JSON-schema / Pydantic-validated model responses, retries on invalid output.", projects: ["doc-intelligence"] },
        { name: "LLM evaluation", note: "Fixed question sets and regression checks on every prompt change.", projects: ["knowledge-assistant", "doc-intelligence"] },
        { name: "Prompt engineering", note: "Versioned prompts treated like code: reviewed, tested, rolled back.", projects: ["doc-intelligence", "knowledge-assistant"] },
      ],
    },
    {
      id: "backend",
      name: "Backend & APIs",
      blurb: "The contracts everything else depends on.",
      tools: [
        { name: "Python", note: "Primary language for services, workers, and automation.", projects: ["doc-intelligence", "knowledge-assistant", "auth-platform"] },
        { name: "FastAPI", note: "Async APIs with OpenAPI contracts generated from typed models.", projects: ["doc-intelligence", "knowledge-assistant", "auth-platform"] },
        { name: "Pydantic", note: "Validation at every boundary: requests, config, and model output.", projects: ["doc-intelligence", "auth-platform"] },
        { name: "OAuth2 / OIDC & JWT", note: "Token flows, refresh rotation, RBAC, and API keys.", projects: ["auth-platform", "knowledge-assistant"] },
        { name: "Background workers", note: "Queues and idempotent jobs for slow or flaky work.", projects: ["doc-intelligence"] },
      ],
    },
    {
      id: "data",
      name: "Databases & Systems",
      blurb: "Where correctness actually lives.",
      tools: [
        { name: "PostgreSQL", note: "Schema design, indexing, row-level security, migrations.", projects: ["doc-intelligence", "knowledge-assistant", "auth-platform"] },
        { name: "pgvector", note: "Vector search next to relational data, so there's one database to operate.", projects: ["knowledge-assistant"] },
        { name: "Redis", note: "Caching, rate limiting, and short-lived session state.", projects: ["auth-platform"] },
        { name: "SQLAlchemy & Alembic", note: "Typed data access and versioned schema migrations.", projects: ["auth-platform", "doc-intelligence"] },
      ],
    },
    {
      id: "cloud",
      name: "Cloud & Infrastructure",
      blurb: "Running it for real, not just locally.",
      tools: [
        { name: "Azure", note: "~2 years in production: Container Apps, App Service, Key Vault, Monitor.", projects: ["azure-platform", "doc-intelligence", "knowledge-assistant"] },
        { name: "AWS", note: "ECS, RDS, S3, Lambda, and IAM for backend workloads.", projects: ["auth-platform"] },
        { name: "Docker", note: "One image built once and promoted through every environment.", projects: ["azure-platform", "auth-platform", "doc-intelligence"] },
        { name: "Terraform", note: "Infrastructure in code, reviewed like any other change.", projects: ["azure-platform", "auth-platform"] },
        { name: "Linux & Nginx", note: "The layer that still matters when everything else is abstracted.", projects: ["auth-platform"] },
      ],
    },
    {
      id: "dx",
      name: "Developer Experience",
      blurb: "Making the right thing the easy thing.",
      tools: [
        { name: "CI/CD pipelines", note: "GitHub Actions and Azure DevOps: test, scan, build, deploy.", projects: ["azure-platform", "auth-platform"] },
        { name: "Observability", note: "Structured logs, traces, and alerts on user-facing symptoms.", projects: ["azure-platform", "doc-intelligence"] },
        { name: "pytest", note: "Tests at the boundaries that break in production.", projects: ["auth-platform", "doc-intelligence"] },
        { name: "Git & code review", note: "Small PRs, clear history, reviews that teach.", projects: [] },
      ],
    },
  ],
};

export const about = {
  title: "The part after the demo is where I do my best work.",
  paragraphs: [
    "I'm Kartik, a forward deployed engineer who likes sitting close to real problems. For 5+ years I've built backend systems and the infrastructure under them, including around two years running production workloads on Azure.",
    "After a CS degree and a stretch as a Senior Software Engineer, I went freelance to work directly with teams who need something built, not just discussed. Most of that work is practical AI: taking a promising model call and turning it into a product that is secure, observable, and still running next quarter.",
    "Away from the keyboard I'm usually on a motorcycle, in the gym, deep in a game, or tinkering with some piece of creative tech that has no business plan at all.",
  ],
  // Rendered as a small YAML-style config card.
  config: [
    { key: "role", value: "forward-deployed-engineer" },
    { key: "experience", value: "5+ years", comment: "backend & devops" },
    { key: "cloud", value: "[azure, aws]", comment: "~2y azure in prod" },
    { key: "education", value: "BE, Computer Science" },
    { key: "previously", value: "Senior Software Engineer" },
    { key: "mode", value: "freelance" },
  ],
  offHours: ["motorcycles", "gaming", "fitness", "creative tech", "building things"],
};

export const contact = {
  title: "Have a problem that needs to reach production?",
  body: "Tell me what's slow, manual, or stuck at prototype. I'll give you an honest read on whether I can help, and what the simplest version looks like.",
};

/**
 * Contact form, delivered to a Google Form. Setup steps: README > "Contact form".
 * TODO: set `formId` and the five `entries` from your form's pre-filled link.
 * While `formId` is null the form still works: it opens the visitor's email app with the message filled in.
 */
export const contactForm = {
  formId: null as string | null,
  entries: {
    name: "entry.0000000000",
    email: "entry.0000000000",
    company: "entry.0000000000",
    topic: "entry.0000000000",
    message: "entry.0000000000",
  },
  // Must match the options of the Google Form's multiple-choice question exactly.
  topics: ["AI product or LLM feature", "Backend system or API", "Cloud, DevOps or infrastructure", "Full-time role", "Something else"],
};
