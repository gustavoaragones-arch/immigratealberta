import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { getLanguageCityCombos } from "@/lib/language-filter";
import {
  getActiveCitySlugs,
  getAllCityServiceCombos,
  getServiceMatchCount,
} from "@/lib/queries";

const BASE = "https://immigratealberta.ca";

// Refresh hourly, same as the service pages, so the sitemap and their
// noindex decisions stay in step.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ── Static pages ──────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE}/decision-tool`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/for-consultants`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE}/languages`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/alberta-immigration-lawyers`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${BASE}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // ── City index pages ───────────────────────────────────────────────────────
  // Inactive cities are noindexed, so leave out all of their URLs.
  const citySlugs = await getActiveCitySlugs();
  const activeCities = new Set(citySlugs);
  const cityPages: MetadataRoute.Sitemap = citySlugs.map((slug) => ({
    url: `${BASE}/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // ── City + service filtered pages ─────────────────────────────────────────
  // Zero-match combos are noindexed, so leave them out.
  const allCombos = (await getAllCityServiceCombos()).filter((c) =>
    activeCities.has(c.city),
  );
  const matchCounts = await Promise.all(
    allCombos.map((c) =>
      getServiceMatchCount(c.city, c.serviceUrlSlug.replace(/-consultants$/, "")),
    ),
  );
  const combos = allCombos.filter((_, i) => matchCounts[i] > 0);
  const cityServicePages: MetadataRoute.Sitemap = combos.map((c) => ({
    url: `${BASE}/${c.city}/${c.serviceUrlSlug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const languageCombos = (await getLanguageCityCombos()).filter((c) =>
    activeCities.has(c.city_slug),
  );
  const languagePages: MetadataRoute.Sitemap = languageCombos.map((c) => ({
    url: `${BASE}/${c.city_slug}/by-language/${c.lang_code}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // ── Consultant profile pages ───────────────────────────────────────────────
  const { data: consultants } = await supabase
    .from("consultants")
    .select("slug, cicc_verified_on")
    .eq("status", "published")
    .order("full_name", { ascending: true });

  const consultantPages: MetadataRoute.Sitemap = (consultants ?? []).map(
    (c) => ({
      url: `${BASE}/consultant/${c.slug}`,
      lastModified: c.cicc_verified_on ? new Date(c.cicc_verified_on) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }),
  );

  return [
    ...staticPages,
    ...cityPages,
    ...cityServicePages,
    ...languagePages,
    ...consultantPages,
  ];
}
