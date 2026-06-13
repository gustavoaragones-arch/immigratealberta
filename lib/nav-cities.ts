import { supabase } from "@/lib/supabase";

export type NavCity = {
  slug: string;
  name: string;
  consultantCount: number;
};

/**
 * Fetch cities to show in nav (header, footer, decision-tool dropdown).
 *
 * Returns only cities with is_active=true, sorted by the number of
 * published consultants whose primary_city_slug matches, descending.
 *
 * If Supabase is unreachable, returns an empty array — the nav will
 * still render, just without city links. The page itself isn't broken.
 */
export async function getNavCities(): Promise<NavCity[]> {
  const { data: cities } = await supabase
    .from("cities")
    .select("slug, name")
    .eq("is_active", true);

  if (!cities || cities.length === 0) return [];

  const { data: counts } = await supabase
    .from("consultants")
    .select("primary_city_slug")
    .eq("status", "published")
    .in(
      "primary_city_slug",
      cities.map((c) => c.slug),
    );

  const tally: Record<string, number> = {};
  for (const row of counts ?? []) {
    const k = row.primary_city_slug as string;
    tally[k] = (tally[k] ?? 0) + 1;
  }

  return cities
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      consultantCount: tally[c.slug] ?? 0,
    }))
    .sort((a, b) => {
      if (b.consultantCount !== a.consultantCount) {
        return b.consultantCount - a.consultantCount;
      }
      return a.name.localeCompare(b.name);
    });
}
