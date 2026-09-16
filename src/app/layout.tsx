import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { links, profile, seo, stack } from "@/content/site";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AppShell } from "@/components/app-shell";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: seo.title,
  description: seo.description,
  keywords: seo.keywords,
  category: "technology",
  alternates: { canonical: "/" },
  authors: [{ name: profile.name, url: siteUrl }],
  creator: profile.name,
  openGraph: { type: "website", url: "/", title: seo.title, description: profile.description, siteName: profile.name, locale: "en_US" },
  twitter: { card: "summary_large_image", title: seo.title, description: profile.description },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark",
};

// Skills for search engines: technical toolbox tools (combined labels like "LangChain & LlamaIndex" split) plus DevOps.
const skills = [
  ...new Set([...stack.layers.filter((l) => l.id !== "delivery").flatMap((l) => l.tools.flatMap((t) => t.name.split(" & "))), "DevOps"]),
];

// ProfilePage + Person is the structured data Google documents for personal profile sites.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", "@id": `${siteUrl}/#website`, url: siteUrl, name: profile.name, description: seo.description, inLanguage: "en" },
    {
      "@type": "ProfilePage",
      "@id": `${siteUrl}/#profile`,
      url: siteUrl,
      name: seo.title,
      isPartOf: { "@id": `${siteUrl}/#website` },
      mainEntity: { "@id": `${siteUrl}/#person` },
      dateModified: seo.updated,
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: profile.name,
      jobTitle: profile.role,
      description: profile.lede,
      email: `mailto:${links.email}`,
      url: siteUrl,
      address: { "@type": "PostalAddress", addressLocality: profile.location.city, addressCountry: profile.location.countryCode },
      sameAs: [links.linkedin, links.github].filter(Boolean),
      knowsAbout: skills,
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink"
        >
          Skip to content
        </a>
        <Header />
        {children}
        <Footer />
        <AppShell />
        <Analytics />
        <SpeedInsights />
        <script
          type="application/ld+json"
          // Static, author-controlled data; `<` escaped so content can never close the tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
