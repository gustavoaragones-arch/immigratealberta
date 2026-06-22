import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { getLanguageCityCombos } from "@/lib/language-filter";
import { getAllCityServiceCombos, getAllCitySlugs } from "@/lib/queries";

const BASE = "https://immigratealberta.ca";

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
  const citySlugs = await getAllCitySlugs();
  const cityPages: MetadataRoute.Sitemap = citySlugs.map((slug) => ({
    url: `${BASE}/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // ── City + service filtered pages ─────────────────────────────────────────
  const combos = await getAllCityServiceCombos();
  const cityServicePages: MetadataRoute.Sitemap = combos.map((c) => ({
    url: `${BASE}/${c.city}/${c.serviceUrlSlug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const languageCombos = await getLanguageCityCombos();
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
