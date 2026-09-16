/**
 * Selected work.
 *
 * ⚠️ Every project below is PLACEHOLDER content (`draft: true`), written to show
 * the shape of a good case study. Nothing here is a real client, metric, or result.
 * Replace the text with your real work, then set `draft: false` to remove the
 * "Draft" marker on the site. Keep ids stable if you reference them in ./site.ts.
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
  period: string;
  role: string;
  problem: string;
  contribution: string[];
  decisions: { decision: string; why: string }[];
  /** Left-to-right request/data flow for the architecture trace diagram. */
  trace: TraceNode[];
  stack: string[];
  links: { label: string; href: string }[];
  /** Shown when there are no public links, e.g. NDA note. */
  note?: string;
};

export const projects: Project[] = [
  {
    id: "doc-intelligence",
    draft: true,
    title: "Document Intelligence Pipeline",
    kicker: "AI · Document processing",
    summary: "Turns incoming PDFs and scans into validated, structured records, and routes anything uncertain to a human.",
    period: "", // TODO: e.g. "2024"
    role: "", // TODO: e.g. "Lead backend engineer"
    problem:
      "An operations team re-keyed data from hundreds of documents by hand. It was slow, error-prone, and impossible to scale without hiring. Fully automating it wasn't safe either: a wrong field in a financial record costs more than a slow one.",
    contribution: [
      "Designed the ingestion → extraction → validation pipeline end to end",
      "Built the FastAPI service and async workers that process documents in the background",
      "Defined Pydantic schemas for every document type and validated all model output against them",
      "Added a review queue so low-confidence extractions go to a person instead of the database",
    ],
    decisions: [
      {
        decision: "Treat LLM output as untrusted input",
        why: "Every response is validated against a strict schema and retried or escalated when it fails. Bad data never reaches downstream systems silently.",
      },
      {
        decision: "Human-in-the-loop instead of 100% automation",
        why: "A confidence threshold sends edge cases to review. The business gets speed on the common path and correctness on the rare one.",
      },
      {
        decision: "Idempotent jobs keyed by document hash",
        why: "Retries, duplicate uploads, and worker restarts can't create duplicate records, so the queue can be retried aggressively.",
      },
    ],
    trace: [
      { label: "Upload", detail: "web / email", kind: "client" },
      { label: "Ingest API", detail: "FastAPI", kind: "service" },
      { label: "Job queue", detail: "idempotent", kind: "queue" },
      { label: "Extract", detail: "LLM + schema", kind: "ai" },
      { label: "Records", detail: "PostgreSQL", kind: "store" },
    ],
    stack: ["Python", "FastAPI", "Pydantic", "Azure OpenAI", "PostgreSQL", "Azure Blob Storage", "Docker"],
    links: [],
  },
  {
    id: "knowledge-assistant",
    draft: true,
    title: "Permission-Aware Knowledge Assistant",
    kicker: "AI · Retrieval (RAG)",
    summary: "An internal assistant that answers questions from company documents with citations, using only documents the user is allowed to see.",
    period: "", // TODO: e.g. "2024"
    role: "", // TODO: e.g. "Forward deployed engineer"
    problem:
      "Answers existed across wikis, shared drives, and PDFs, but finding them took longer than asking a colleague. A generic chatbot wasn't acceptable: it couldn't cite sources and would happily leak documents across teams.",
    contribution: [
      "Built the ingestion pipeline: parsing, chunking, embedding, and re-indexing on change",
      "Implemented retrieval with access-control filtering tied to the company identity provider",
      "Designed the answer format with inline citations and an explicit 'I don't know' path",
      "Set up an evaluation set to catch regressions when prompts or models change",
    ],
    decisions: [
      {
        decision: "Filter by permissions before retrieval, not after generation",
        why: "The model never sees a chunk the user can't access, so there's nothing to leak. No prompt can talk its way around it.",
      },
      {
        decision: "pgvector inside PostgreSQL instead of a separate vector database",
        why: "Embeddings live next to document metadata and ACLs. One database to back up, secure, and query with joins.",
      },
      {
        decision: "No citation, no answer",
        why: "If retrieval finds nothing relevant, the assistant says so. Trust is easier to lose than to build.",
      },
    ],
    trace: [
      { label: "User", detail: "SSO", kind: "client" },
      { label: "Chat API", detail: "FastAPI", kind: "service" },
      { label: "Retrieve", detail: "pgvector + ACL", kind: "store" },
      { label: "Generate", detail: "LLM", kind: "ai" },
      { label: "Answer", detail: "with citations", kind: "client" },
    ],
    stack: ["Python", "FastAPI", "PostgreSQL", "pgvector", "Azure OpenAI", "OIDC", "Docker"],
    links: [],
  },
  {
    id: "auth-platform",
    draft: true,
    title: "Multi-Tenant Auth & API Platform",
    kicker: "Backend · Identity & APIs",
    summary: "The authentication, authorisation, and API layer behind a multi-tenant SaaS product: users, roles, API keys, and rate limits.",
    period: "", // TODO: e.g. "2024"
    role: "", // TODO: e.g. "Senior software engineer"
    problem:
      "Each new feature re-implemented its own permission checks, and one missed check meant one tenant could see another tenant's data. The product also needed API access for partners without handing out user passwords.",
    contribution: [
      "Designed a central auth service with OAuth2 / OIDC flows and short-lived JWTs",
      "Implemented role-based access control and scoped API keys for partner integrations",
      "Enforced tenant isolation in PostgreSQL with row-level security",
      "Added rate limiting and audit logging for every privileged action",
    ],
    decisions: [
      {
        decision: "Tenant isolation in the database, not only in handlers",
        why: "Row-level security means a forgotten WHERE clause returns nothing instead of someone else's data.",
      },
      {
        decision: "Short-lived access tokens with rotating refresh tokens",
        why: "A leaked token expires in minutes, and refresh-token reuse is detectable and revocable.",
      },
      {
        decision: "OpenAPI-first contracts",
        why: "Frontend and partner teams build against a published spec, so the API can evolve without surprise breakage.",
      },
    ],
    trace: [
      { label: "Client", detail: "app / partner", kind: "client" },
      { label: "Gateway", detail: "rate limit", kind: "infra" },
      { label: "Auth", detail: "OIDC · JWT", kind: "service" },
      { label: "API", detail: "FastAPI", kind: "service" },
      { label: "Tenants", detail: "Postgres RLS", kind: "store" },
    ],
    stack: ["Python", "FastAPI", "PostgreSQL", "Redis", "OAuth2 / OIDC", "AWS", "Terraform"],
    links: [],
  },
  {
    id: "azure-platform",
    draft: true,
    title: "Azure Production Platform",
    kicker: "DevOps · Cloud infrastructure",
    summary: "A repeatable path from commit to production on Azure: infrastructure as code, one pipeline, and alerts that mean something.",
    period: "", // TODO: e.g. "2024"
    role: "", // TODO: e.g. "DevOps engineer"
    problem:
      "Deployments were manual, environments had drifted apart, and the team found out about outages from customers. Every release was a small act of courage.",
    contribution: [
      "Codified all environments in Terraform so staging and production are built the same way",
      "Built CI/CD that tests, scans, and builds one container image promoted across environments",
      "Moved secrets to Key Vault with managed identities, so there are no credentials in pipelines or code",
      "Set up dashboards and alerts on latency and error rates, plus a documented rollback path",
    ],
    decisions: [
      {
        decision: "Build once, promote everywhere",
        why: "The image tested in staging is byte-for-byte the one that reaches production. 'Works in staging' finally means something.",
      },
      {
        decision: "Alert on symptoms, not causes",
        why: "Pages fire on what users feel (latency and errors), not on CPU spikes that fix themselves. Fewer alerts, taken seriously.",
      },
      {
        decision: "Rollback is a first-class deployment",
        why: "Reverting is the same pipeline with a previous image tag, rehearsed before it's needed.",
      },
    ],
    trace: [
      { label: "Commit", detail: "git push", kind: "client" },
      { label: "CI", detail: "test · scan · build", kind: "infra" },
      { label: "Registry", detail: "one image", kind: "store" },
      { label: "Staging", detail: "Container Apps", kind: "service" },
      { label: "Production", detail: "monitored", kind: "service" },
    ],
    stack: ["Azure Container Apps", "Terraform", "GitHub Actions", "Docker", "Key Vault", "Azure Monitor"],
    links: [],
  },
];
