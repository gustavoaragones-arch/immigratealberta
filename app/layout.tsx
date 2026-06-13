import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";

import "./globals.css";
import { cn } from "@/lib/utils";
import { getNavCities } from "@/lib/nav-cities";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

const sourceSerif4 = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-serif",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  // metadataBase is required for Next.js to resolve absolute URLs in
  // canonical / OpenGraph / Twitter card image fields.
  metadataBase: new URL("https://immigratealberta.ca"),

  title: {
    default: "ImmigrateAlberta — Verified RCIC Directory for Alberta",
    template: "%s · ImmigrateAlberta",
  },
  description:
    "A trust-verified directory of Regulated Canadian Immigration Consultants (RCICs) in Alberta. Every consultant manually checked against the CICC public registry.",

  // Search-engine indexing directives
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },

  // Open Graph defaults (individual pages override these)
  openGraph: {
    type: "website",
    siteName: "ImmigrateAlberta",
    locale: "en_CA",
    url: "https://immigratealberta.ca",
  },

  // Twitter / X card
  twitter: {
    card: "summary",
    site: "@immigrateab", // update when/if you create the account
  },

  // ── Search Console verification ──────────────────────────────────────────
  // How to get your verification codes:
  //   Google: https://search.google.com/search-console → Add property →
  //           choose "URL prefix" → verify via "HTML tag" → copy the content=
  //           value from the <meta> tag they show you.
  //   Bing:   https://www.bing.com/webmasters → Add site → "HTML Meta Tag" →
  //           copy the content= value.
  //
  // Then add to Vercel env vars (Settings → Environment Variables):
  //   GOOGLE_SITE_VERIFICATION   ← no NEXT_PUBLIC_ prefix needed
  //   BING_SITE_VERIFICATION
  //
  // These render as <meta name="google-site-verification" …> in <head>.
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cities = await getNavCities();

  return (
    <html
      lang="en"
      className={cn("theme", sourceSerif4.variable, inter.variable, "font-sans")}
    >
      <body
        className={`${inter.className} flex min-h-screen flex-col bg-[#faf9f7] font-sans`}
      >
        <SiteHeader cities={cities} />
        <div className="flex-1">{children}</div>
        <SiteFooter cities={cities} />
      </body>
    </html>
  );
}
