import type { MetadataRoute } from "next";
import { seo } from "@/content/site";
import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  // A fixed content date, not the build time: Google only trusts lastmod when it changes with the content.
  return [{ url: siteUrl, lastModified: seo.updated }];
}
