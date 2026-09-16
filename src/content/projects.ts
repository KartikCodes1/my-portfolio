/**
 * Selected work, from Kartik's resume and his notes on each project.
 *
 * Company and client names are intentionally left out: projects are named, employers are not.
 * `draft: true` renders a visible "Draft" marker; use it for any placeholder you add later.
 * Keep ids stable, or update the matching `projects` lists in ./site.ts `stack`.
 */

export type TraceKind = "client" | "service" | "ai" | "queue" | "store" | "infra";

export type TraceNode = {
  label: string;
  /** Small mono caption under the node, e.g. "FastAPI". */
  detail?: string;
  kind: TraceKind;
};

export type Project = {
  id: string;
  /** true = placeholder content; renders a visible "Draft" marker. */
  draft: boolean;
  title: string;
  /** Domain label, e.g. "AI · Document processing". */
  kicker: string;
  /** One sentence: what the product/system does. */
  summary: string;
  /** Empty strings are hidden on the site. */
  period: string;
  role: string;
  problem: string;
  contribution: string[];
  decisions: { decision: string; why: string }[];
  /** Left-to-right request/data flow for the architecture trace diagram. */
  trace: TraceNode[];
  stack: string[];
  links: { label: string; href: string }[];
  /** Shown when there are no public links, e.g. "Internal project". */
  note?: string;
};

export const projects: Project[] = [
  {
    id: "cliniwise-ai",
    draft: false,
    title: "CliniWise AI",
    kicker: "AI · Clinical trial operations",
    summary:
      "A generative AI platform for clinical trial teams that automates regulatory documentation, including patient and case narratives.",
    period: "",
    role: "Senior Software Engineer",
    problem:
      "Clinical trial teams need patient and case narratives: consistent, submission-ready write-ups built from details in patient records. Producing them by hand is slow, repetitive work.",
    contribution: [
      "Designed and owned the Python microservices backend",
      "Built the services on FastAPI and PostgreSQL, using Celery workers for background jobs",
      "Deployed the backend as a distributed system across AWS, GCP and Azure",
      "Cut narration time from 3 hours to 5 minutes",
    ],
    decisions: [
      {
        decision: "Microservices with background workers",
        why: "Generating a narrative takes far longer than a web request. Running that work on Celery workers keeps the APIs responsive and lets each service scale on its own.",
      },
    ],
    trace: [
      { label: "Patient data", detail: "trial records", kind: "client" },
      { label: "API", detail: "FastAPI", kind: "service" },
      { label: "Task queue", detail: "Celery", kind: "queue" },
      { label: "Narrative", detail: "LLM generation", kind: "ai" },
      { label: "Database", detail: "PostgreSQL", kind: "store" },
    ],
    stack: ["Python", "FastAPI", "PostgreSQL", "Celery", "LLMs", "AWS", "GCP", "Azure"],
    links: [],
  },
  {
    // Kartik joined CoVigilAI mid-development and made major changes; he didn't build it from scratch.
    // TODO: stack still to come from Kartik.
    // Product facts come from its public product site; no link, because that site names the vendor.
    id: "covigilai",
    draft: false,
    title: "CoVigilAI",
    kicker: "AI · Pharmacovigilance",
    summary:
      "An AI platform for drug safety teams that monitors medical literature for adverse drug events, triages potential case reports and produces regulator-ready E2B(R3) safety reports with MedDRA coding.",
    period: "",
    role: "",
    problem:
      "Drug safety teams must regularly screen published medical literature for reports of side effects involving their medicines, then turn each valid case into a structured report for regulators. Doing that by hand across large volumes of articles is slow, repetitive work.",
    contribution: [
      "Picked up the project mid-development and started shipping changes quickly",
      "Optimised the platform's existing AI agents",
      "Implemented a new AI orchestration layer for better generation and job queuing",
      "Fixed authentication issues and strengthened the platform's security",
      "Implemented a freemium model so new users can try the product through a demo",
    ],
    decisions: [
      {
        decision: "Improve the agents and their orchestration instead of starting over",
        why: "The AI agents already existed, so the biggest gains came from optimising them and coordinating generation and queuing better, without the risk of a rewrite.",
      },
      {
        decision: "A freemium tier for trying the product",
        why: "New users can try the platform for themselves in a demo before committing to it.",
      },
    ],
    trace: [
      { label: "Literature", detail: "journals", kind: "client" },
      { label: "Triage", detail: "case reports", kind: "ai" },
      { label: "Extract", detail: "key details", kind: "ai" },
      { label: "Report", detail: "E2B(R3)", kind: "service" },
      { label: "QC review", detail: "audit trail", kind: "service" },
    ],
    stack: [],
    links: [],
  },
  {
    // Kartik's description: researches a brand's own product data and the latest trends to suggest new product ideas.
    // TODO: role and stack if Kartik remembers them.
    id: "amplify-ai",
    draft: false,
    title: "Amplify AI",
    kicker: "AI · Product research",
    summary:
      "An AI research tool that studies a brand's product data, its audience and the latest market trends to suggest new products that audience is likely to love.",
    period: "",
    role: "",
    problem:
      "Brands sit on years of product data and documentation, but turning it into a clear view of what their audience wants next means slow, manual research across that data and fast-moving market trends.",
    contribution: [
      "Built the data ingestion pipeline that turns a brand's product data and documentation into content the AI can analyse",
      "Worked on the research flow that analyses a brand's audience and their tastes alongside the latest trends",
      "Helped turn that analysis into concrete suggestions for new products",
    ],
    decisions: [
      {
        decision: "Ground ideas in the brand's own data",
        why: "Suggestions start from the brand's actual products and documentation rather than generic trends, so they fit what its audience already likes.",
      },
    ],
    trace: [
      { label: "Brand data", detail: "products · docs", kind: "client" },
      { label: "Ingestion", detail: "pipeline", kind: "service" },
      { label: "Trends", detail: "research", kind: "ai" },
      { label: "Audience", detail: "taste analysis", kind: "ai" },
      { label: "Ideas", detail: "new products", kind: "client" },
    ],
    stack: [],
    links: [],
  },
  {
    id: "amplify-ingestion",
    draft: false,
    title: "Amplify AI Data Ingestion Pipeline",
    kicker: "AI · Document ingestion",
    summary:
      "The ingestion module behind Amplify AI: turns PDFs and scans into validated, structured content and routes anything uncertain to a human.",
    period: "",
    role: "",
    problem:
      "Amplify AI's product ideas are only as good as its reading of a brand's documents, so source files had to be extracted accurately before anything reached the analysis. Fully automating extraction wasn't safe either: a wrongly extracted field is worse than one that waits for human review.",
    contribution: [
      "Designed and built the ingestion, extraction and validation pipeline that feeds Amplify AI",
      "Wrote the first extractor on PyMuPDF, then switched extraction to LlamaParse for more accurate results",
      "Built the FastAPI service and async workers that process documents in the background",
      "Validated extracted data against Pydantic schemas and sent low-confidence results to a review queue",
    ],
    decisions: [
      {
        decision: "Move from a custom PyMuPDF extractor to LlamaParse",
        why: "PyMuPDF extracts text and layout quickly, but tables and scanned pages need custom logic or OCR on top of it. LlamaParse's model-based parsing keeps table structure and handles scans, so switching to it made extraction more accurate.",
      },
      {
        decision: "Treat extracted output as untrusted input",
        why: "Every result is validated against a strict schema and retried or escalated when it fails. Bad data never reaches the analysis silently.",
      },
      {
        decision: "Idempotent jobs keyed by document hash",
        why: "Each document's hash maps to exactly one job, so repeat uploads and worker restarts can't create duplicate records, and failed jobs can be retried aggressively.",
      },
    ],
    trace: [
      { label: "Documents", detail: "PDF · scans", kind: "client" },
      { label: "Ingest API", detail: "FastAPI", kind: "service" },
      { label: "Job queue", detail: "idempotent", kind: "queue" },
      { label: "Parse", detail: "LlamaParse", kind: "ai" },
      { label: "Records", detail: "PostgreSQL", kind: "store" },
    ],
    stack: ["Python", "FastAPI", "Pydantic", "LlamaParse", "PyMuPDF", "Azure OpenAI", "PostgreSQL", "Azure Blob Storage", "Docker"],
    links: [],
  },
  {
    id: "blogbuster",
    draft: false,
    title: "BlogBuster",
    kicker: "AI · Content automation",
    summary:
      "An AI article writer that turns a website URL into topic ideas and SEO articles, then schedules and publishes them on autopilot.",
    period: "2024 to now",
    role: "Backend engineer",
    problem:
      "Businesses know regular publishing helps them get found in search, but few have time to research topics, write articles and publish them every week. The product had to start from nothing more than a website URL and handle the rest, for many customers at once.",
    contribution: [
      "Developed the entire multi-tenant backend",
      "Built autopilot article generation from a website URL, with topic suggestions",
      "Added custom domain hosting and scheduled publishing",
      "Integrated Umami analytics for traffic insights on each domain",
      "Deployed on AWS ECS and Lambda, with Celery workers and PostgreSQL",
    ],
    decisions: [
      {
        decision: "Multi-tenant backend",
        why: "Every customer gets their own hosted blog, custom domain, schedule and content, all served by one shared backend. Keeping each tenant's data separated is what lets one platform serve all of them.",
      },
      {
        decision: "Background workers for generation and publishing",
        why: "Researching, writing and publishing an article is slow, multi-step work that doesn't belong in a web request. Celery workers run it in the background and on a schedule.",
      },
    ],
    trace: [
      { label: "Website URL", detail: "input", kind: "client" },
      { label: "API", detail: "FastAPI", kind: "service" },
      { label: "Workers", detail: "Celery", kind: "queue" },
      { label: "Articles", detail: "LLM generation", kind: "ai" },
      { label: "Blog", detail: "custom domain", kind: "service" },
    ],
    stack: ["Python", "FastAPI", "Celery", "PostgreSQL", "AWS ECS", "AWS Lambda", "Umami"],
    links: [{ label: "blogbuster.so", href: "https://www.blogbuster.so" }],
  },
  {
    id: "auth-module",
    draft: false,
    title: "OIDC Authentication Module",
    kicker: "Backend · Identity & security",
    summary:
      "An in-house authentication module built on OpenID Connect, with security testing and production-level configuration.",
    period: "",
    role: "",
    problem:
      "An internal project needed its own authentication module with a proper OpenID Connect setup. Internal or not, it had to be well structured, security tested and configured to production standards.",
    contribution: [
      "Built the authentication module on standard OpenID Connect flows",
      "Kept the codebase well structured and cleanly written",
      "Wrote security-focused pytest suites that cover failure cases, not just successful logins",
      "Set it up with production-level configuration",
    ],
    decisions: [
      {
        decision: "OpenID Connect instead of a home-grown token scheme",
        why: "A widely reviewed standard is safer than custom security logic, and any OIDC-aware client or service can integrate with it.",
      },
      {
        decision: "Security tests as part of the test suite",
        why: "Authentication bugs don't crash; they quietly let the wrong request through. Tests make the failure cases explicit and keep them covered as the code changes.",
      },
      {
        decision: "Production-level configuration for an internal project",
        why: "Systems that never face the public still hold real credentials. Holding configuration and secrets to the same standard as a public service avoids a risky rework later.",
      },
    ],
    trace: [
      { label: "App", detail: "sign-in", kind: "client" },
      { label: "Auth module", detail: "OIDC", kind: "service" },
      { label: "Tokens", detail: "JWT validation", kind: "infra" },
      { label: "Services", detail: "protected APIs", kind: "service" },
    ],
    stack: ["Python", "OpenID Connect", "OAuth 2.0", "JWT", "pytest"],
    links: [],
    note: "Internal project, not publicly available.",
  },
];
