/**
 * Absolute origin for metadata, JSON-LD, robots.txt and sitemap.xml. Server-only, read at build time.
 * NEXT_PUBLIC_SITE_URL wins; on Vercel the production domain is picked up automatically.
 * `||`, not `??`: an env var set to "" must fall through too.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/+$/, "");
